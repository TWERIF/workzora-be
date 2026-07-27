import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, LessThan, Repository } from "typeorm";
import { CreateEscrowDto } from "./dto/invoice.dto";
import { EscrowStatus, Invoice, WonDispute } from "./entities/invoice.entity";
import { MonobankService } from "./monobank.service";

const COMMISSION_RATE = 0.08;

type PollStatus = "processing" | "success" | "failure";

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice) private readonly repo: Repository<Invoice>,
        private readonly dataSource: DataSource,
        private readonly mono: MonobankService,

        @Inject('RABBIT_MQ_CLIENT')
        private readonly rabbitClient: ClientProxy,
    ) { }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async reconcilePendingInvoices(): Promise<void> {
        const cutoff = new Date(Date.now() - 15 * 60 * 1000);

        const pending = await this.repo.find({
            where: {
                status: EscrowStatus.CREATED,
                createdAt: LessThan(new Date()),
            },
        });

        for (const invoice of pending) {
            try {
                const monoStatus = await this.mono.checkStatus(invoice.monobankInvoiceId);
                await this.handleStatusUpdate(invoice.monobankInvoiceId, monoStatus.status);
            } catch (error) {
                console.error(`Reconcile failed for invoice ${invoice.monobankInvoiceId}`, error);
            }
        }
    }

    async createEscrow(dto: CreateEscrowDto) {
        const existing = await this.repo.findOne({
            where: { projectId: dto.projectId, clientId: dto.clientId, freelancerId: dto.freelancerId },
        });
        if (existing) {
            throw new ConflictException("Escrow for this project/client/freelancer already exists");
        }
        const destination = (dto.description ?? "Оплата послуги").slice(0, 458);
        const redirectUrl = `${process.env.FRONTEND_URL}/${"en"}/chats/${dto.projectId}`;

        const { invoiceId, pageUrl } = await this.mono.createDebitInvoice(
            dto.amount,
            dto.projectId,
            destination,
            redirectUrl
        );

        const invoice = await this.repo.save(
            this.repo.create({
                monobankInvoiceId: invoiceId,
                amount: dto.amount,
                currencyCode: dto.currencyCode,
                projectId: dto.projectId,
                clientId: dto.clientId,
                freelancerId: dto.freelancerId,
                status: EscrowStatus.CREATED,
                commissionAmount: Math.round(dto.amount * COMMISSION_RATE)
            }),
        );

        return {
            ...invoice,
            invoiceId: invoice.monobankInvoiceId,
            pageUrl,
        };
    }

    async getById(id: string): Promise<Invoice> {
        const invoice = await this.repo.findOne({ where: { id } });
        if (!invoice) throw new NotFoundException("Invoice not found");
        return invoice;
    }

    async getByProjectId(id: string): Promise<Invoice> {
        const invoice = await this.repo.findOne({ where: { projectId: id } });
        if (!invoice) throw new NotFoundException("Invoice not found");
        return invoice;
    }

    private async getByMonobankInvoiceId(monobankInvoiceId: string): Promise<Invoice> {
        const invoice = await this.repo.findOne({ where: { monobankInvoiceId } });
        if (!invoice) throw new NotFoundException(`Invoice ${monobankInvoiceId} not found`);
        return invoice;
    }

    async handleStatusUpdate(monobankInvoiceId: string, monoStatus: string): Promise<void> {
        const invoice = await this.getByMonobankInvoiceId(monobankInvoiceId);

        if (monoStatus === "success") {
            if (invoice.status !== EscrowStatus.CREATED) return;
            invoice.status = EscrowStatus.HELD;
            await this.repo.save(invoice);

            this.notifyProjectInProgress(invoice.projectId);
        } else if (monoStatus === "failure" || monoStatus === "expired") {
            if (invoice.status !== EscrowStatus.CREATED) return;
            invoice.status = EscrowStatus.EXPIRED;
            await this.repo.save(invoice);
        }
    }

    private notifyProjectInProgress(projectId: string): void {
        try {
            this.rabbitClient.emit("projects.toInProgress", { id: projectId });
        } catch (error) {
            console.error(`Failed to notify projects.toInProgress for ${projectId}`, error);
        }
    }
    async getStatus(monobankInvoiceId: string): Promise<{ status: PollStatus; escrow?: Invoice }> {
        let invoice = await this.getByMonobankInvoiceId(monobankInvoiceId);

        if (invoice.status === EscrowStatus.CREATED) {
            const monoStatus = await this.mono.checkStatus(monobankInvoiceId);
            await this.handleStatusUpdate(monobankInvoiceId, monoStatus.status);
            invoice = await this.getByMonobankInvoiceId(monobankInvoiceId);
        }

        return {
            status: this.toPollStatus(invoice.status),
            escrow: invoice.status === EscrowStatus.HELD ? invoice : undefined,
        };
    }

    private toPollStatus(status: EscrowStatus): PollStatus {
        if (status === EscrowStatus.EXPIRED) return "failure";
        if (status === EscrowStatus.CREATED) return "processing";
        // HELD, CAPTURED, DISPUTED, REFUNDED, PAID_OUT all mean the payment
        // itself succeeded — the frontend only cares that funds moved.
        return "success";
    }

    async confirmByClient(id: string, clientId: string): Promise<Invoice> {
        const invoice = await this.getById(id);
        if (invoice.clientId !== clientId) {
            throw new ForbiddenException("Only the client of this escrow can confirm it");
        }
        if (invoice.status !== EscrowStatus.HELD) {
            throw new BadRequestException(`Cannot confirm invoice in status ${EscrowStatus[invoice.status]}`);
        }

        invoice.commissionAmount = Math.round(invoice.amount * COMMISSION_RATE);
        invoice.status = EscrowStatus.CAPTURED;
        await this.repo.save(invoice);

        await this.payout(invoice.id);
        return this.getById(invoice.id);
    }

    async openDispute(id: string, initiatorId: string, reason: string): Promise<Invoice> {
        const invoice = await this.getById(id);
        if (![invoice.clientId, invoice.freelancerId].includes(initiatorId)) {
            throw new ForbiddenException("Only a party of this escrow can open a dispute");
        }
        if (invoice.status !== EscrowStatus.HELD) {
            throw new BadRequestException(`Cannot dispute invoice in status ${EscrowStatus[invoice.status]}`);
        }

        invoice.status = EscrowStatus.DISPUTED;
        invoice.disputeReason = reason;
        return this.repo.save(invoice);
    }

    async resolveDispute(id: string, adminId: string, decision: WonDispute, note?: string): Promise<Invoice> {
        const invoice = await this.getById(id);
        if (invoice.status !== EscrowStatus.DISPUTED) {
            throw new BadRequestException(`Invoice is not in DISPUTED status`);
        }

        invoice.wonDispute = decision;
        if (note) invoice.disputeReason = `${invoice.disputeReason ?? ""}\n[admin ${adminId}]: ${note}`;

        if (decision === WonDispute.CLIENT) {
            await this.mono.refund(invoice.monobankInvoiceId);
            invoice.status = EscrowStatus.REFUNDED;
            await this.repo.save(invoice);
        } else {
            invoice.commissionAmount = Math.round(invoice.amount * COMMISSION_RATE);
            invoice.status = EscrowStatus.CAPTURED;
            await this.repo.save(invoice);
            await this.payout(invoice.id);
        }

        return this.getById(invoice.id);
    }

    private async payout(invoiceId: string): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const invoice = await manager.getRepository(Invoice).findOne({
                where: { id: invoiceId },
                lock: { mode: "pessimistic_write" },
            });
            if (!invoice) throw new NotFoundException("Invoice not found");
            if (invoice.status !== EscrowStatus.CAPTURED) {
                return;
            }

            const payoutAmount = invoice.amount - invoice.commissionAmount;
            await this.executePayout(invoice.freelancerId, payoutAmount);

            invoice.status = EscrowStatus.PAID_OUT;
            await manager.getRepository(Invoice).save(invoice);
        });
    }

    private async executePayout(freelancerId: string, amount: number): Promise<void> {
        throw new Error("Not implemented: integrate payout provider here");
    }
}
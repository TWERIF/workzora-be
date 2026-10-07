import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, LessThan, Repository } from "typeorm";
import { CreateEscrowDto } from "./dto/invoice.dto";
import { EscrowStatus, Invoice, WonDispute } from "./entities/invoice.entity";
import { MonobankService } from "./monobank.service";
import { TransactionType } from "../wallet/entities/wallet-transaction.entity";
import { rpcError, WalletService } from "../wallet/wallet.service";

const COMMISSION_RATE = 0.08;

type PollStatus = "processing" | "success" | "failure";

@Injectable()
export class InvoicesService {
    private readonly logger = new Logger(InvoicesService.name);

    constructor(
        @InjectRepository(Invoice) private readonly repo: Repository<Invoice>,
        private readonly dataSource: DataSource,
        private readonly mono: MonobankService,
        private readonly walletService: WalletService,

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
                this.logger.error(`Reconcile failed for invoice ${invoice.monobankInvoiceId}`, error);
            }
        }
    }

    async createEscrow(dto: CreateEscrowDto) {
        const existing = await this.repo.findOne({ where: { projectId: dto.projectId } });
        if (existing && ![EscrowStatus.CREATED, EscrowStatus.EXPIRED].includes(existing.status)) {
            throw rpcError(HttpStatus.CONFLICT, "Escrow for this project is already paid");
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
            this.repo.merge(existing ?? this.repo.create(), {
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
        if (!invoice) throw rpcError(HttpStatus.NOT_FOUND, "Invoice not found");
        return invoice;
    }

    async getForUser({ id, userId, isAdmin }: { id: string; userId: string; isAdmin: boolean }): Promise<Invoice> {
        const invoice = await this.getById(id);
        if (!isAdmin && invoice.clientId !== userId && invoice.freelancerId !== userId) {
            throw rpcError(HttpStatus.FORBIDDEN, "Not a party of this escrow");
        }
        return invoice;
    }

    async getStatusForUser({ invoiceId, userId }: { invoiceId: string; userId: string }) {
        const invoice = await this.getByMonobankInvoiceId(invoiceId);
        if (invoice.clientId !== userId && invoice.freelancerId !== userId) {
            throw rpcError(HttpStatus.FORBIDDEN, "Not a party of this escrow");
        }
        return this.getStatus(invoiceId);
    }

    async syncFromMonobank(monobankInvoiceId: string) {
        await this.getByMonobankInvoiceId(monobankInvoiceId);
        const { status } = await this.mono.checkStatus(monobankInvoiceId);
        await this.handleStatusUpdate(monobankInvoiceId, status);
        return { success: true };
    }

    async getByProjectId(id: string): Promise<Invoice> {
        const invoice = await this.repo.findOne({ where: { projectId: id } });
        if (!invoice) throw rpcError(HttpStatus.NOT_FOUND, "Invoice not found");
        return invoice;
    }

    private async getByMonobankInvoiceId(monobankInvoiceId: string): Promise<Invoice> {
        const invoice = await this.repo.findOne({ where: { monobankInvoiceId } });
        if (!invoice) throw rpcError(HttpStatus.NOT_FOUND, `Invoice ${monobankInvoiceId} not found`);
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
            this.logger.error(`Failed to notify projects.toInProgress for ${projectId}`, error);
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
        return "success";
    }

    async releaseByProject(projectId: string, clientId: string): Promise<Invoice> {
        const invoice = await this.getByProjectId(projectId);
        return this.confirmByClient(invoice.id, clientId);
    }

    async confirmByClient(id: string, clientId: string): Promise<Invoice> {
        const invoice = await this.getById(id);
        if (invoice.clientId !== clientId) {
            throw rpcError(HttpStatus.FORBIDDEN, "Only the client of this escrow can confirm it");
        }
        if (invoice.status !== EscrowStatus.HELD && invoice.status !== EscrowStatus.CAPTURED) {
            throw rpcError(HttpStatus.BAD_REQUEST, `Cannot confirm invoice in status ${EscrowStatus[invoice.status]}`);
        }

        if (invoice.status === EscrowStatus.HELD) {
            invoice.commissionAmount = Math.round(invoice.amount * COMMISSION_RATE);
            invoice.status = EscrowStatus.CAPTURED;
            await this.repo.save(invoice);
        }

        await this.payout(invoice.id);
        return this.getById(invoice.id);
    }

    async openDispute(id: string, initiatorId: string, reason: string): Promise<Invoice> {
        const invoice = await this.getById(id);
        if (![invoice.clientId, invoice.freelancerId].includes(initiatorId)) {
            throw rpcError(HttpStatus.FORBIDDEN, "Only a party of this escrow can open a dispute");
        }
        if (invoice.status !== EscrowStatus.HELD) {
            throw rpcError(HttpStatus.BAD_REQUEST, `Cannot dispute invoice in status ${EscrowStatus[invoice.status]}`);
        }

        invoice.status = EscrowStatus.DISPUTED;
        invoice.disputeReason = reason;
        return this.repo.save(invoice);
    }

    async resolveDispute(id: string, adminId: string, decision: WonDispute, note?: string): Promise<Invoice> {
        const invoice = await this.getById(id);
        if (invoice.status !== EscrowStatus.DISPUTED) {
            throw rpcError(HttpStatus.BAD_REQUEST, `Invoice is not in DISPUTED status`);
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
            if (!invoice) throw rpcError(HttpStatus.NOT_FOUND, "Invoice not found");
            if (invoice.status !== EscrowStatus.CAPTURED) {
                return;
            }

            await this.walletService.credit(manager, {
                userId: invoice.freelancerId,
                amountCents: invoice.amount - invoice.commissionAmount,
                type: TransactionType.PROJECT_PAYOUT,
                projectId: invoice.projectId,
            });

            invoice.status = EscrowStatus.PAID_OUT;
            await manager.getRepository(Invoice).save(invoice);
        });
    }

    async stats({ from, to }: { from: string; to: string }) {
        const earned = [EscrowStatus.CAPTURED, EscrowStatus.PAID_OUT].map(String);
        const paid = [EscrowStatus.HELD, EscrowStatus.DISPUTED, EscrowStatus.CAPTURED, EscrowStatus.PAID_OUT].map(String);
        const day = `("updatedAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Kyiv')::date`;

        const byDay: { day: string; commission: string; volume: string }[] = await this.repo.query(
            `SELECT to_char(${day}, 'YYYY-MM-DD') AS day, sum("commissionAmount") AS commission, sum(amount) AS volume
             FROM invoice.invoice
             WHERE status::text = ANY($1) AND ${day} BETWEEN $2 AND $3
             GROUP BY 1 ORDER BY 1`,
            [earned, from, to],
        );
        const [totals]: { commission: string | null; volume: string | null }[] = await this.repo.query(
            `SELECT sum("commissionAmount") FILTER (WHERE status::text = ANY($1)) AS commission,
                    sum(amount) FILTER (WHERE status::text = ANY($2)) AS volume
             FROM invoice.invoice`,
            [earned, paid],
        );

        return {
            totalCommission: Number(totals?.commission ?? 0),
            totalVolume: Number(totals?.volume ?? 0),
            byDay: byDay.map((r) => ({ day: r.day, commission: Number(r.commission), volume: Number(r.volume) })),
        };
    }
}

import { HttpStatus, Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, FindOptionsWhere, MoreThanOrEqual, Repository } from "typeorm";
import { TransactionKind, TransactionType, WalletTransaction } from "./entities/wallet-transaction.entity";
import { Wallet } from "./entities/wallet.entity";
import { Withdrawal, WithdrawalStatus } from "./entities/withdrawal.entity";

// Everything stored in cents; the RPC boundary talks in dollars (what the UI shows).
const toUsd = (cents: number) => cents / 100;
const toCents = (usd: number) => Math.round(usd * 100);

export const MIN_WITHDRAWAL_USD = 10;

// Plain HttpExceptions reach the gateway as "Internal server error"; this keeps status + message.
export const rpcError = (statusCode: HttpStatus, message: string) => new RpcException({ statusCode, message });

@Injectable()
export class WalletService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(WalletTransaction) private readonly txRepo: Repository<WalletTransaction>,
        @InjectRepository(Withdrawal) private readonly withdrawalRepo: Repository<Withdrawal>,
    ) { }

    // Locks (and lazily creates) the wallet row so concurrent balance changes serialize.
    private async lockWallet(manager: EntityManager, userId: string): Promise<Wallet> {
        await manager
            .createQueryBuilder()
            .insert()
            .into(Wallet)
            .values({ userId })
            .orIgnore()
            .execute();

        return manager.getRepository(Wallet).findOneOrFail({
            where: { userId },
            lock: { mode: "pessimistic_write" },
        });
    }

    // Must be called inside a transaction; used by escrow payouts so the invoice status
    // change and the balance credit commit together.
    async credit(
        manager: EntityManager,
        params: { userId: string; amountCents: number; type: TransactionType; projectId?: string; description?: string },
    ): Promise<void> {
        const wallet = await this.lockWallet(manager, params.userId);
        wallet.balance += params.amountCents;
        await manager.getRepository(Wallet).save(wallet);

        await manager.getRepository(WalletTransaction).save(
            manager.getRepository(WalletTransaction).create({
                userId: params.userId,
                type: params.type,
                kind: TransactionKind.BALANCE,
                amount: params.amountCents,
                projectId: params.projectId ?? null,
                description: params.description ?? null,
            }),
        );
    }

    async getSummary(userId: string) {
        const wallet = await this.walletRepo.findOne({ where: { userId } });

        const pending = await this.withdrawalRepo
            .createQueryBuilder("w")
            .select("COALESCE(SUM(w.amount), 0)", "sum")
            .where("w.userId = :userId AND w.status = :status", { userId, status: WithdrawalStatus.PROCESSING })
            .getRawOne<{ sum: string }>();

        return {
            balance: toUsd(wallet?.balance ?? 0),
            bonus: wallet?.bonus ?? 0,
            pendingWithdrawals: toUsd(Number(pending?.sum ?? 0)),
        };
    }

    async listTransactions(userId: string, kind: TransactionKind = TransactionKind.BALANCE, from?: string) {
        const where: FindOptionsWhere<WalletTransaction> = { userId, kind };
        if (from) where.createdAt = MoreThanOrEqual(new Date(from));

        const rows = await this.txRepo.find({ where, order: { createdAt: "DESC" }, take: 200 });
        // bonuses are whole points, balance entries are cents
        return rows.map((row) => ({ ...row, amount: kind === TransactionKind.BONUS ? row.amount : toUsd(row.amount) }));
    }

    async listWithdrawals(userId: string, from?: string) {
        const where: FindOptionsWhere<Withdrawal> = { userId };
        if (from) where.createdAt = MoreThanOrEqual(new Date(from));

        const rows = await this.withdrawalRepo.find({ where, order: { createdAt: "DESC" }, take: 200 });
        return rows.map(this.serializeWithdrawal);
    }

    async createWithdrawal(params: { userId: string; amount: number; maskedCard: string }) {
        const amountCents = toCents(params.amount);
        if (!Number.isFinite(amountCents) || amountCents < toCents(MIN_WITHDRAWAL_USD)) {
            throw rpcError(HttpStatus.BAD_REQUEST, `Minimum withdrawal amount is $${MIN_WITHDRAWAL_USD}`);
        }

        const withdrawal = await this.dataSource.transaction(async (manager) => {
            const wallet = await this.lockWallet(manager, params.userId);
            if (wallet.balance < amountCents) {
                throw rpcError(HttpStatus.BAD_REQUEST, "Insufficient balance");
            }

            wallet.balance -= amountCents;
            await manager.getRepository(Wallet).save(wallet);

            const created = await manager.getRepository(Withdrawal).save(
                manager.getRepository(Withdrawal).create({
                    userId: params.userId,
                    amount: amountCents,
                    maskedCard: params.maskedCard,
                }),
            );

            await manager.getRepository(WalletTransaction).save(
                manager.getRepository(WalletTransaction).create({
                    userId: params.userId,
                    type: TransactionType.WITHDRAWAL,
                    amount: -amountCents,
                    withdrawalId: created.id,
                }),
            );

            return created;
        });

        return this.serializeWithdrawal(withdrawal);
    }

    async adminListWithdrawals(params: { status?: WithdrawalStatus; page?: number; limit?: number }) {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 10;

        const [rows, total] = await this.withdrawalRepo.findAndCount({
            where: params.status ? { status: params.status } : {},
            order: { createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: rows.map(this.serializeWithdrawal),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getWithdrawal(id: string) {
        const withdrawal = await this.withdrawalRepo.findOne({ where: { id } });
        if (!withdrawal) throw rpcError(HttpStatus.NOT_FOUND, "Withdrawal not found");
        return this.serializeWithdrawal(withdrawal);
    }

    async completeWithdrawal(id: string, adminId: string) {
        const withdrawal = await this.dataSource.transaction(async (manager) => {
            const row = await this.lockProcessingWithdrawal(manager, id);
            row.status = WithdrawalStatus.COMPLETED;
            row.processedBy = adminId;
            row.processedAt = new Date();
            return manager.getRepository(Withdrawal).save(row);
        });

        return this.serializeWithdrawal(withdrawal);
    }

    async rejectWithdrawal(id: string, adminId: string, note?: string) {
        const withdrawal = await this.dataSource.transaction(async (manager) => {
            const row = await this.lockProcessingWithdrawal(manager, id);
            row.status = WithdrawalStatus.REJECTED;
            row.processedBy = adminId;
            row.processedAt = new Date();
            row.note = note ?? null;
            await manager.getRepository(Withdrawal).save(row);

            // return the reserved funds
            const wallet = await this.lockWallet(manager, row.userId);
            wallet.balance += row.amount;
            await manager.getRepository(Wallet).save(wallet);

            await manager.getRepository(WalletTransaction).save(
                manager.getRepository(WalletTransaction).create({
                    userId: row.userId,
                    type: TransactionType.WITHDRAWAL_REFUND,
                    amount: row.amount,
                    withdrawalId: row.id,
                    description: note ?? null,
                }),
            );

            return row;
        });

        return this.serializeWithdrawal(withdrawal);
    }

    private async lockProcessingWithdrawal(manager: EntityManager, id: string) {
        const row = await manager.getRepository(Withdrawal).findOne({
            where: { id },
            lock: { mode: "pessimistic_write" },
        });
        if (!row) throw rpcError(HttpStatus.NOT_FOUND, "Withdrawal not found");
        if (row.status !== WithdrawalStatus.PROCESSING) {
            throw rpcError(HttpStatus.BAD_REQUEST, `Withdrawal is already ${row.status}`);
        }
        return row;
    }

    private serializeWithdrawal = (row: Withdrawal) => ({ ...row, amount: toUsd(row.amount) });
}

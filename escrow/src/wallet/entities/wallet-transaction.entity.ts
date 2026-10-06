import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum TransactionType {
    // escrow released to the freelancer after the client completed the project
    PROJECT_PAYOUT = "project_payout",
    // funds reserved by a withdrawal request
    WITHDRAWAL = "withdrawal",
    // reserved funds returned after an admin rejected the withdrawal
    WITHDRAWAL_REFUND = "withdrawal_refund",
    BONUS = "bonus",
}

export enum TransactionKind {
    BALANCE = "balance",
    BONUS = "bonus",
}

// Append-only ledger: every change of Wallet.balance / Wallet.bonus has a row here.
@Entity({ schema: "wallet", name: "transactions" })
export class WalletTransaction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index()
    @Column("uuid")
    userId!: string;

    @Column({ type: "enum", enum: TransactionType })
    type!: TransactionType;

    @Column({ type: "enum", enum: TransactionKind, default: TransactionKind.BALANCE })
    kind!: TransactionKind;

    // signed: positive = credit, negative = debit
    @Column({ type: "int" })
    amount!: number;

    @Column({ type: "uuid", nullable: true })
    projectId!: string | null;

    @Column({ type: "uuid", nullable: true })
    withdrawalId!: string | null;

    @Column({ type: "varchar", nullable: true })
    description!: string | null;

    @CreateDateColumn()
    createdAt!: Date;
}

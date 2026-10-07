import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum TransactionType {
    PROJECT_PAYOUT = "project_payout",
    WITHDRAWAL = "withdrawal",
    WITHDRAWAL_REFUND = "withdrawal_refund",
    BONUS = "bonus",
}

export enum TransactionKind {
    BALANCE = "balance",
    BONUS = "bonus",
}

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

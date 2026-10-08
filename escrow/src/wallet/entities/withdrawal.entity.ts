import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum WithdrawalStatus {
    PROCESSING = "processing",
    COMPLETED = "completed",
    REJECTED = "rejected",
}

@Entity({ schema: "wallet", name: "withdrawals" })
export class Withdrawal {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index()
    @Column("uuid")
    userId!: string;

    @Column({ type: "int" })
    amount!: number;

    @Column()
    maskedCard!: string;

    @Column({ type: "uuid", nullable: true })
    cardId!: string | null;

    @Column({ type: "enum", enum: WithdrawalStatus, default: WithdrawalStatus.PROCESSING })
    status!: WithdrawalStatus;

    @Column({ type: "uuid", nullable: true })
    processedBy!: string | null;

    @Column({ type: "timestamptz", nullable: true })
    processedAt!: Date | null;

    @Column({ type: "varchar", nullable: true })
    note!: string | null;

    @CreateDateColumn()
    createdAt!: Date;
}

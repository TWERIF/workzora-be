import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum WithdrawalStatus {
    PROCESSING = "processing",
    COMPLETED = "completed",
    REJECTED = "rejected",
}

// A freelancer's request to move money from the wallet to their card.
// Payouts are done manually by an admin, who then marks the request completed.
@Entity({ schema: "wallet", name: "withdrawals" })
export class Withdrawal {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index()
    @Column("uuid")
    userId!: string;

    // USD cents
    @Column({ type: "int" })
    amount!: number;

    @Column()
    maskedCard!: string;

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

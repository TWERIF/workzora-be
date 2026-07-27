import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum EscrowStatus {
    CREATED,
    HELD,
    DISPUTED,
    CAPTURED,
    PAID_OUT,
    REFUNDED,
    EXPIRED,
}

export enum WonDispute {
    CLIENT, FREELANCER
}

@Entity({ schema: "invoice" })
export class Invoice {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    monobankInvoiceId!: string;

    @Column()
    amount!: number;

    @Column()
    commissionAmount!: number;

    @Column()
    currencyCode!: number;

    @Column()
    projectId!: string;

    @Column()
    clientId!: string;

    @Column()
    freelancerId!: string;

    @Column({
        type: 'enum',
        enum: EscrowStatus,
        default: EscrowStatus.CREATED,
    })
    status!: EscrowStatus;

    @Column({
        nullable: true,
        default: null
    })
    disputeReason?: string;

    @Column({
        type: 'enum',
        enum: WonDispute,
        nullable: true
    })
    wonDispute?: WonDispute;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
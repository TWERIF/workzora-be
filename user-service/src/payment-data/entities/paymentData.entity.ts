import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'payment_datas', schema: 'payment_data' })
@Index(['userId'])
export class PaymentData {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column()
    cardNumberEncrypted!: string;

    @Column()
    cardNumberIv!: string;

    @Column()
    cardNumberAuthTag!: string;

    @Column()
    maskedCardNumber!: string;

    @Column({ type: 'varchar', length: 20, default: 'card' })
    brand!: string;

    @Column({ type: 'varchar', length: 5, nullable: true })
    expiry!: string | null;

    @Column({ default: false })
    isPrimary!: boolean;

    @UpdateDateColumn()
    updatedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}

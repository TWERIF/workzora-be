import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';


@Entity({ name: 'payment_datas', schema: 'payment_data' })
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

    @UpdateDateColumn()
    updatedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}
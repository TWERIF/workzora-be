import { Column, CreateDateColumn, Entity, Generated, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'subscribers', schema: 'newsletter' })
export class Subscriber {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 254 })
    email!: string;

    @Column({ type: 'varchar', length: 2, default: 'en' })
    locale!: string;

    @Index({ unique: true })
    @Column({ type: 'uuid' })
    @Generated('uuid')
    token!: string;

    @CreateDateColumn()
    createdAt!: Date;
}

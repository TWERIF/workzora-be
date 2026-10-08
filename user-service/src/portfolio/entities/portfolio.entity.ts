import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';


@Entity({ name: 'portfolios', schema: 'portfolio' })
export class Portfolio {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column()
    imageUrl!: string;

    @Column('simple-array', { default: '' })
    tags!: string[];

    @Column({ type: 'int', default: 0 })
    views!: number;

    @CreateDateColumn()
    createdAt!: Date;
}
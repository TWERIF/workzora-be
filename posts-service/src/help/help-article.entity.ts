import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'help_articles', schema: 'post' })
@Index(['slug', 'locale'], { unique: true })
export class HelpArticle {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @Column({ type: 'varchar', length: 40 })
    category!: string;

    @Column({ type: 'varchar', length: 120 })
    slug!: string;

    @Column({ type: 'varchar', length: 2 })
    locale!: string;

    @Column({ type: 'varchar', length: 200 })
    title!: string;

    @Column({ type: 'varchar', length: 400, default: '' })
    summary!: string;

    @Column({ type: 'text' })
    body!: string;

    @Column({ type: 'int', default: 0 })
    position!: number;

    @Column({ type: 'int', default: 1 })
    minutesToRead!: number;

    @Column({ type: 'int', default: 0 })
    helpfulYes!: number;

    @Column({ type: 'int', default: 0 })
    helpfulMaybe!: number;

    @Column({ type: 'int', default: 0 })
    helpfulNo!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

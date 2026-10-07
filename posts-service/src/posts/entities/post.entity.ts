import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';


@Entity({ name: 'posts', schema: 'post' })
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column()
    title!: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 120, nullable: true })
    slug!: string;

    @Column()
    teaser!: string;

    @Column()
    imageUrl!: string;

    @Column()
    article!: string;

    @Column()
    minutesToRead!: number;

    @Column()
    tag!: string;

    @Column({ type: 'int', default: 0 })
    views!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
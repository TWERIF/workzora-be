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

    // nullable only so the column can be added to existing rows; filled on startup
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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
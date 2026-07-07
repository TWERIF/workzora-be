import {
    Column,
    CreateDateColumn,
    Entity,
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
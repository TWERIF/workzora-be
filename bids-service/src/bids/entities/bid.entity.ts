import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity({ schema: "bid" })
@Unique(['projectId', 'userId'])
export class Bid {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    description!: string;

    @Column()
    price!: number;

    @Column()
    time!: number;

    @Column()
    projectId!: string;

    @Column()
    userId!: string;

    @Column({ default: 3 })
    maxEdits!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
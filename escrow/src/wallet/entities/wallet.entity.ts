import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ schema: "wallet", name: "wallets" })
export class Wallet {
    @PrimaryColumn("uuid")
    userId!: string;

    @Column({ type: "int", default: 0 })
    balance!: number;

    @Column({ type: "int", default: 0 })
    bonus!: number;

    @UpdateDateColumn()
    updatedAt!: Date;
}

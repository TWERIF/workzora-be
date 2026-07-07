import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';

export enum VerificationStatus {
    NOT_VERIFIED = 'not_verified',
    IN_PROGRESS = 'in_progress',
    VERIFIED = 'verified'
}

@Entity({ name: 'account_verifications', schema: 'account_verification' })
export class AccoutVerification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column()
    documentUrl!: string;

    @Column()
    selfieUrl!: string;

    @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.NOT_VERIFIED })
    status!: VerificationStatus;

    @CreateDateColumn()
    createdAt!: Date;
}
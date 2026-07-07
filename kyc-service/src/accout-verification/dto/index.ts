import { VerificationStatus } from "../entities/account-verification.entity";

export interface CreateAccountVerification {
    userId: string;
    documentUrl: string;
    selfieUrl: string;
}

export interface VerifyAccount {
    id: string;
    status: VerificationStatus;
}
import type { User } from "@/pages/auth/model/types";

export const VerificationStatus = {
    NOT_VERIFIED: 'not_verified',
    IN_PROGRESS: 'in_progress',
    VERIFIED: 'verified',
} as const;

export type VerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];

export interface Verification {
    id: string;
    documentUrl: string;
    selfieUrl: string;
    status: VerificationStatus;
    user: User;
    createdAt: Date;
}
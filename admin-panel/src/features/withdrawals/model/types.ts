export type WithdrawalStatus = "processing" | "completed" | "rejected";

export interface WithdrawalUser {
    id: string;
    email?: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
}

export interface Withdrawal {
    id: string;
    userId: string;
    amount: number;
    maskedCard: string;
    status: WithdrawalStatus;
    processedBy: string | null;
    processedAt: string | null;
    note: string | null;
    createdAt: string;
    user: WithdrawalUser | null;
}

export interface WithdrawalDetails extends Withdrawal {
    cardNumber: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

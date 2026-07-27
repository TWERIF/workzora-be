export interface Escrow {
    id: string;
    title: string;
    clientId: string;
    freelancerId: string;
    createdAt: string;
    updatedAt: string;
    status: number;
    monobankInvoiceId: string;
    amount: number;
    commissionAmount: number;
    currencyCode: number;
    projectId: string;
    disputeReason: string | null;
    wonDispute: boolean | null;
    card: string;
}

export interface Category {
    id: string;
    title: string;
    description: string;
}

export type ProjectStatus = 'completed' | 'in_progress' | 'pending' | 'cancelled';

export interface Project {
    id: string;
    title: string;
    description: string;
    categories: Category[];
    price: string;
    clientId: string;
    freelancerId: string;
    createdAt: string;
    updatedAt: string;
    views: number;
    status: ProjectStatus;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: string;
    limit: string;
    totalPages: number;
}

export type ProjectsResponse = PaginatedResponse<Project>;
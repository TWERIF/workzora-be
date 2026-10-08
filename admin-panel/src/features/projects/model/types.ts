export type ProjectStatus = "open" | "awaiting_payment" | "in_progress" | "completed" | "closed";

export interface AdminProject {
    id: string;
    title: string;
    description: string;
    price: string;
    status: ProjectStatus;
    clientId: string;
    freelancerId: string | null;
    createdAt: string;
    proposalsCount?: number;
    isFeatured: boolean;
    isUrgent: boolean;
    categories: { id: string; title: string }[];
}

export interface PaginatedProjects {
    data: AdminProject[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type TicketStatus = "open" | "closed";

export interface Ticket {
    id: string;
    userId: string | null;
    name: string;
    email: string;
    status: TicketStatus;
    closedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    author: "user" | "admin";
    authorId: string | null;
    content: string;
    createdAt: string;
}

export interface TicketDetails extends Ticket {
    messages: TicketMessage[];
}

export interface TicketStats {
    open: number;
    closed: number;
    closedMonth: number;
    closedToday: number;
}

export interface PaginatedTickets {
    data: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

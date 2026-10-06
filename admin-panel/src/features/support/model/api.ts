import { api } from "@/shared/http";
import type { PaginatedTickets, TicketDetails, TicketMessage, TicketStats, TicketStatus } from "./types";

export const findTickets = async (params: { status: TicketStatus; page: number; limit: number }) =>
    (await api.get<PaginatedTickets>("/support/admin/tickets", { params })).data;

export const findTicket = async (id: string) => (await api.get<TicketDetails>(`/support/admin/tickets/${id}`)).data;

export const replyToTicket = async ({ id, content }: { id: string; content: string }) =>
    (await api.post<TicketMessage>(`/support/admin/tickets/${id}/reply`, { content })).data;

export const closeTicket = async (id: string) => (await api.patch(`/support/admin/tickets/${id}/close`)).data;

export const getTicketStats = async () => (await api.get<TicketStats>("/support/admin/stats")).data;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { closeTicket, findTicket, findTickets, getTicketStats, replyToTicket } from "./api";
import type { TicketStatus } from "./types";

export const SUPPORT_KEYS = {
    all: ["support"] as const,
    list: (params: { status: TicketStatus; page: number; limit: number }) => [...SUPPORT_KEYS.all, "list", params] as const,
    detail: (id: string) => [...SUPPORT_KEYS.all, "detail", id] as const,
    stats: () => [...SUPPORT_KEYS.all, "stats"] as const,
};

export const useTickets = (params: { status: TicketStatus; page: number; limit: number }) =>
    useQuery({
        queryKey: SUPPORT_KEYS.list(params),
        queryFn: () => findTickets(params),
        placeholderData: (previousData) => previousData,
        refetchInterval: 30_000,
    });

export const useTicket = (id: string | null) =>
    useQuery({
        queryKey: SUPPORT_KEYS.detail(id ?? ""),
        queryFn: () => findTicket(id!),
        enabled: !!id,
    });

export const useTicketStats = () => useQuery({ queryKey: SUPPORT_KEYS.stats(), queryFn: getTicketStats });

const useInvalidateSupport = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: SUPPORT_KEYS.all });
};

export const useReplyToTicket = () => {
    const invalidate = useInvalidateSupport();
    return useMutation({ mutationFn: replyToTicket, onSuccess: invalidate });
};

export const useCloseTicket = () => {
    const invalidate = useInvalidateSupport();
    return useMutation({ mutationFn: closeTicket, onSuccess: invalidate });
};

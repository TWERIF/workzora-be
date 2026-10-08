import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createHelpArticle, deleteHelpArticle, findHelpArticles, getHelpArticle, updateHelpArticle } from "./api";
import type { HelpAdminQuery } from "./types";

const KEYS = {
    all: ["admin-help"] as const,
    list: (query: HelpAdminQuery) => [...KEYS.all, "list", query] as const,
    one: (id: string) => [...KEYS.all, "one", id] as const,
};

export const useHelpArticles = (query: HelpAdminQuery) =>
    useQuery({ queryKey: KEYS.list(query), queryFn: () => findHelpArticles(query), placeholderData: (previous) => previous });

export const useHelpArticle = (id?: string) =>
    useQuery({ queryKey: KEYS.one(id ?? ""), queryFn: () => getHelpArticle(id ?? ""), enabled: Boolean(id) });

const useInvalidate = () => {
    const client = useQueryClient();
    return () => client.invalidateQueries({ queryKey: KEYS.all });
};

export const useSaveHelpArticle = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: ({ id, body }: { id?: string; body: Parameters<typeof createHelpArticle>[0] }) => (id ? updateHelpArticle({ id, body }) : createHelpArticle(body)),
        onSuccess: invalidate,
    });
};

export const useDeleteHelpArticle = () => {
    const invalidate = useInvalidate();
    return useMutation({ mutationFn: deleteHelpArticle, onSuccess: invalidate });
};

import { api } from "@/shared/http";
import type { AdminChatsResponse, ChatMessage } from "./types";

export const findAllChats = async ({
    page = 1,
    limit = 20,
}: {
    page: number;
    limit: number;
}): Promise<AdminChatsResponse> => {
    return (
        await api.get("/chat/all", {
            params: {
                page,
                limit,
            },
        })
    ).data;
};

export const findChatMessages = async ({
    chatId,
    amount = 100,
    before,
}: {
    chatId: string;
    amount?: number;
    before?: string;
}): Promise<ChatMessage[]> => {
    return (
        await api.get(`/chat/${chatId}/messages`, {
            params: {
                amount,
                before,
            },
        })
    ).data;
};
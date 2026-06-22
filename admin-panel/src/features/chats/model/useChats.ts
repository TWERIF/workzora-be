import { useQuery } from "@tanstack/react-query";
import { findAllChats, findChatMessages } from "./api";

export const CHAT_ADMIN_KEYS = {
    all: ["admin-chats"] as const,

    lists: () => [...CHAT_ADMIN_KEYS.all, "list"] as const,

    list: (params: {
        page: number;
        limit: number;
    }) =>
        [...CHAT_ADMIN_KEYS.lists(), params] as const,

    messages: () =>
        [...CHAT_ADMIN_KEYS.all, "messages"] as const,

    messageList: (
        chatId: string,
        amount: number,
    ) =>
        [
            ...CHAT_ADMIN_KEYS.messages(),
            chatId,
            amount,
        ] as const,
};

export const useAdminChats = (
    params: {
        page: number;
        limit: number;
    } = {
            page: 1,
            limit: 20,
        },
) => {
    return useQuery({
        queryKey: CHAT_ADMIN_KEYS.list(params),
        queryFn: () => findAllChats(params),
        placeholderData: previous => previous,
        retry: false
    });
};

export const useAdminChatMessages = (
    chatId?: string,
    amount = 100,
) => {
    return useQuery({
        queryKey: CHAT_ADMIN_KEYS.messageList(
            chatId || "",
            amount,
        ),
        queryFn: () =>
            findChatMessages({
                chatId: chatId!,
                amount,
            }),
        enabled: !!chatId,
        retry: false
    });
};
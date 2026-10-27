import { useLayoutEffect, useRef } from "react";
import { ArrowLeft, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAdminChatMessages } from "../model/useChats";
import type { AdminChat } from "../model/types";

interface ChatPageProps {
    chat?: AdminChat | null;
    onBack: () => void;
}

export default function ChatPage({
    chat,
    onBack,
}: ChatPageProps) {
    const {
        data: messages,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useAdminChatMessages(chat?.id);

    const scrollRef = useRef<HTMLDivElement>(null);
    const prevScrollHeightRef = useRef<number | null>(null);
    const scrolledChatIdRef = useRef<string | null>(null);

    useLayoutEffect(() => {
        const container = scrollRef.current;
        if (!container || !messages || !chat) return;

        if (scrolledChatIdRef.current !== chat.id) {
            scrolledChatIdRef.current = chat.id;
            prevScrollHeightRef.current = null;
            container.scrollTop = container.scrollHeight;
            return;
        }

        if (prevScrollHeightRef.current !== null) {
            container.scrollTop += container.scrollHeight - prevScrollHeightRef.current;
            prevScrollHeightRef.current = null;
        }
    }, [messages, chat]);

    const loadOlder = () => {
        prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? null;
        void fetchNextPage();
    };

    if (!chat) {
        return (
            <div className="h-full hidden md:flex items-center justify-center text-muted-foreground">
                Оберіть чат
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 flex flex-col">
            <div className="border-b px-4 md:px-6 py-4 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden"
                    onClick={onBack}
                >
                    <ArrowLeft />
                </Button>

                <div className="min-w-0">
                    <h2 className="font-semibold truncate">
                        {chat.projectTitle || "Без проєкту"}
                    </h2>

                    <p className="text-sm text-muted-foreground truncate">
                        {chat.client.name ?? "—"} ↔ {chat.freelancer.name ?? "—"}
                    </p>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
            >
                <div className="p-4 md:p-6 flex flex-col gap-4">
                    {isLoading && (
                        <p className="text-muted-foreground">
                            Завантаження...
                        </p>
                    )}

                    {hasNextPage && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="self-center"
                            disabled={isFetchingNextPage}
                            onClick={loadOlder}
                        >
                            {isFetchingNextPage
                                ? "Завантаження..."
                                : "Показати попередні"}
                        </Button>
                    )}

                    {!isLoading && !messages?.length && (
                        <p className="text-muted-foreground text-center">
                            Повідомлень немає
                        </p>
                    )}

                    {messages?.map((message) => (
                        <div
                            key={message.id}
                            className="flex gap-3"
                        >
                            <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage
                                    src={message.senderAvatar || ""}
                                />

                                <AvatarFallback>
                                    {message.senderName?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                    {message.senderName}
                                </p>

                                {message.content && (
                                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                                        {message.content}
                                    </p>
                                )}

                                {message.fileUrl && (
                                    <a
                                        href={message.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm mt-1 inline-flex items-center gap-1 text-primary underline underline-offset-4 break-all"
                                    >
                                        <Paperclip className="size-3.5 shrink-0" />
                                        Вкладення
                                    </a>
                                )}

                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(
                                        message.createdAt,
                                    ).toLocaleString("uk-UA")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

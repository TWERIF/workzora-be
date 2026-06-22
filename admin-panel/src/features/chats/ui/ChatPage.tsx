import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminChatMessages } from "../model/useChats";
import type { AdminChat } from "../model/types"; 

interface ChatPageProps {
    chat?: AdminChat;
}

export default function ChatPage({
    chat,
}: ChatPageProps) {
    const { data: messages, isLoading } =
        useAdminChatMessages(chat?.id);

    if (!chat) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Оберіть чат
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="border-b px-6 py-4">
                <h2 className="font-semibold">
                    {chat.projectTitle}
                </h2>

                <p className="text-sm text-muted-foreground">
                    {chat.client.name} ↔ {chat.freelancer.name}
                </p>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 flex flex-col gap-4">
                    {isLoading && (
                        <p className="text-muted-foreground">
                            Завантаження...
                        </p>
                    )}

                    {messages?.map((message) => (
                        <div
                            key={message.id}
                            className="flex gap-3"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={message.senderAvatar || ""}
                                />

                                <AvatarFallback>
                                    {message.senderName?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <p className="text-sm font-medium">
                                    {message.senderName}
                                </p>

                                <p className="text-sm mt-1">
                                    {message.content}
                                </p>

                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(
                                        message.createdAt,
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
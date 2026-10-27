import { useState } from "react";
import ChatList from "../../features/chats/ui/ChatList";
import ChatPage from "../../features/chats/ui/ChatPage";
import { useAdminChats } from "../../features/chats/model/useChats";
import type { AdminChat } from "../../features/chats/model/types";

export default function AdminChatsView() {
    const [page, setPage] = useState(1);

    const [selectedChat, setSelectedChat] =
        useState<AdminChat | null>(null);

    const { data, isLoading } =
        useAdminChats({
            page,
            limit: 20,
        });

    if (isLoading) {
        return <div>Завантаження...</div>;
    }

    return (
        <div className="mt-10 px-4 md:px-[5%] lg:px-[10%] py-4 md:py-[1%]">
            <div className="h-[calc(100dvh-100px)] grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[360px_1fr] border rounded-xl overflow-hidden">
                <div className={`min-h-0 md:border-r ${selectedChat ? "hidden md:block" : ""}`}>
                    <ChatList
                        chats={data?.data || []}
                        selectedChatId={selectedChat?.id}
                        onSelect={setSelectedChat}
                        page={page}
                        total={data?.total || 0}
                        limit={20}
                        onPageChange={setPage}
                    />
                </div>

                <div className={`min-h-0 ${selectedChat ? "" : "hidden md:block"}`}>
                    <ChatPage
                        chat={selectedChat}
                        onBack={() => setSelectedChat(null)}
                    />
                </div>
            </div>
        </div>
    );
}   
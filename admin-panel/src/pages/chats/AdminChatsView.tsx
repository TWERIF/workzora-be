import { useState } from "react";
import ChatList from "../../features/chats/ui/ChatList";
import ChatPage from "../../features/chats/ui/ChatPage";
import { useAdminChats } from "../../features/chats/model/useChats";
import type { AdminChat } from "../../features/chats/model/types";

export default function AdminChatsView() {
    const [page, setPage] = useState(1);

    const [selectedChat, setSelectedChat] =
        useState<AdminChat>();

    const { data, isLoading } =
        useAdminChats({
            page,
            limit: 20,
        });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="px-[10%] py-[1%]">
            <div className="h-[calc(100vh-100px)] grid grid-cols-[360px_1fr] border rounded-xl overflow-hidden">
                <ChatList
                    chats={data?.data || []}
                    selectedChatId={selectedChat?.id}
                    onSelect={setSelectedChat}
                    page={page}
                    total={data?.total || 0}
                    limit={20}
                    onPageChange={setPage}
                />

                <ChatPage chat={selectedChat} />
            </div>
        </div>
    );
}
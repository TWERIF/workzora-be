import ChatItem from "./ChatItem";
import type { AdminChat } from "../model/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatListProps {
  chats: AdminChat[];
  selectedChatId?: string;
  onSelect: (chat: AdminChat | null) => void;

  page: number;
  total: number;
  limit: number;

  onPageChange: (page: number) => void;
}

export default function ChatList({
  chats,
  selectedChatId,
  onSelect,
  page,
  total,
  limit,
  onPageChange,
}: ChatListProps) {
  const totalPages = Math.ceil(total / limit);

  const selectChat = (chat: AdminChat) => {
    if (!(selectedChatId === chat.id)) {
      onSelect(chat);
    } else {
      onSelect(null);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-3 text-sm text-muted-foreground">
        Всього чатів: {total}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 flex flex-col gap-2">
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              selected={selectedChatId === chat.id}
              onClick={() => selectChat(chat)}
            />
          ))}
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="border-t p-3 flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="border rounded px-3 py-1"
          >
            ←
          </button>

          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="border rounded px-3 py-1"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
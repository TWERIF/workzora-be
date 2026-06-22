import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { AdminChat } from "../model/types";

interface ChatItemProps {
    chat: AdminChat;
    selected?: boolean;
    onClick: () => void;
}

export default function ChatItem({
    chat,
    selected,
    onClick,
}: ChatItemProps) {
    return (
        <Card
            onClick={onClick}
            className={`
        cursor-pointer
        p-4
        transition-colors
        hover:bg-muted/50
        ${selected ? "border-primary" : ""}
      `}
        >
            <div className="flex gap-3 items-start">
                <Avatar>
                    <AvatarImage src={chat.client.avatarUrl || ""} />
                    <AvatarFallback>
                        {chat.client.name[0]}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                        <h4 className="font-medium truncate">
                            {chat.projectTitle || "Без проєкту"}
                        </h4>

                        {chat.isUnread && (
                            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {chat.client.name} ↔ {chat.freelancer.name}
                    </p>

                    <p className="text-sm text-muted-foreground truncate mt-1">
                        {chat.topic}
                    </p>
                </div>
            </div>
        </Card>
    );
}
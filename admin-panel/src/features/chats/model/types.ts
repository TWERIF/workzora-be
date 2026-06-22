export interface ChatUser {
    id: string | null;
    name: string;
    avatarUrl: string | null;
}

export interface AdminChat {
    id: string;
    updatedAt: string;

    projectId: string | null;
    projectTitle: string | null;

    client: ChatUser;
    freelancer: ChatUser;

    topic: string;
    messageCount: number;
    isUnread: boolean;
}

export interface AdminChatsResponse {
    data: AdminChat[];
    total: number;
    page: number;
    limit: number;
}

export interface ChatMessage {
    id: string;
    chatId: string;

    senderId: string | null;
    receiverId: string | null;

    senderName: string;
    senderAvatar: string | null;

    content: string;

    fileUrl?: string | null;

    isRead: boolean;
    isEdited: boolean;
    isDeleted: boolean;
    isSystemMessage?: boolean;

    createdAt: string;
    updatedAt: string;
}
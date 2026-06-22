import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { SaveMessageDto } from './dto/save-message-dto';
import { ChatRoom } from './entities/chatRoom.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepo: Repository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,

    @Inject('USERS_CLIENT')
    private readonly userClient: ClientProxy,
  ) { }

  async findOrCreateChat(projectId) {
    let room = await this.chatRoomRepo.findOne({
      where: { projectId: projectId },
    });
    if (!room) {
      room = await this.chatRoomRepo.create({ projectId });
      await this.chatRoomRepo.save(room);
    }
    return room;
  }

  async getChats(data: {
    page?: number;
    limit?: number;
    userId: string;
  }) {
    try {
      const page = Number(data.page) || 1;
      const limit = Number(data.limit) || 10;
      const { userId } = data;

      const [chats, total] = await this.chatRoomRepo
        .createQueryBuilder('chat_room')
        .leftJoinAndSelect('chat_room.messages', 'messages')
        .leftJoinAndSelect('chat_room.project', 'project')
        .orderBy('chat_room.updatedAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const otherUserIds = chats
        .map(chat => {
          if (!chat.project) return null;
          return chat.project.freelancerId === userId
            ? chat.project.clientId
            : chat.project.freelancerId;
        })
        .filter((id): id is string => !!id);

      const uniqueUserIds = [...new Set(otherUserIds)];

      const usersMap = new Map<string, { name: string; avatarUrl: string }>();

      if (uniqueUserIds.length > 0) {
        try {
          const users = await firstValueFrom(
            this.userClient.send<{ id: string; name: string; avatarUrl: string }[]>(
              'users.getUsersByIds',
              { ids: uniqueUserIds }
            )
          );
          users.forEach(u => usersMap.set(u.id, { name: u.name, avatarUrl: u.avatarUrl }));
        } catch (err) {
          console.error('Failed to fetch users from UserService:', err);
        }
      }

      const formattedChats = chats.map(chat => {
        const sortedMessages = chat.messages?.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) || [];
        const lastMessage = sortedMessages[0];

        const unreadCount = chat.messages?.filter(m => !m.isRead && m.senderId !== userId).length || 0;
        const isUnread = unreadCount > 0;

        const otherUserId = chat.project?.freelancerId === userId
          ? chat.project?.clientId
          : chat.project?.freelancerId;

        const userData = otherUserId ? usersMap.get(otherUserId) : null;

        return {
          id: chat.id,
          updatedAt: chat.updatedAt,
          projectTitle: chat.project.title || null,
          projectId: chat.project.id,
          avatarUrl: userData?.avatarUrl || null,
          userName: userData?.name || "Користувач",
          topic: lastMessage ? lastMessage.content : "Чат створено",
          messageCount: unreadCount,
          isUnread: isUnread,
        };
      });

      return {
        data: formattedChats,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw error;
    }
  }
  async saveMessage(chatId: string, payload: SaveMessageDto) {
    const chat = await this.chatRoomRepo.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException('Chat room not found');
    }

    const newMessage = await this.messageRepo.create({
      chatId: chatId,
      senderId: payload.senderId,
      receiverId: payload.receiverId,
      fileUrl: payload.fileUrl || null,
      projectId: payload.projectId,
      content: payload.content,
      isRead: false,
      isDeleted: false,
      isEdited: false,
    });
    return await this.messageRepo.save(newMessage);
  }

  async getMessages(chatId: string, amount: number = 30) {
    const messages = await this.messageRepo.find({
      where: { chatId: chatId },
      take: amount,
      order: { createdAt: 'DESC' },
    });
    return messages.reverse();
  }

  async markAsReed(messageId: string) {
    await this.messageRepo.update(messageId, {
      isRead: true,
    });
  }

  async sendSystemMessage(chatId: string, projectId: string, content: string) {
    const chat = await this.chatRoomRepo.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException('Chat room not found');
    }

    const systemMessage = this.messageRepo.create({
      chatId: chatId,
      projectId: projectId,
      senderId: null,
      receiverId: null,
      content: content,
      isSystemMessage: true,
      isRead: false,
      isDeleted: false,
      isEdited: false,
    });

    return await this.messageRepo.save(systemMessage);
  }

  async getAllChats(data: {
    page?: number;
    limit?: number;
  }) {
    const page = Number(data.page) || 1;
    const limit = Number(data.limit) || 10;

    const [chats, total] = await this.chatRoomRepo
      .createQueryBuilder('chat_room')
      .leftJoinAndSelect('chat_room.messages', 'messages')
      .leftJoinAndSelect('chat_room.project', 'project')
      .orderBy('chat_room.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const userIds = chats
      .flatMap(chat =>
        chat.project
          ? [chat.project.clientId, chat.project.freelancerId]
          : []
      )
      .filter(Boolean);

    const uniqueUserIds = [...new Set(userIds)];

    const usersMap = new Map<
      string,
      { name: string; avatarUrl: string }
    >();

    if (uniqueUserIds.length > 0) {
      try {
        const users = await firstValueFrom(
          this.userClient.send<
            { id: string; name: string; avatarUrl: string }[]
          >('users.getUsersByIds', {
            ids: uniqueUserIds,
          })
        );

        users.forEach(user => {
          usersMap.set(user.id, {
            name: user.name,
            avatarUrl: user.avatarUrl,
          });
        });
      } catch (err) {
        console.error(
          'Failed to fetch users from UserService:',
          err,
        );
      }
    }

    const formattedChats = chats.map(chat => {
      const sortedMessages =
        chat.messages?.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        ) || [];

      const lastMessage = sortedMessages[0];

      const unreadCount =
        chat.messages?.filter(m => !m.isRead).length || 0;

      const client = chat.project
        ? usersMap.get(chat.project.clientId)
        : null;

      const freelancer = chat.project
        ? usersMap.get(chat.project.freelancerId)
        : null;

      return {
        id: chat.id,
        updatedAt: chat.updatedAt,

        projectTitle: chat.project?.title || null,
        projectId: chat.project?.id || null,

        client: {
          id: chat.project?.clientId || null,
          name: client?.name || 'Користувач',
          avatarUrl: client?.avatarUrl || null,
        },

        freelancer: {
          id: chat.project?.freelancerId || null,
          name: freelancer?.name || 'Користувач',
          avatarUrl: freelancer?.avatarUrl || null,
        },

        topic: lastMessage?.content || 'Чат створено',
        messageCount: unreadCount,
        isUnread: unreadCount > 0,
      };
    });

    return {
      data: formattedChats,
      total,
      page,
      limit,
    };
  }

  editMessage() { }

  deleteMessage() { }
}

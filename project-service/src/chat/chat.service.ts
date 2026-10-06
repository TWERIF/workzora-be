import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Brackets, Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { ChatAccessDto, ChatListDto, GetMessagesDto, MarkAsReadDto, SaveMessageDto } from './dto/save-message-dto';
import { ChatRoom } from './entities/chatRoom.entity';
import { Message } from './entities/message.entity';

interface ChatUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface ChatAccess {
  chatId: string | null;
  projectId: string;
  clientId: string;
  freelancerId: string | null;
}

const rpcError = (statusCode: HttpStatus, message: string) => new RpcException({ statusCode, message });

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepo: Repository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @Inject('USERS_CLIENT')
    private readonly userClient: ClientProxy,
  ) {}

  async findOrCreateChat(projectId: string) {
    const existing = await this.chatRoomRepo.findOne({ where: { projectId } });
    if (existing) return existing;
    return this.chatRoomRepo.save(this.chatRoomRepo.create({ projectId }));
  }

  async getAccess({ chatId, projectId }: ChatAccessDto): Promise<ChatAccess> {
    const room = chatId ? await this.chatRoomRepo.findOne({ where: { id: chatId } }) : null;
    if (chatId && !room) throw rpcError(HttpStatus.NOT_FOUND, 'Chat not found');

    const project = await this.projectRepo.findOne({
      select: { id: true, clientId: true, freelancerId: true },
      where: { id: room?.projectId ?? projectId },
    });
    if (!project) throw rpcError(HttpStatus.NOT_FOUND, 'Project not found');

    const chat = room ?? (await this.chatRoomRepo.findOne({ where: { projectId: project.id } }));
    return {
      chatId: chat?.id ?? null,
      projectId: project.id,
      clientId: project.clientId,
      freelancerId: project.freelancerId ?? null,
    };
  }

  async getChats({ userId, page = 1, limit = 10 }: ChatListDto) {
    const query = this.chatRoomRepo
      .createQueryBuilder('chat_room')
      .leftJoinAndSelect('chat_room.messages', 'messages')
      .innerJoinAndSelect('chat_room.project', 'project')
      .orderBy('chat_room.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (userId) {
      query.andWhere(
        new Brackets((where) => {
          where.where('project.clientId = :userId', { userId }).orWhere('project.freelancerId = :userId', { userId });
        }),
      );
    }

    const [chats, total] = await query.getManyAndCount();
    const usersById = await this.loadUsers(
      chats.flatMap((chat) => [chat.project.clientId, chat.project.freelancerId]).filter((id): id is string => !!id),
    );

    const data = chats.map((chat) => {
      const messages = [...(chat.messages ?? [])].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const unreadCount = messages.filter((message) => !message.isRead && (!userId || message.senderId !== userId)).length;
      const client = usersById.get(chat.project.clientId);
      const freelancer = chat.project.freelancerId ? usersById.get(chat.project.freelancerId) : undefined;
      const counterpart = chat.project.freelancerId === userId ? client : freelancer;

      return {
        id: chat.id,
        updatedAt: chat.updatedAt,
        projectTitle: chat.project.title ?? null,
        projectId: chat.project.id,
        avatarUrl: counterpart?.avatarUrl ?? null,
        userName: counterpart?.name ?? null,
        client: { id: chat.project.clientId, name: client?.name ?? null, avatarUrl: client?.avatarUrl ?? null },
        freelancer: {
          id: chat.project.freelancerId ?? null,
          name: freelancer?.name ?? null,
          avatarUrl: freelancer?.avatarUrl ?? null,
        },
        topic: messages[0]?.content ?? null,
        messageCount: unreadCount,
        isUnread: unreadCount > 0,
      };
    });

    return { data, total, page, limit };
  }

  async saveMessage({ chatId, senderId, content, fileUrl }: SaveMessageDto) {
    const access = await this.getAccess({ chatId });
    const isClient = access.clientId === senderId;
    const isFreelancer = access.freelancerId === senderId;
    if (!isClient && !isFreelancer) throw rpcError(HttpStatus.FORBIDDEN, 'Not a participant of this chat');

    const message = this.messageRepo.create({
      chatId,
      senderId,
      receiverId: isClient ? access.freelancerId : access.clientId,
      projectId: access.projectId,
      content,
      fileUrl: fileUrl ?? null,
    });
    const saved = await this.messageRepo.save(message);
    await this.chatRoomRepo.update(chatId, { updatedAt: new Date() });
    return saved;
  }

  async getMessages({ chatId, amount = 30 }: GetMessagesDto) {
    const messages = await this.messageRepo.find({ where: { chatId }, take: amount, order: { createdAt: 'DESC' } });
    return messages.reverse();
  }

  async markAsRead({ messageId, userId }: MarkAsReadDto) {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw rpcError(HttpStatus.NOT_FOUND, 'Message not found');
    if (message.senderId === userId) return { success: true };

    const access = await this.getAccess({ chatId: message.chatId });
    if (access.clientId !== userId && access.freelancerId !== userId) {
      throw rpcError(HttpStatus.FORBIDDEN, 'Not a participant of this chat');
    }

    await this.messageRepo.update(messageId, { isRead: true });
    return { success: true };
  }

  async sendSystemMessage(chatId: string, projectId: string, content: string) {
    return this.messageRepo.save(
      this.messageRepo.create({ chatId, projectId, senderId: null, receiverId: null, content, isSystemMessage: true }),
    );
  }

  private async loadUsers(ids: string[]) {
    const unique = [...new Set(ids)];
    if (!unique.length) return new Map<string, ChatUser>();

    try {
      const users = await firstValueFrom(this.userClient.send<ChatUser[]>('users.getUsersByIds', { ids: unique }));
      return new Map(users.map((user) => [user.id, user]));
    } catch (error) {
      this.logger.warn(`Users lookup failed: ${error instanceof Error ? error.message : String(error)}`);
      return new Map<string, ChatUser>();
    }
  }
}

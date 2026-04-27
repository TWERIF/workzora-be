import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chatRoom.entity';
import { Message } from './entities/message.entity';
import { SaveMessageDto } from './dto/save-message-dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepo: Repository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

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

  editMessage() {}

  deleteMessage() {}
}

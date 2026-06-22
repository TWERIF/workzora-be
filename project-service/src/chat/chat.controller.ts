import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { SaveMessageDto } from './dto/save-message-dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @MessagePattern('chat.findOrCreate')
  async findOrCreateChat(@Payload() data: { projectId: string }) {
    return await this.chatService.findOrCreateChat(data.projectId);
  }

  @MessagePattern('chat.getMessages')
  async getMessages(@Payload() data: { chatId: string; amount?: number }) {
    return await this.chatService.getMessages(data.chatId, data.amount);
  }

  @MessagePattern('chat.saveMessage')
  async saveMessage(
    @Payload() data: { chatId: string; payload: SaveMessageDto },
  ) {
    return await this.chatService.saveMessage(data.chatId, data.payload);
  }

  @MessagePattern('chat.markAsRead')
  async markAsRead(@Payload() data: { messageId: string }) {
    return await this.chatService.markAsReed(data.messageId);
  }

  @MessagePattern('chat.getChats')
  async getChats(@Payload() data: { userId: string, page?: number; limit?: number }) {
    return await this.chatService.getChats(data);
  }

  @MessagePattern('chat.getAllChats')
  async getAllChats(
    @Payload()
    data: {
      page?: number;
      limit?: number;
    },
  ) {
    return await this.chatService.getAllChats(data);
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { ChatAccessDto, ChatListDto, GetMessagesDto, MarkAsReadDto, ProjectIdDto, SaveMessageDto } from './dto/save-message-dto';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern('chat.findOrCreate')
  findOrCreateChat(@Payload() data: ProjectIdDto) {
    return this.chatService.findOrCreateChat(data.projectId);
  }

  @MessagePattern('chat.access')
  getAccess(@Payload() data: ChatAccessDto) {
    return this.chatService.getAccess(data);
  }

  @MessagePattern('chat.getMessages')
  getMessages(@Payload() data: GetMessagesDto) {
    return this.chatService.getMessages(data);
  }

  @MessagePattern('chat.saveMessage')
  saveMessage(@Payload() data: SaveMessageDto) {
    return this.chatService.saveMessage(data);
  }

  @MessagePattern('chat.markAsRead')
  markAsRead(@Payload() data: MarkAsReadDto) {
    return this.chatService.markAsRead(data);
  }

  @MessagePattern('chat.getChats')
  getChats(@Payload() data: ChatListDto) {
    return this.chatService.getChats(data);
  }

  @MessagePattern('chat.getAllChats')
  getAllChats(@Payload() data: ChatListDto) {
    return this.chatService.getChats({ page: data.page, limit: data.limit });
  }
}

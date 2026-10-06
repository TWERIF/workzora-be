import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';
import { CurrentUser } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { assertFile, DOCUMENT_UPLOAD_LIMIT } from '../common/files';
import { PaginationQueryDto } from '../common/pagination.dto';
import { sendRpc } from '../common/rpc';
import { ChatAccessService } from './chat-access.service';
import { MessagesQueryDto, SendMessageDto } from './dto';

interface ChatMessage {
  senderId: string | null;
}

interface ChatUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

@ApiTags('chat')
@ApiCookieAuth()
@Controller('chat')
@UseGuards(RolesGuard)
export class ChatController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    private readonly cloudinaryService: CloudinaryService,
    private readonly chatAccess: ChatAccessService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Own chats' })
  getChats(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return sendRpc(this.projectClient, 'chat.getChats', { userId: user.id, ...query });
  }

  @Get('all')
  @Roles('admin')
  @ApiOperation({ summary: 'All chats (admin)' })
  getAllChats(@Query() query: PaginationQueryDto) {
    return sendRpc(this.projectClient, 'chat.getAllChats', query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Chat of a project, created on first access' })
  async findOrCreateChat(@Param('projectId', ParseUUIDPipe) projectId: string, @CurrentUser() user: AuthUser) {
    await this.chatAccess.assertParticipant(user, { projectId });
    return sendRpc(this.projectClient, 'chat.findOrCreate', { projectId });
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Latest messages of a chat' })
  async getMessages(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Query() query: MessagesQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    await this.chatAccess.assertParticipant(user, { chatId });
    const messages = await sendRpc<ChatMessage[]>(this.projectClient, 'chat.getMessages', { chatId, amount: query.amount });
    if (!messages.length) return [];

    const senderIds = [...new Set(messages.map((message) => message.senderId).filter((id): id is string => !!id))];
    const senders = senderIds.length
      ? await sendRpc<ChatUser[]>(this.usersClient, 'users.getUsersByIds', { ids: senderIds }).catch(() => [])
      : [];
    const sendersById = new Map(senders.map((sender) => [sender.id, sender]));

    return messages.map((message) => {
      const sender = message.senderId ? sendersById.get(message.senderId) : undefined;
      return { ...message, senderName: sender?.name ?? 'Workzora', senderAvatar: sender?.avatarUrl ?? null };
    });
  }

  @Post(':chatId/messages')
  @ApiOperation({ summary: 'Send a message' })
  async saveMessage(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() body: SendMessageDto,
    @CurrentUser() user: AuthUser,
  ) {
    await this.chatAccess.assertParticipant(user, { chatId });
    return sendRpc(this.projectClient, 'chat.saveMessage', { ...body, chatId, senderId: user.id });
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload a chat attachment' })
  @UseInterceptors(FileInterceptor('file', { limits: DOCUMENT_UPLOAD_LIMIT }))
  async uploadFile(@UploadedFile() file: Express.Multer.File | undefined) {
    const fileUrl = await this.cloudinaryService.uploadChatAttachment(assertFile(file));
    return { fileUrl };
  }

  @Patch('messages/:messageId/read')
  @ApiOperation({ summary: 'Mark a received message as read' })
  markAsRead(@Param('messageId', ParseUUIDPipe) messageId: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.projectClient, 'chat.markAsRead', { messageId, userId: user.id });
  }
}

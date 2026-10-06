import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CORS_ORIGINS } from '../common/cors';
import { sendRpc } from '../common/rpc';
import { ChatAccessService, ChatParticipant } from './chat-access.service';

interface SendMessagePayload {
  chatId?: unknown;
  content?: unknown;
  fileUrl?: unknown;
}

interface SocketData {
  user?: ChatParticipant;
}

const MAX_MESSAGE_LENGTH = 10000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const readCookie = (header: string | undefined, name: string): string | undefined =>
  header
    ?.split(';')
    .map((part) => part.trim().split('='))
    .find(([key]) => key === name)
    ?.slice(1)
    .join('=');

@WebSocketGateway({
  cors: { origin: CORS_ORIGINS, credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    private readonly chatAccess: ChatAccessService,
  ) {}

  async handleConnection(client: Socket) {
    const token = readCookie(client.handshake.headers.cookie, 'access_token');
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await sendRpc<ChatParticipant>(this.authClient, 'auth.verify', decodeURIComponent(token));
      (client.data as SocketData).user = { id: payload.id, role: payload.role };
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: unknown) {
    const user = (client.data as SocketData).user;
    if (!user || typeof chatId !== 'string' || !UUID_RE.test(chatId)) return;

    try {
      await this.chatAccess.assertParticipant(user, { chatId });
      await client.join(chatId);
    } catch {
      client.emit('errorMessage', { error: 'forbidden' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: SendMessagePayload) {
    const user = (client.data as SocketData).user;
    const { chatId, content, fileUrl } = payload ?? {};
    const validFileUrl = typeof fileUrl === 'string' && fileUrl.startsWith('https://') ? fileUrl : undefined;

    if (
      !user ||
      typeof chatId !== 'string' ||
      !UUID_RE.test(chatId) ||
      typeof content !== 'string' ||
      content.length > MAX_MESSAGE_LENGTH ||
      (!content.trim() && !validFileUrl)
    ) {
      client.emit('errorMessage', { error: 'invalid_message' });
      return;
    }

    try {
      const saved = await sendRpc(this.projectClient, 'chat.saveMessage', {
        chatId,
        senderId: user.id,
        content,
        fileUrl: validFileUrl,
      });
      this.server.to(chatId).emit('newMessage', saved);
    } catch (error) {
      this.logger.warn(`Message rejected: ${error instanceof Error ? error.message : String(error)}`);
      client.emit('errorMessage', { error: 'send_failed' });
    }
  }
}

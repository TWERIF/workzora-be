import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    // Інжектимо клієнт RabbitMQ для зв'язку з project-service
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Клієнт підключився до API Gateway: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string,
  ) {
    client.join(chatId);
    console.log(`Клієнт ${client.id} приєднався до чату ${chatId}`);
  }

  // 2. Обробка відправки повідомлення
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      chatId: string;
      receiverId: string;
      content: string;
      senderId: string;
      fileUrl?: string;
    },
  ) {
    try {
      const savedMessage = await firstValueFrom(
        this.projectClient.send('chat.saveMessage', {
          chatId: payload.chatId,
          payload: {
            senderId: payload.senderId,
            receiverId: payload.receiverId,
            content: payload.content,
            projectId: payload.chatId,
            fileUrl: payload.fileUrl,
          },
        }),
      );

      this.server.to(payload.chatId).emit('newMessage', savedMessage);
    } catch (error) {
      console.error('Помилка збереження повідомлення:', error);
      client.emit('errorMessage', {
        error: 'Не вдалося відправити повідомлення',
      });
    }
  }
}

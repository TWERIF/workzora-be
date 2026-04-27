import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private onlineUsers: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)?.add(client.id);
      this.server.emit('userPresence', { userId, isOnline: true });
      console.log(`Клієнт підключився: ${client.id}`);
    } else {
      client.disconnect();
    }
  }
  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId && this.onlineUsers.has(userId)) {
      const userSockets = this.onlineUsers.get(userId);
      userSockets?.delete(client.id);
      if (userSockets?.size == 0) {
        this.onlineUsers.delete(userId);
        this.server.emit('userPresence', { userId, isOnline: false });
        console.log(`Клієнт відключився: ${client.id}`);
      }
    }
  }
}

import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserRole } from '../common/auth-user';
import { sendRpc } from '../common/rpc';

export interface ChatAccess {
  chatId: string | null;
  projectId: string;
  clientId: string;
  freelancerId: string | null;
}

export interface ChatParticipant {
  id: string;
  role: string;
}

@Injectable()
export class ChatAccessService {
  constructor(@Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy) {}

  async assertParticipant(user: ChatParticipant, target: { chatId?: string; projectId?: string }): Promise<ChatAccess> {
    const access = await sendRpc<ChatAccess>(this.projectClient, 'chat.access', target);
    const isParticipant = access.clientId === user.id || access.freelancerId === user.id;
    if (!isParticipant && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not a participant of this chat');
    }
    return access;
  }
}

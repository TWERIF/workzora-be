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
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async assertParticipant(user: ChatParticipant, target: { chatId?: string; projectId?: string }): Promise<ChatAccess> {
    const access = await sendRpc<ChatAccess>(this.projectClient, 'chat.access', target);
    const isParticipant = access.clientId === user.id || access.freelancerId === user.id;
    if (!isParticipant && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not a participant of this chat');
    }
    return access;
  }

  async assertCanSend(user: ChatParticipant, chatId: string): Promise<ChatAccess> {
    const access = await this.assertParticipant(user, { chatId });
    const counterpart = access.clientId === user.id ? access.freelancerId : access.clientId;
    if (counterpart && counterpart !== user.id) {
      const status = await sendRpc<{ blockedMe: boolean }>(this.userClient, 'users.blockStatus', { userId: user.id, otherId: counterpart });
      if (status.blockedMe) throw new ForbiddenException('This user has blocked you');
    }
    return access;
  }
}

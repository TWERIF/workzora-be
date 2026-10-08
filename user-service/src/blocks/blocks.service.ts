import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { BlockDto, BlockStatusDto } from './dto';
import { UserBlock } from './entities/user-block.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(UserBlock) private readonly blocks: Repository<UserBlock>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async block({ userId, blockedId }: BlockDto) {
    if (userId === blockedId) throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'You cannot block yourself' });
    if (!(await this.users.exist({ where: { id: blockedId } }))) {
      throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'User not found' });
    }
    await this.blocks.upsert({ userId, blockedId }, ['userId', 'blockedId']);
    return { blocked: true };
  }

  async unblock({ userId, blockedId }: BlockDto) {
    await this.blocks.delete({ userId, blockedId });
    return { blocked: false };
  }

  async list(userId: string) {
    const rows = await this.blocks.find({ where: { userId }, order: { createdAt: 'DESC' } });
    if (!rows.length) return [];
    const users = await this.users.find({
      where: { id: In(rows.map((row) => row.blockedId)) },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
    });
    const byId = new Map(users.map((user) => [user.id, user]));
    return rows
      .map((row) => ({ blockedAt: row.createdAt, user: byId.get(row.blockedId) }))
      .filter((row) => row.user);
  }

  async status({ userId, otherId }: BlockStatusDto) {
    const rows = await this.blocks.find({
      where: [
        { userId, blockedId: otherId },
        { userId: otherId, blockedId: userId },
      ],
    });
    return {
      blockedByMe: rows.some((row) => row.userId === userId),
      blockedMe: rows.some((row) => row.userId === otherId),
    };
  }
}

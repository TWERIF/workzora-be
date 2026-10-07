import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto, ListNotificationsDto, MarkAllReadDto, MarkReadDto } from './dto';
import { Notification, NOTIFICATION_TYPES, type NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly repository: Repository<Notification>) {}

  async create(dto: CreateNotificationDto) {
    if (dto.dedupeKey) {
      const existing = await this.repository.findOne({
        where: { userId: dto.userId, dedupeKey: dto.dedupeKey, isRead: false },
      });
      if (existing) {
        await this.repository.update(existing.id, { params: dto.params ?? {}, createdAt: new Date() });
        return existing.id;
      }
    }

    const saved = await this.repository.save(
      this.repository.create({
        userId: dto.userId,
        type: dto.type,
        key: dto.key,
        params: dto.params ?? {},
        link: dto.link ?? null,
        dedupeKey: dto.dedupeKey ?? null,
      }),
    );
    return saved.id;
  }

  async list({ userId, type, page, limit }: ListNotificationsDto) {
    const [data, total] = await this.repository.findAndCount({
      where: type ? { userId, type } : { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async unreadCount(userId: string) {
    const rows = await this.repository
      .createQueryBuilder('n')
      .select('n.type', 'type')
      .addSelect('COUNT(*)::int', 'count')
      .where('n.userId = :userId AND n.isRead = false', { userId })
      .groupBy('n.type')
      .getRawMany<{ type: NotificationType; count: number }>();

    const byType = Object.fromEntries(NOTIFICATION_TYPES.map((type) => [type, 0])) as Record<NotificationType, number>;
    for (const row of rows) byType[row.type] = row.count;
    return { total: rows.reduce((sum, row) => sum + row.count, 0), byType };
  }

  async markRead({ userId, id }: MarkReadDto) {
    await this.repository.update({ id, userId }, { isRead: true });
    return { success: true };
  }

  async markAllRead({ userId, type }: MarkAllReadDto) {
    await this.repository.update(type ? { userId, type, isRead: false } : { userId, isRead: false }, { isRead: true });
    return { success: true };
  }
}

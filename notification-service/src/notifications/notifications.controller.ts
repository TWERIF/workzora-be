import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateNotificationDto, ListNotificationsDto, MarkAllReadDto, MarkReadDto, UserDto } from './dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @EventPattern('notification.create')
  async create(@Payload() dto: CreateNotificationDto) {
    await this.notifications.create(dto);
  }

  @MessagePattern('notifications.list')
  list(@Payload() dto: ListNotificationsDto) {
    return this.notifications.list(dto);
  }

  @MessagePattern('notifications.unreadCount')
  unreadCount(@Payload() dto: UserDto) {
    return this.notifications.unreadCount(dto.userId);
  }

  @MessagePattern('notifications.markRead')
  markRead(@Payload() dto: MarkReadDto) {
    return this.notifications.markRead(dto);
  }

  @MessagePattern('notifications.markAllRead')
  markAllRead(@Payload() dto: MarkAllReadDto) {
    return this.notifications.markAllRead(dto);
  }
}

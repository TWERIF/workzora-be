import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { sendRpc } from '../common/rpc';
import { MarkAllReadDto, NotificationsQueryDto } from './dto';

@ApiTags('notifications')
@ApiCookieAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(@Inject('NOTIFICATIONS_SERVICE') private readonly notificationsClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Own notifications, newest first' })
  list(@Query() query: NotificationsQueryDto, @CurrentUser() user: AuthUser) {
    return sendRpc(this.notificationsClient, 'notifications.list', {
      userId: user.id,
      type: query.type,
      page: query.page,
      limit: Math.min(query.limit, 50),
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread notifications, total and per type' })
  unreadCount(@CurrentUser() user: AuthUser) {
    return sendRpc(this.notificationsClient, 'notifications.unreadCount', { userId: user.id });
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@Body() body: MarkAllReadDto, @CurrentUser() user: AuthUser) {
    return sendRpc(this.notificationsClient, 'notifications.markAllRead', { userId: user.id, type: body.type });
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  markRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.notificationsClient, 'notifications.markRead', { userId: user.id, id });
  }
}

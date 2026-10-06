import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { sendRpc } from '../common/rpc';
import { CreateTicketDto, TicketMessageDto, TicketsQueryDto } from './dto';

@ApiTags('support')
@Controller('support')
@UseGuards(RolesGuard)
export class SupportController {
  constructor(
    @Inject('SUPPORT_SERVICE') private readonly supportClient: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('tickets')
  @ApiOperation({ summary: 'Send a message from the contact form' })
  async create(@Body() body: CreateTicketDto, @Req() req: Request) {
    const userId = await this.optionalUserId(req);
    const ticket = await sendRpc<{ id: string }>(this.supportClient, 'support.create', { ...body, userId });
    return { id: ticket.id, linkedToAccount: !!userId };
  }

  @Get('tickets/mine')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Own support requests' })
  mine(@CurrentUser() user: AuthUser) {
    return sendRpc(this.supportClient, 'support.mine', { userId: user.id });
  }

  @Get('tickets/mine/:id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Own support request with messages' })
  getMine(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.supportClient, 'support.getMine', { id, userId: user.id });
  }

  @Post('tickets/mine/:id/messages')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Reply in own support request' })
  reply(@Param('id', ParseUUIDPipe) id: string, @Body() body: TicketMessageDto, @CurrentUser() user: AuthUser) {
    return sendRpc(this.supportClient, 'support.userReply', { id, userId: user.id, content: body.content });
  }

  @Roles('admin')
  @Get('admin/tickets')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Support requests (admin)' })
  list(@Query() query: TicketsQueryDto) {
    return sendRpc(this.supportClient, 'support.list', query);
  }

  @Roles('admin')
  @Get('admin/stats')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Open and closed request counts (admin)' })
  stats() {
    return sendRpc(this.supportClient, 'support.stats', {});
  }

  @Roles('admin')
  @Get('admin/tickets/:id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Support request with messages (admin)' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.supportClient, 'support.get', { id });
  }

  @Roles('admin')
  @Post('admin/tickets/:id/reply')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Answer a request; guests get the answer by email (admin)' })
  adminReply(@Param('id', ParseUUIDPipe) id: string, @Body() body: TicketMessageDto, @CurrentUser() user: AuthUser) {
    return sendRpc(this.supportClient, 'support.adminReply', { id, adminId: user.id, content: body.content });
  }

  @Roles('admin')
  @Patch('admin/tickets/:id/close')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Close a request (admin)' })
  close(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.supportClient, 'support.close', { id, adminId: user.id });
  }

  private async optionalUserId(req: Request): Promise<string | undefined> {
    const token: unknown = req.cookies?.['access_token'];
    if (typeof token !== 'string' || !token) return undefined;
    const payload = await sendRpc<{ id: string }>(this.authClient, 'auth.verify', token).catch(() => null);
    return payload?.id;
  }
}

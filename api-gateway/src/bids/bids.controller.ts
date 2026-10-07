import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { CurrentUser } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { ProjectRecord } from '../common/project';
import { sendRpc } from '../common/rpc';
import { CreateBidDto, UpdateBidDto } from './dto';

interface BidRecord {
  id: string;
  userId: string;
}

interface BidAuthor {
  id: string;
  email?: string;
}

@ApiTags('bids')
@ApiCookieAuth()
@Controller('bids')
@UseGuards(RolesGuard)
export class BidsController {
  constructor(
    @Inject('BIDS_SERVICE') private readonly bidsClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsClient: ClientProxy,
  ) {}

  @Post()
  @Roles('freelancer')
  @ApiOperation({ summary: 'Send a proposal to an open project' })
  async create(@Body() data: CreateBidDto, @CurrentUser() user: AuthUser) {
    const project = await sendRpc<ProjectRecord | null>(this.projectClient, 'projects.findOneProject', { id: data.projectId });
    if (!project) throw new BadRequestException('Project not found');
    if (project.status !== 'open') throw new BadRequestException('The project is not accepting proposals');
    if (project.clientId === user.id) throw new ForbiddenException('You cannot bid on your own project');
    const block = await sendRpc<{ blockedMe: boolean }>(this.userClient, 'users.blockStatus', { userId: user.id, otherId: project.clientId });
    if (block.blockedMe) throw new ForbiddenException('The client has blocked you');

    const bid = await sendRpc(this.bidsClient, 'bids.create', { ...data, userId: user.id });
    this.notificationsClient
      .emit('notification.create', {
        userId: project.clientId,
        type: 'projects',
        key: 'bidReceived',
        params: { project: project.title },
        link: `/activeProjects/discussion/${project.id}`,
        dedupeKey: `bids:${project.id}`,
      })
      .subscribe({ error: () => undefined });
    return bid;
  }

  @Get('project/:id')
  @ApiOperation({ summary: 'Proposals of a project' })
  async getProjectBids(@Param('id', ParseUUIDPipe) id: string) {
    const bids = await sendRpc<BidRecord[]>(this.bidsClient, 'bids.getProjectBids', { id });
    const userIds = [...new Set(bids.map((bid) => bid.userId))];
    const users = userIds.length ? await sendRpc<BidAuthor[]>(this.userClient, 'users.getMany', userIds) : [];
    const usersById = new Map(users.map(({ email: _email, ...author }) => [author.id, author]));

    return bids.map((bid) => ({ ...bid, user: usersById.get(bid.userId) }));
  }

  @Get('my')
  @ApiOperation({ summary: 'Own proposals' })
  getMyBids(@CurrentUser() user: AuthUser) {
    return sendRpc(this.bidsClient, 'bids.getMyBids', { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit own proposal, up to 3 times' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateBidDto, @CurrentUser() user: AuthUser) {
    return sendRpc(this.bidsClient, 'bids.update', { ...data, id, userId: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own proposal' })
  deleteBid(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.bidsClient, 'bids.delete', { id, userId: user.id });
  }
}

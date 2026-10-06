import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import { CurrentUser, UserRole } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { ProjectRecord } from '../common/project';
import { sendRpc } from '../common/rpc';
import {
  AdminProjectsQueryDto,
  AwaitingPaymentDto,
  CreateProjectDto,
  FindProjectsQueryDto,
  MyProjectsQueryDto,
  SearchQueryDto,
  UpdateProjectDto,
} from './dto';

interface ClientSummary {
  id: string;
  firstName: string;
}

@ApiTags('projects')
@Controller('projects')
@UseGuards(RolesGuard)
export class ProjectsController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('SEARCH_SERVICE') private readonly searchClient: ClientProxy,
  ) {}

  @Get('search')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Full text search over projects' })
  searchProjects(@Query() query: SearchQueryDto) {
    if (!query.searchTerm?.trim()) return [];
    return sendRpc(this.searchClient, 'projects.search', { searchTerm: query.searchTerm });
  }

  @Get('my')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Own projects by status' })
  getMyProjects(@CurrentUser() user: AuthUser, @Query() query: MyProjectsQueryDto) {
    return sendRpc(this.projectClient, 'projects.findMyProjects', { ...query, userId: user.id });
  }

  @Public()
  @Get('count')
  @ApiOperation({ summary: 'Number of projects' })
  count() {
    return sendRpc<number>(this.projectClient, 'projects.count', {});
  }

  @Public()
  @Get('topProjects')
  @ApiOperation({ summary: 'Projects for the home page' })
  async getTopProjects() {
    const projects = await sendRpc<ProjectRecord[]>(this.projectClient, 'projects.getTopProjects', {});
    const clientIds = [...new Set(projects.map((project) => project.clientId))];
    const clients = await Promise.all(
      clientIds.map((id) => sendRpc<ClientSummary>(this.userClient, 'users.getPublic', { id }).catch(() => null)),
    );
    const namesById = new Map(clients.filter((client): client is ClientSummary => !!client).map((c) => [c.id, c.firstName]));

    return projects.map((project) => ({ ...project, clientName: namesById.get(project.clientId) ?? null }));
  }

  @Roles('admin')
  @Get('admin')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'All projects with status filter (admin)' })
  adminList(@Query() query: AdminProjectsQueryDto) {
    return sendRpc(this.projectClient, 'projects.adminList', query);
  }

  @Roles('client')
  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Post a project' })
  create(@CurrentUser() user: AuthUser, @Body() body: CreateProjectDto) {
    return sendRpc(this.projectClient, 'projects.create', { ...body, clientId: user.id });
  }

  @Roles('client')
  @Patch(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Edit own project, the price only while it is open' })
  async updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    const project = await this.getOwnedProject(id, user);
    if (body.price !== undefined && Number(body.price) !== Number(project.price) && project.status !== 'open') {
      throw new BadRequestException('The price cannot be changed after a freelancer was chosen');
    }
    return sendRpc(this.projectClient, 'projects.update', { ...body, id });
  }

  @Roles('client', 'admin')
  @Delete(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete an unpaid project' })
  async deleteProject(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    const project = await this.getOwnedProject(id, user);
    if (!['open', 'awaiting_payment'].includes(project.status)) {
      throw new BadRequestException('Only an unpaid project can be deleted');
    }
    return sendRpc(this.projectClient, 'projects.delete', { id });
  }

  @Get(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Project with its client' })
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    const project = await sendRpc<ProjectRecord | null>(this.projectClient, 'projects.findOneProject', { id });
    if (!project) throw new NotFoundException('Project not found');

    const client = await sendRpc(this.userClient, 'users.getPublic', { id: project.clientId }).catch(() => null);
    const { clientId: _clientId, ...rest } = project;
    return { ...rest, client };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Open projects with search and filters' })
  findProjects(@Query() query: FindProjectsQueryDto) {
    return sendRpc(this.projectClient, 'projects.findProjects', query);
  }

  @Roles('client')
  @Patch(':id/awaiting-payment')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Choose the freelancer, the project waits for payment' })
  toAwaitingPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AwaitingPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return sendRpc(this.projectClient, 'projects.toAwaitingPayment', { id, freelancerId: body.freelancerId, clientId: user.id });
  }

  @Roles('client')
  @Patch(':id/completed')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Complete the project and release the escrow to the freelancer' })
  toCompleted(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.projectClient, 'projects.toInCompleted', { id, clientId: user.id });
  }

  @Roles('admin')
  @Patch(':id/closed')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Close a project (admin)' })
  toClosed(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.projectClient, 'projects.toClosed', { id });
  }

  private async getOwnedProject(id: string, user: AuthUser) {
    const project = await sendRpc<ProjectRecord | null>(this.projectClient, 'projects.findOneProject', { id });
    if (!project) throw new NotFoundException('Project not found');
    if (project.clientId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only the project owner can change it');
    }
    return project;
  }
}

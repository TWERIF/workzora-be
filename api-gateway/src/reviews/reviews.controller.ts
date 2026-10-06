import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { ProjectRecord, ProjectStatus } from '../common/project';
import { sendRpc } from '../common/rpc';
import { CreateReviewDto, ReviewsQueryDto } from './dto';

const REVIEWABLE_STATUSES: ProjectStatus[] = ['completed', 'closed'];

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
  ) {}

  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Review the other side of a completed project' })
  async create(@CurrentUser() user: AuthUser, @Body() body: CreateReviewDto) {
    const project = await this.getProject(body.projectId);

    const isClient = project.clientId === user.id;
    const isFreelancer = !!project.freelancerId && project.freelancerId === user.id;
    if (!isClient && !isFreelancer) {
      throw new ForbiddenException('Only participants of the project can leave a review');
    }
    if (!REVIEWABLE_STATUSES.includes(project.status)) {
      throw new BadRequestException('A review can be left only after the project is completed');
    }

    return sendRpc(this.userClient, 'reviews.create', {
      ...body,
      projectTitle: project.title,
      authorId: user.id,
      authorRole: isClient ? 'client' : 'freelancer',
      targetId: isClient ? project.freelancerId : project.clientId,
    });
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Reviews about a user' })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string, @Query() query: ReviewsQueryDto) {
    return sendRpc(this.userClient, 'reviews.findByTarget', { targetId: userId, ...query });
  }

  @Get('project/:projectId/mine')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Own review for the project or null' })
  async findMine(@Param('projectId', ParseUUIDPipe) projectId: string, @CurrentUser() user: AuthUser) {
    const review = await sendRpc(this.userClient, 'reviews.findMine', { projectId, authorId: user.id });
    return { review: review ?? null };
  }

  private async getProject(projectId: string) {
    const project = await sendRpc<ProjectRecord | null>(this.projectClient, 'projects.findOneProject', { id: projectId });
    if (!project) throw new BadRequestException('Project not found');
    return project;
  }
}

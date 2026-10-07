import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';
import { CurrentUser } from '../common/auth-user';
import type { AccountVerification, AuthUser } from '../common/auth-user';
import { assertImage, IMAGE_UPLOAD_LIMIT } from '../common/files';
import { sendRpc } from '../common/rpc';
import { ProfilesPreviewQueryDto, TopClientsQueryDto, UpdateUserDto } from './dto';

interface TopClient {
  id: string;
  lastReview: unknown;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    @Inject('KYC_SERVICE') private readonly kycClient: ClientProxy,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Public()
  @Get('profilesPreview')
  @ApiOperation({ summary: 'Short profiles for the home page' })
  getPreview(@Query() query: ProfilesPreviewQueryDto) {
    return sendRpc(this.userClient, 'users.getProfilesPreview', query);
  }

  @Post('switch-role')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Switch between client and freelancer, once per 7 days' })
  async switchRole(@CurrentUser() user: AuthUser) {
    const deals = await sendRpc<{ total: number }>(this.projectClient, 'projects.activeDeals', { userId: user.id });
    return sendRpc(this.userClient, 'users.switchRole', { id: user.id, activeDeals: deals.total });
  }

  @Put('update')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update own profile' })
  updateUser(@Body() body: UpdateUserDto, @CurrentUser() user: AuthUser) {
    return sendRpc(this.userClient, 'users.update', { ...body, id: user.id });
  }

  @Public()
  @Get('count')
  @ApiOperation({ summary: 'Number of registered users' })
  count() {
    return sendRpc<number>(this.userClient, 'users.count', {});
  }

  @Public()
  @Get('topClients')
  @ApiOperation({ summary: 'Top 5 clients by rating' })
  getTopClients() {
    return sendRpc(this.userClient, 'users.findTopClients', {});
  }

  @Public()
  @Get('clients/top')
  @ApiOperation({ summary: 'Top clients page with search and rating filter' })
  async getTopClientsPaged(@Query() query: TopClientsQueryDto) {
    const result = await sendRpc<Paginated<TopClient>>(this.userClient, 'users.findTopClientsPaged', query);

    const withoutReview = result.data.filter((client) => !client.lastReview).map((client) => client.id);
    const lastProjects = withoutReview.length
      ? await sendRpc<Record<string, unknown>>(this.projectClient, 'projects.lastByClients', { ids: withoutReview }).catch(
          () => ({}) as Record<string, unknown>,
        )
      : {};

    const verifications = await Promise.all(
      result.data.map((client) =>
        sendRpc<AccountVerification | null>(this.kycClient, 'accout-verification.findOneByUserId', { userId: client.id }).catch(
          () => null,
        ),
      ),
    );

    return {
      ...result,
      data: result.data.map((client, index) => ({
        ...client,
        lastProject: lastProjects[client.id] ?? null,
        isVerified: verifications[index]?.status === 'verified',
      })),
    };
  }

  @Public()
  @Get('topFreelancers')
  @ApiOperation({ summary: 'Top freelancers by rating' })
  getTopFreelancers() {
    return sendRpc(this.userClient, 'users.findTopFreelancers', {});
  }

  @Post('avatar')
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload own avatar' })
  @UseInterceptors(FileInterceptor('file', { limits: IMAGE_UPLOAD_LIMIT }))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File | undefined, @CurrentUser() user: AuthUser) {
    const avatarUrl = await this.cloudinaryService.uploadAvatar(assertImage(file));
    return sendRpc(this.userClient, 'users.uploadAvatar', { userId: user.id, avatarUrl });
  }

  @Delete('avatar')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Remove own avatar' })
  removeAvatar(@CurrentUser() user: AuthUser) {
    return sendRpc(this.userClient, 'users.removeAvatar', { id: user.id });
  }

  @Get('blocked')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Users I have blocked' })
  blocked(@CurrentUser() user: AuthUser) {
    return sendRpc(this.userClient, 'users.blockedList', { userId: user.id });
  }

  @Get(':id/relation')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Block status and shared project with another user' })
  async relation(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    const [block, shared] = await Promise.all([
      sendRpc<{ blockedByMe: boolean; blockedMe: boolean }>(this.userClient, 'users.blockStatus', { userId: user.id, otherId: id }),
      sendRpc<{ projectId: string | null }>(this.projectClient, 'projects.sharedProject', { userId: user.id, otherId: id }),
    ]);
    return { ...block, sharedProjectId: shared.projectId };
  }

  @Post(':id/block')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Block a user' })
  block(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.userClient, 'users.block', { userId: user.id, blockedId: id });
  }

  @Delete(':id/block')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Unblock a user' })
  unblock(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.userClient, 'users.unblock', { userId: user.id, blockedId: id });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Public profile with project stats' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const [profile, stats] = await Promise.all([
      sendRpc<Record<string, unknown>>(this.userClient, 'users.getPublic', { id }),
      sendRpc<Record<string, number>>(this.projectClient, 'projects.userStats', { userId: id }).catch(() => null),
    ]);
    return { ...profile, stats };
  }
}

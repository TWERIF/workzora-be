import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../auth/guards/auth-guard';
import { Public } from '../auth/public.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';
import { sendRpc } from '../common/rpc';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    @Inject('KYC_SERVICE') private readonly kycClient: ClientProxy,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Public()
  @Get('getAll')
  async getAll() { }

  @Public()
  @Get('profilesPreview')
  async getPreview(@Query() query: { role: string; amount: number }) {
    return await firstValueFrom(
      this.userClient.send('users.getProfilesPreview', query),
    );
  }

  // client <-> freelancer, once per 7 days and only without running deals
  @Post('switch-role')
  async switchRole(@Req() req: Request) {
    const userId = (req as any).user.id;
    const deals = await sendRpc<{ total: number }>(this.projectClient, 'projects.activeDeals', { userId });
    return sendRpc(this.userClient, 'users.switchRole', { id: userId, activeDeals: deals.total });
  }

  @Put('update')
  async updateUser(@Body() body: any, @Req() req: Request) {
    const id = (req as any).user.id;

    return await firstValueFrom(
      this.userClient.send('users.update', {
        // id from the token must win over any id sent in the body
        ...body,
        id,
      }),
    );
  }
  @Public()
  @Get('count')
  async count() {
    return await firstValueFrom(
      this.userClient.send('users.count', {}),
    );
  }

  @Public()
  @Get('topClients')
  async getTopClients() {
    return await firstValueFrom(
      this.userClient.send('users.findTopClients', {}),
    );
  }
  // "Top clients" page: paginated, searchable, filterable by rounded star rating.
  // Clients without reviews get their latest project attached as "last activity".
  @Public()
  @Get('clients/top')
  async getTopClientsPaged(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('ratings') ratings?: string,
  ) {
    const result = await sendRpc(this.userClient, 'users.findTopClientsPaged', {
      page: Number(page),
      limit: Number(limit),
      search,
      ratings: ratings ? ratings.split(',').map(Number) : undefined,
    });

    const withoutReview: string[] = result.data.filter((c) => !c.lastReview).map((c) => c.id);
    const lastProjects = withoutReview.length
      ? await sendRpc<Record<string, any>>(this.projectClient, 'projects.lastByClients', { ids: withoutReview })
        .catch(() => ({}))
      : {};

    // KYC status drives the "verified" badge on the card
    const verifications = await Promise.all(
      result.data.map((client) =>
        sendRpc(this.kycClient, 'accout-verification.findOneByUserId', { userId: client.id }).catch(() => null),
      ),
    );

    return {
      ...result,
      data: result.data.map((client, i) => ({
        ...client,
        lastProject: lastProjects[client.id] ?? null,
        isVerified: verifications[i]?.status === 'verified',
      })),
    };
  }

  @Public()
  @Get('topFreelancers')
  async getTopFreelancers() {
    return await firstValueFrom(
      this.userClient.send('users.findTopFreelancers', {}),
    );
  }
  @UseGuards(AuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.id;

    const avatarUrl = await this.cloudinaryService.uploadAvatar(file);

    return this.userClient.send('users.uploadAvatar', { userId, avatarUrl });
  }
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.userClient.send("users.get", { id })
    )
  }
}

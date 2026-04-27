import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Query,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Public } from '../auth/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guards/auth-guard';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Public()
  @Get('getAll')
  async getAll() {}

  @Public()
  @Get('profilesPreview')
  async getPreview(@Query() query: { role: string; amount: number }) {
    return await firstValueFrom(
      this.userClient.send('users.getProfilesPreview', query),
    );
  }

  @Put('update')
  async updateUser(@Body() body: any, @Req() req: Request) {
    const id = (req as any).user.id;

    return await firstValueFrom(
      this.userClient.send('users.update', {
        ...{ id, ...body },
      }),
    );
  }
  @Public()
  @Get('topClients')
  async getTopClients() {
    return await firstValueFrom(
      this.userClient.send('users.findTopClients', {}),
    );
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
}

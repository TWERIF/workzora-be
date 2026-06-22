import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { catchError, firstValueFrom } from 'rxjs';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';

@Controller('chat')
export class ChatController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    private readonly cloudinaryService: CloudinaryService,

    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) { }
  @Get()
  async getChats(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const userId = req.user.id;

    return await firstValueFrom(
      this.projectClient
        .send('chat.getChats', { userId, page: pageNum, limit: limitNum })
        .pipe(
          catchError((error: unknown) => {
            throw new HttpException(
              'Chat service unavailable',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
    );
  }

  @Get('project/:projectId')
  async findOrCreateChat(@Param('projectId') projectId: string) {
    return await firstValueFrom(
      this.projectClient.send('chat.findOrCreate', { projectId }).pipe(
        catchError((error: unknown) => {
          throw new HttpException(
            'Chat service unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }),
      ),
    );
  }

  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @Query('amount') amount?: string,
  ) {
    const limit = amount ? parseInt(amount, 10) : 30;

    const messages = await firstValueFrom(
      this.projectClient
        .send<any[]>('chat.getMessages', { chatId, amount: limit })
        .pipe(
          catchError((error: unknown) => {
            throw new HttpException(
              'Chat service unavailable',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
    );

    if (!messages || messages.length === 0) {
      return [];
    }

    const uniqueSenderIds = [...new Set(
      messages
        .map((m) => m.senderId)
        .filter((id): id is string => typeof id === 'string')
    )];

    const usersMap = new Map<string, any>();

    if (uniqueSenderIds.length > 0) {
      try {
        const users = await firstValueFrom(
          this.usersClient.send('users.getUsersByIds', { ids: uniqueSenderIds })
        );
        users.forEach(u => usersMap.set(u.id, u));
      } catch (error) {
        console.error('Failed to fetch users for messages:', error);
      }
    }

    return messages.map((item) => {
      const sender = item.senderId ? usersMap.get(item.senderId) : null;

      return {
        ...item,
        senderName: sender ? sender.name : 'Workzora',
        senderAvatar: sender ? sender.avatarUrl : null,
      };
    });
  }

  @Post(':chatId/messages')
  async saveMessage(@Param('chatId') chatId: string, @Body() payload: any) {
    return await firstValueFrom(
      this.projectClient.send('chat.saveMessage', { chatId, payload }).pipe(
        catchError((error: unknown) => {
          throw new HttpException(
            'Chat service unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }),
      ),
    );
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Файл не знайдено', HttpStatus.BAD_REQUEST);
    }

    try {
      const fileUrl = await this.cloudinaryService.uploadChatAttachment(file);
      return { fileUrl };
    } catch (error) {
      throw new HttpException(
        'Помилка завантаження файлу',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Patch('messages/:messageId/read')
  async markAsRead(@Param('messageId') messageId: string) {
    return await firstValueFrom(
      this.projectClient.send('chat.markAsRead', { messageId }).pipe(
        catchError((error: unknown) => {
          throw new HttpException(
            'Chat service unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }),
      ),
    );
  }
  @Get('all')
  async getAllChats(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return await firstValueFrom(
      this.projectClient
        .send('chat.getAllChats', {
          page: pageNum,
          limit: limitNum,
        })
        .pipe(
          catchError(() => {
            throw new HttpException(
              'Chat service unavailable',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
    );
  }
}

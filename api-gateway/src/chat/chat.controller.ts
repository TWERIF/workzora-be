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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, catchError } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';

@Controller('chat')
export class ChatController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
    return await firstValueFrom(
      this.projectClient
        .send('chat.getMessages', { chatId, amount: limit })
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
}

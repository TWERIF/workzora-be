import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';
import { rmqClient } from '../common/rmq';
import { ChatAccessService } from './chat-access.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    ClientsModule.register([
      rmqClient('PROJECT_SERVICE'),
      rmqClient('AUTH_SERVICE'),
      { ...rmqClient('USER_SERVICE'), name: 'USERS_SERVICE' },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatAccessService, CloudinaryService],
  exports: [CloudinaryService],
})
export class ChatModule {}

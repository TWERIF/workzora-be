import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ChatModule } from '../chat/chat.module';
import { rmqClient } from '../common/rmq';
import { PostsController } from './posts.controller';

@Module({
  imports: [ClientsModule.register([rmqClient('POSTS_SERVICE'), rmqClient('SEARCH_SERVICE')]), ChatModule],
  controllers: [PostsController],
})
export class PostsModule {}

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatModule } from '../chat/chat.module';
import { PostsController } from './posts.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'POSTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'posts_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'SEARCH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'search_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    ChatModule
  ],
  controllers: [PostsController]
})
export class PostsModule { }

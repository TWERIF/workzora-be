import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), ClientsModule.register([
    {
      name: 'SEARCH_CLIENT',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'search_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  ]),],
  providers: [PostsService],
  controllers: [PostsController]
})
export class PostsModule { }

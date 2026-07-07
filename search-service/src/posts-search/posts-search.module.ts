import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchPost } from './entities/post.entity';
import { PostsSearchController } from './posts-search.controller';
import { PostsSearchService } from './posts-search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchPost]),
    ClientsModule.register([
      {
        name: 'POSTS_SERVICE_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'posts_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),],
  providers: [PostsSearchService],
  controllers: [PostsSearchController]
})
export class PostsSearchModule { }

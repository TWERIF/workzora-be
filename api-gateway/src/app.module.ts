import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth-guard';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ChatModule } from './chat/chat.module';
import { CategoriesModule } from './categories/categories.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { BidsModule } from './bids/bids.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000 * 60,
          limit: 100,
        },
      ],
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'auth_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'users_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    AuthModule,
    UsersModule,
    ProjectsModule,
    ChatModule,
    CategoriesModule,
    BidsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }

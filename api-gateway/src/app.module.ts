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
import { KycModule } from './kyc/kyc.module';
import { PostsModule } from './posts/posts.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { EscrowModule } from './escrow/escrow.module';
import { PaymentDataModule } from './payment-data/payment-data.module';

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
    KycModule,
    PostsModule,
    PortfolioModule,
    EscrowModule,
    PaymentDataModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }

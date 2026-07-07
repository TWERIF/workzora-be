import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth-guard';
import { RolesGuard } from './guards/role-guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
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
      {
        name: 'KYC_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'kyc_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthGuard,
    RolesGuard,
  ],
  exports: [ClientsModule, AuthGuard, RolesGuard],
})
export class AuthModule { }

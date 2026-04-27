import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth-guard';
import { RolesGuard } from './guards/role-guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // 1. Об'єднуємо обидва сервіси в один виклик register()
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
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // Це робить AuthGuard глобальним
    },
    // 2. Додаємо гарди в провайдери модуля
    AuthGuard,
    RolesGuard,
  ],
  // 3. Експортуємо ClientsModule ТА самі гарди, щоб інші модулі їх бачили
  exports: [ClientsModule, AuthGuard, RolesGuard],
})
export class AuthModule {}

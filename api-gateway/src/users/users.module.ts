import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';

@Module({
  imports: [
    ClientsModule.register([
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
      {
        name: 'PROJECT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'projects_queue',
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
  ],
  providers: [UsersService, CloudinaryService],
  controllers: [UsersController],
})
export class UsersModule {}

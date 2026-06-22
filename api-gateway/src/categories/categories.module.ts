import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ClientsModule.register([
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
    ]),
    AuthModule,
  ],
  controllers: [CategoriesController]
})
export class CategoriesModule { }

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProjectsController } from './projects.controller';

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
    ClientsModule.register([
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
    AuthModule,
    UsersModule,
  ],

  controllers: [ProjectsController],
})
export class ProjectsModule { }

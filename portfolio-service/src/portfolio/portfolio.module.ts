import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio]),
  ClientsModule.register([
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
  providers: [PortfolioService],
  controllers: [PortfolioController]
})
export class PortfolioModule { }

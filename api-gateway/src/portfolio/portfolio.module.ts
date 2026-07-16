import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatModule } from '../chat/chat.module';
import { PortfolioController } from './portfolio.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PORTFOLIO_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'portfolio_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    ChatModule
  ],
  controllers: [PortfolioController]
})
export class PortfolioModule { }

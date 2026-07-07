import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { KycController } from './kyc.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
    ]),
    ChatModule
  ],
  controllers: [KycController]
})
export class KycModule { }

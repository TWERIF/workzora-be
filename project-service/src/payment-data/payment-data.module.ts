import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/entities/project.entity';
import { PaymentDataController } from './payment-data.controller';
import { PaymentDataService } from './payment-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    ClientsModule.register([
      {
        name: 'PAYMENT_DATA_SERVICE',
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
        name: 'ESCROW_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'escrow_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [PaymentDataService],
  controllers: [PaymentDataController]
})
export class PaymentDataModule { }

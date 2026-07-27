import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { MonobankService } from './monobank.service';
import { InvoicesController } from './invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'RABBIT_MQ_CLIENT',
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
  ],
  providers: [InvoicesService, MonobankService],
  controllers: [InvoicesController]
})
export class InvoicesModule { }

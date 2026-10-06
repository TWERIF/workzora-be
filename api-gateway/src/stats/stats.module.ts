import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { StatsController } from './stats.controller';

const rmq = (name: string, queue: string) => ({
  name,
  transport: Transport.RMQ as const,
  options: {
    urls: ['amqp://rabbitmq:5672'],
    queue,
    queueOptions: { durable: true },
  },
});

@Module({
  imports: [
    ClientsModule.register([
      rmq('USER_SERVICE', 'users_queue'),
      rmq('PROJECT_SERVICE', 'projects_queue'),
      rmq('INVOICES_SERVICE', 'escrow_queue'),
    ]),
  ],
  controllers: [StatsController],
})
export class StatsModule {}

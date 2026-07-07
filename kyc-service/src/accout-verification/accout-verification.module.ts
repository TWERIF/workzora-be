import { Module } from '@nestjs/common';
import { AccoutVerificationService } from './accout-verification.service';
import { AccoutVerificationController } from './accout-verification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccoutVerification } from './entities/account-verification.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([AccoutVerification]), ClientsModule.register([
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
  ]),],
  providers: [AccoutVerificationService],
  controllers: [AccoutVerificationController]
})
export class AccoutVerificationModule { }

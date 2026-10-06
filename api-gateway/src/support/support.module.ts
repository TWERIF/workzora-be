import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { rmqClient } from '../common/rmq';
import { SupportController } from './support.controller';

@Module({
  imports: [ClientsModule.register([rmqClient('SUPPORT_SERVICE'), rmqClient('AUTH_SERVICE')])],
  controllers: [SupportController],
})
export class SupportModule {}

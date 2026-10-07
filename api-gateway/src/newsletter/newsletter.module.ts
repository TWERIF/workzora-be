import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { rmqClient } from '../common/rmq';
import { NewsletterController } from './newsletter.controller';

@Module({
  imports: [ClientsModule.register([rmqClient('EMAIL_SERVICE')])],
  controllers: [NewsletterController],
})
export class NewsletterModule {}

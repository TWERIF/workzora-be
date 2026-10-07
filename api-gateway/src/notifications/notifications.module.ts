import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { rmqClient } from '../common/rmq';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [ClientsModule.register([rmqClient('NOTIFICATIONS_SERVICE')])],
  controllers: [NotificationsController],
})
export class NotificationsModule {}

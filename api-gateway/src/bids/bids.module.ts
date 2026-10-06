import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { rmqClient } from '../common/rmq';
import { BidsController } from './bids.controller';

@Module({
  imports: [ClientsModule.register([rmqClient('BIDS_SERVICE'), rmqClient('USER_SERVICE'), rmqClient('PROJECT_SERVICE')])],
  controllers: [BidsController],
})
export class BidsModule {}

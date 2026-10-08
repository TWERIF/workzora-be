import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { rmqClient } from '../common/rmq';
import { EscrowController } from './escrow.controller';
import { WalletController } from './wallet.controller';

@Module({
  imports: [
    ClientsModule.register([rmqClient('INVOICES_SERVICE'), rmqClient('PROJECT_SERVICE'), rmqClient('USER_SERVICE')]),
  ],
  controllers: [EscrowController, WalletController],
})
export class EscrowModule {}

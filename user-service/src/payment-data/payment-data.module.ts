import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardCryptoService } from './crypto.service';
import { PaymentData } from './entities/paymentData.entity';
import { PaymentDataController } from './payment-data.controller';
import { PaymentDataService } from './payment-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentData])
  ],
  providers: [PaymentDataService, CardCryptoService],
  controllers: [PaymentDataController]
})
export class PaymentDataModule { }

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IdDto, PaymentsListDto } from '../projects/dto';
import { PaymentDataService } from './payment-data.service';

@Controller()
export class PaymentDataController {
  constructor(private readonly paymentDataService: PaymentDataService) {}

  @MessagePattern('payments.findMany')
  findMany(@Payload() payload: PaymentsListDto) {
    return this.paymentDataService.findMany(payload);
  }

  @MessagePattern('payments.findOne')
  findOne(@Payload() payload: IdDto) {
    return this.paymentDataService.findOne(payload.id);
  }
}

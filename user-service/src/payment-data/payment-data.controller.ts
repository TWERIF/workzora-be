import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CardDto, UserIdDto } from './dto';
import { PaymentDataService } from './payment-data.service';

@Controller()
export class PaymentDataController {
  constructor(private readonly paymentDataService: PaymentDataService) {}

  @MessagePattern('paymentData.create')
  create(@Payload() data: CardDto) {
    return this.paymentDataService.create(data);
  }

  @MessagePattern('paymentData.update')
  update(@Payload() data: CardDto) {
    return this.paymentDataService.update(data);
  }

  @MessagePattern('paymentData.getFullCardNumber')
  getFullCardNumber(@Payload() data: UserIdDto) {
    return this.paymentDataService.getFullCardNumber(data.userId);
  }

  @MessagePattern('paymentData.getByUserId')
  getPaymentData(@Payload() data: UserIdDto) {
    return this.paymentDataService.getPaymentData(data.userId);
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AddCardDto, CardDto, CardRefDto, FullCardDto, UserIdDto } from './dto';
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

  @MessagePattern('paymentData.list')
  list(@Payload() data: UserIdDto) {
    return this.paymentDataService.list(data.userId);
  }

  @MessagePattern('paymentData.add')
  add(@Payload() data: AddCardDto) {
    return this.paymentDataService.add(data);
  }

  @MessagePattern('paymentData.setPrimary')
  setPrimary(@Payload() data: CardRefDto) {
    return this.paymentDataService.setPrimary(data);
  }

  @MessagePattern('paymentData.remove')
  remove(@Payload() data: CardRefDto) {
    return this.paymentDataService.remove(data);
  }

  @MessagePattern('paymentData.getCard')
  getCard(@Payload() data: CardRefDto) {
    return this.paymentDataService.getCard(data);
  }

  @MessagePattern('paymentData.getFullCardNumber')
  getFullCardNumber(@Payload() data: FullCardDto) {
    return this.paymentDataService.getFullCardNumber(data.userId, data.cardId);
  }

  @MessagePattern('paymentData.getByUserId')
  getPaymentData(@Payload() data: UserIdDto) {
    return this.paymentDataService.getPaymentData(data.userId);
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentDataService } from './payment-data.service';
import { CardDto } from './dto';

@Controller()
export class PaymentDataController {
    constructor(private readonly paymentDataService: PaymentDataService) { }

    @MessagePattern('paymentData.create')
    async create(@Payload() data: CardDto) {
        console.log("Got request")
        return await this.paymentDataService.create(data);
    }

    @MessagePattern('paymentData.update')
    async update(@Payload() data: CardDto) {
        console.log("Got request")
        return await this.paymentDataService.update(data);
    }

    @MessagePattern('paymentData.getByUserId')
    async getPaymentData(@Payload() data: { userId: string }) {
        return await this.paymentDataService.getPaymentData(data.userId);
    }
}
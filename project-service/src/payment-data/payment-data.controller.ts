import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentDataService } from './payment-data.service';

@Controller()
export class PaymentDataController {
    constructor(private readonly paymentDataService: PaymentDataService) { }

    @MessagePattern('payments.findMany')
    async findMany(
        @Payload()
        payload: {
            id: string;
            role: string;
            page: number;
            limit: number;
        },
    ) {
        return await this.paymentDataService.findMany(payload);
    }

    @MessagePattern('payments.findOne')
    async findOne(@Payload() payload: { id: string }) {
        return await this.paymentDataService.findOne(payload.id);
    }
}
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AccoutVerificationService } from './accout-verification.service';
import type { CreateAccountVerification, VerifyAccount } from './dto';

@Controller()
export class AccoutVerificationController {
    constructor(
        private readonly accoutVerificationService: AccoutVerificationService,
    ) { }

    @MessagePattern('accout-verification.create')
    async create(@Payload() body: CreateAccountVerification) {
        return await this.accoutVerificationService.create(body);
    }

    @MessagePattern('accout-verification.updateStatus')
    async updateStatus(@Payload() body: VerifyAccount) {
        return await this.accoutVerificationService.updateStatus(body);
    }

    @MessagePattern('accout-verification.findAll')
    async findAll(
        @Payload()
        data: {
            page: number;
            limit: number;
        },
    ) {
        return await this.accoutVerificationService.findAll(data);
    }

    @MessagePattern('accout-verification.findOne')
    async findOne(@Payload() data: { id: string }) {
        return await this.accoutVerificationService.findOne(data.id);
    }

    @MessagePattern('accout-verification.findOneByUserId')
    async findOneByUserId(@Payload() data: { userId: string }) {
        return await this.accoutVerificationService.findOneByUserId(
            data.userId,
        );
    }
}
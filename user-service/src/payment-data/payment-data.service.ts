import {
    Injectable,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardCryptoService } from './crypto.service';
import { CardDto } from './dto';
import { PaymentData } from './entities/paymentData.entity';

@Injectable()
export class PaymentDataService {
    constructor(
        @InjectRepository(PaymentData)
        private readonly paymentDataRepository: Repository<PaymentData>,
        private readonly crypto: CardCryptoService,
    ) { }

    async create(data: CardDto): Promise<Omit<PaymentData, 'cardNumberEncrypted' | 'cardNumberIv' | 'cardNumberAuthTag'>> {
        console.log(`Create`);
        const existing = await this.paymentDataRepository.findOne({
            where: { userId: data.userId },
        });
        console.log(`existing: ${existing}`);
        if (existing) {
            throw new RpcException(
                `Payment data for user ${data.userId} already exists, use update instead`,
            );
        }

        const { encrypted, iv, authTag } = this.crypto.encrypt(data.cardNumber);
        console.log(`encrypted: ${encrypted}, iv: ${iv}, authTag: ${authTag}`);
        const paymentData = this.paymentDataRepository.create({
            userId: data.userId,
            cardNumberEncrypted: encrypted,
            cardNumberIv: iv,
            cardNumberAuthTag: authTag,
            maskedCardNumber: this.mask(data.cardNumber),
        });
        console.log(`paymentData: ${paymentData}`);
        const saved = await this.paymentDataRepository.save(paymentData);
        console.log("saved");
        return this.stripSensitive(saved);
    }

    async update(data: CardDto) {
        console.log(`Update`);
        const existing = await this.paymentDataRepository.findOne({
            where: { userId: data.userId },
        });
        console.log(`existing: ${existing}`);
        if (!existing) {
            throw new RpcException(
                `Payment data for user ${data.userId} not found`,
            );
        }

        const { encrypted, iv, authTag } = this.crypto.encrypt(data.cardNumber);
        console.log(`encrypted: ${encrypted}, iv: ${iv}, authTag: ${authTag}`);
        existing.cardNumberEncrypted = encrypted;
        existing.cardNumberIv = iv;
        existing.cardNumberAuthTag = authTag;
        existing.maskedCardNumber = this.mask(data.cardNumber);

        const saved = await this.paymentDataRepository.save(existing);
        console.log("saved");
        return this.stripSensitive(saved);
    }
    async getPaymentData(userId: string): Promise<string> {
        console.log(userId);
        const existing = await this.paymentDataRepository.findOne({ where: { userId } });
        console.log(existing);
        if (!existing) {
            throw new RpcException(`Payment data for user ${userId} not found`);
        }
        return this.crypto.decrypt(
            existing.cardNumberEncrypted,
            existing.cardNumberIv,
            existing.cardNumberAuthTag,
        );
    }

    private mask(cardNumber: string): string {
        const last4 = cardNumber.slice(-4);
        return `•••• •••• •••• ${last4}`;
    }

    private stripSensitive(entity: PaymentData) {
        const { cardNumberEncrypted, cardNumberIv, cardNumberAuthTag, ...rest } = entity;
        return rest;
    }
}
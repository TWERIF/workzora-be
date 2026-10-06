import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardCryptoService } from './crypto.service';
import { CardDto } from './dto';
import { PaymentData } from './entities/paymentData.entity';

type SafePaymentData = Omit<PaymentData, 'cardNumberEncrypted' | 'cardNumberIv' | 'cardNumberAuthTag'>;

const rpcError = (statusCode: HttpStatus, message: string) => new RpcException({ statusCode, message });

@Injectable()
export class PaymentDataService {
  constructor(
    @InjectRepository(PaymentData)
    private readonly paymentDataRepository: Repository<PaymentData>,
    private readonly crypto: CardCryptoService,
  ) {}

  async create(data: CardDto): Promise<SafePaymentData> {
    const existing = await this.paymentDataRepository.findOne({ where: { userId: data.userId } });
    if (existing) throw rpcError(HttpStatus.CONFLICT, 'Payment data already exists, use update instead');

    const paymentData = this.paymentDataRepository.create({ userId: data.userId, ...this.encryptCard(data.cardNumber) });
    return this.stripSensitive(await this.paymentDataRepository.save(paymentData));
  }

  async update(data: CardDto): Promise<SafePaymentData> {
    const existing = await this.paymentDataRepository.findOne({ where: { userId: data.userId } });
    if (!existing) throw rpcError(HttpStatus.NOT_FOUND, 'Payment data not found');

    Object.assign(existing, this.encryptCard(data.cardNumber));
    return this.stripSensitive(await this.paymentDataRepository.save(existing));
  }

  async getPaymentData(userId: string): Promise<SafePaymentData> {
    const existing = await this.paymentDataRepository.findOne({ where: { userId } });
    if (!existing) throw rpcError(HttpStatus.NOT_FOUND, 'Payment data not found');
    return this.stripSensitive(existing);
  }

  async getFullCardNumber(userId: string): Promise<string> {
    const existing = await this.paymentDataRepository.findOne({ where: { userId } });
    if (!existing) throw rpcError(HttpStatus.NOT_FOUND, 'Payment data not found');
    return this.crypto.decrypt(existing.cardNumberEncrypted, existing.cardNumberIv, existing.cardNumberAuthTag);
  }

  private encryptCard(cardNumber: string) {
    const { encrypted, iv, authTag } = this.crypto.encrypt(cardNumber);
    return {
      cardNumberEncrypted: encrypted,
      cardNumberIv: iv,
      cardNumberAuthTag: authTag,
      maskedCardNumber: `•••• •••• •••• ${cardNumber.slice(-4)}`,
    };
  }

  private stripSensitive({
    cardNumberEncrypted: _encrypted,
    cardNumberIv: _iv,
    cardNumberAuthTag: _authTag,
    ...rest
  }: PaymentData): SafePaymentData {
    return rest;
  }
}

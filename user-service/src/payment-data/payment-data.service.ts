import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardCryptoService } from './crypto.service';
import { AddCardDto, CardDto, CardRefDto } from './dto';
import { PaymentData } from './entities/paymentData.entity';

type SafePaymentData = Omit<PaymentData, 'cardNumberEncrypted' | 'cardNumberIv' | 'cardNumberAuthTag'>;

const MAX_CARDS = 5;

const rpcError = (statusCode: HttpStatus, message: string) => new RpcException({ statusCode, message });

const passesLuhn = (number: string) => {
  let sum = 0;
  for (let i = 0; i < number.length; i++) {
    let digit = Number(number[number.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

const detectBrand = (number: string) => {
  if (/^4/.test(number)) return 'visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  return 'card';
};

const isExpired = (expiry: string) => {
  const [month, year] = expiry.split('/').map(Number);
  return new Date(2000 + year, month, 1).getTime() <= Date.now();
};

@Injectable()
export class PaymentDataService implements OnModuleInit {
  constructor(
    @InjectRepository(PaymentData)
    private readonly paymentDataRepository: Repository<PaymentData>,
    private readonly crypto: CardCryptoService,
  ) {}

  async onModuleInit() {
    await this.paymentDataRepository.query(`
      UPDATE payment_data.payment_datas p SET "isPrimary" = true
      WHERE NOT EXISTS (SELECT 1 FROM payment_data.payment_datas q WHERE q."userId" = p."userId" AND q."isPrimary")
        AND p.id = (SELECT r.id FROM payment_data.payment_datas r WHERE r."userId" = p."userId" ORDER BY r."createdAt" LIMIT 1)
    `);
  }

  async list(userId: string): Promise<SafePaymentData[]> {
    const cards = await this.paymentDataRepository.find({ where: { userId }, order: { isPrimary: 'DESC', createdAt: 'ASC' } });
    return cards.map((card) => this.stripSensitive(card));
  }

  async add({ userId, cardNumber, expiry }: AddCardDto): Promise<SafePaymentData> {
    if (!passesLuhn(cardNumber)) throw rpcError(HttpStatus.BAD_REQUEST, 'Card number is not valid');
    if (expiry && isExpired(expiry)) throw rpcError(HttpStatus.BAD_REQUEST, 'The card has expired');
    const count = await this.paymentDataRepository.count({ where: { userId } });
    if (count >= MAX_CARDS) throw rpcError(HttpStatus.BAD_REQUEST, `You can link up to ${MAX_CARDS} cards`);

    const card = this.paymentDataRepository.create({
      userId,
      ...this.encryptCard(cardNumber),
      expiry: expiry ?? null,
      isPrimary: count === 0,
    });
    return this.stripSensitive(await this.paymentDataRepository.save(card));
  }

  async setPrimary({ userId, id }: CardRefDto) {
    const card = await this.getOwned(userId, id);
    await this.paymentDataRepository.update({ userId }, { isPrimary: false });
    await this.paymentDataRepository.update(card.id, { isPrimary: true });
    return this.list(userId);
  }

  async remove({ userId, id }: CardRefDto) {
    const card = await this.getOwned(userId, id);
    await this.paymentDataRepository.delete(card.id);
    if (card.isPrimary) {
      const next = await this.paymentDataRepository.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
      if (next) await this.paymentDataRepository.update(next.id, { isPrimary: true });
    }
    return this.list(userId);
  }

  async getCard({ userId, id }: CardRefDto): Promise<SafePaymentData> {
    return this.stripSensitive(await this.getOwned(userId, id));
  }

  create(data: CardDto): Promise<SafePaymentData> {
    return this.add(data);
  }

  async update(data: CardDto): Promise<SafePaymentData> {
    const primary = await this.findPrimary(data.userId);
    if (!primary) throw rpcError(HttpStatus.NOT_FOUND, 'Payment data not found');
    Object.assign(primary, this.encryptCard(data.cardNumber));
    return this.stripSensitive(await this.paymentDataRepository.save(primary));
  }

  async getPaymentData(userId: string): Promise<SafePaymentData> {
    const primary = await this.findPrimary(userId);
    if (!primary) throw rpcError(HttpStatus.NOT_FOUND, 'Payment data not found');
    return this.stripSensitive(primary);
  }

  async getFullCardNumber(userId: string, cardId?: string): Promise<string> {
    const card = cardId
      ? await this.paymentDataRepository.findOne({ where: { id: cardId, userId } })
      : await this.findPrimary(userId);
    if (!card) throw rpcError(HttpStatus.NOT_FOUND, 'Payment data not found');
    return this.crypto.decrypt(card.cardNumberEncrypted, card.cardNumberIv, card.cardNumberAuthTag);
  }

  private findPrimary(userId: string) {
    return this.paymentDataRepository.findOne({ where: { userId }, order: { isPrimary: 'DESC', createdAt: 'ASC' } });
  }

  private async getOwned(userId: string, id: string) {
    const card = await this.paymentDataRepository.findOne({ where: { id, userId } });
    if (!card) throw rpcError(HttpStatus.NOT_FOUND, 'Card not found');
    return card;
  }

  private encryptCard(cardNumber: string) {
    const { encrypted, iv, authTag } = this.crypto.encrypt(cardNumber);
    return {
      cardNumberEncrypted: encrypted,
      cardNumberIv: iv,
      cardNumberAuthTag: authTag,
      maskedCardNumber: `•••• •••• •••• ${cardNumber.slice(-4)}`,
      brand: detectBrand(cardNumber),
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

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { rpcError } from '../common/rpc-validation.pipe';
import { CreateAccountVerificationDto, PaginationDto, VerifyAccountDto } from './dto';
import { AccoutVerification, VerificationStatus } from './entities/account-verification.entity';

@Injectable()
export class AccoutVerificationService {
  constructor(
    @InjectRepository(AccoutVerification)
    private readonly accoutVerificationRepo: Repository<AccoutVerification>,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async create(body: CreateAccountVerificationDto) {
    const existing = await this.accoutVerificationRepo.findOne({ where: { userId: body.userId } });
    if (existing?.status === VerificationStatus.VERIFIED) {
      throw rpcError(HttpStatus.CONFLICT, 'The account is already verified');
    }

    const verification = existing ?? this.accoutVerificationRepo.create({ userId: body.userId });
    Object.assign(verification, {
      documentUrl: body.documentUrl,
      selfieUrl: body.selfieUrl,
      status: VerificationStatus.IN_PROGRESS,
    });
    return this.accoutVerificationRepo.save(verification);
  }

  async updateStatus({ id, status }: VerifyAccountDto) {
    const result = await this.accoutVerificationRepo.update({ id }, { status });
    if (!result.affected) throw rpcError(HttpStatus.NOT_FOUND, 'Verification not found');
    return { success: true };
  }

  async findAll({ page = 1, limit = 10 }: PaginationDto) {
    const [items, total] = await this.accoutVerificationRepo.findAndCount({
      where: { status: VerificationStatus.IN_PROGRESS },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const verification = await this.accoutVerificationRepo.findOne({ where: { id } });
    if (!verification) throw rpcError(HttpStatus.NOT_FOUND, 'Verification not found');

    const user = await firstValueFrom(this.userClient.send<unknown>('users.get', { id: verification.userId })).catch(
      () => null,
    );
    return { ...verification, user };
  }

  findOneByUserId(userId: string) {
    return this.accoutVerificationRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}

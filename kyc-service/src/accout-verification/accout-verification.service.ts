import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CreateAccountVerification, VerifyAccount } from './dto';
import { AccoutVerification, VerificationStatus } from './entities/account-verification.entity';

@Injectable()
export class AccoutVerificationService {
    constructor(
        @InjectRepository(AccoutVerification)
        private readonly accoutVerificationRepo: Repository<AccoutVerification>,

        @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    ) { }

    async create(body: CreateAccountVerification) {
        try {
            const accountVerification = this.accoutVerificationRepo.create({
                ...body,
                status: VerificationStatus.IN_PROGRESS
            })
            return this.accoutVerificationRepo.save(accountVerification);
        } catch (error) {
            throw error;
        }
    }
    async updateStatus(body: VerifyAccount) {
        try {
            return await this.accoutVerificationRepo.update({
                id: body.id
            }, { status: body.status })
        } catch (error) {
            throw error;
        }
    }
    async findAll(data: { page: number; limit: number }) {
        try {
            const page = Number(data.page) || 1;
            const limit = Number(data.limit) || 10;

            const query = this.accoutVerificationRepo
                .createQueryBuilder('account_verification')
                .where('account_verification.status = :status', {
                    status: VerificationStatus.IN_PROGRESS
                })
                .orderBy('account_verification.createdAt', 'ASC')
                .skip((page - 1) * limit)
                .take(limit);

            const [items, total] = await query.getManyAndCount();

            return {
                items: items.map((item: AccoutVerification) => ({
                    ...item,
                })),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            throw error;
        }
    }
    async findOne(id: string) {
        try {
            const verification = await this.accoutVerificationRepo.findOne({ where: { id } });
            if (!verification) throw new BadRequestException();
            const user = await firstValueFrom(this.userClient.send("users.get", { id: verification.userId }))
            return {
                ...verification,
                user
            }
        } catch (error) {
            throw error;
        }
    }
    async findOneByUserId(userId: string) {
        try {
            return await this.accoutVerificationRepo.findOne({ where: { userId } });
        } catch (error) {
            throw error;
        }
    }
}

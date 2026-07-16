import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CreatePortfolio, UpdatePortfolio } from './dto';
import { Portfolio } from './entities/portfolio.entity';

@Injectable()
export class PortfolioService {
    constructor(
        @InjectRepository(Portfolio)
        private readonly portfolioRepository: Repository<Portfolio>,

        @Inject('USER_SERVICE')
        private readonly userClient: ClientProxy,
    ) { }

    async create(dto: CreatePortfolio) {
        try {
            const existing = await this.portfolioRepository.findOne({ where: { title: dto.title, userId: dto.userId } })
            if (existing) throw new BadRequestException();

            const portfolio = this.portfolioRepository.create(dto);
            return await this.portfolioRepository.save(portfolio);
        } catch (error) {
            throw error;
        }
    }
    async update(dto: UpdatePortfolio) {
        try {
            const existing = await this.portfolioRepository.findOne({ where: { id: dto.id } });
            if (!existing) throw new BadRequestException();

            await this.portfolioRepository.update(dto.id, dto);

            return await this.portfolioRepository.findOne({
                where: {
                    id: dto.id
                }
            });
        } catch (error) {
            throw error;
        }
    }
    async delete(id: string) {
        try {
            const existing = await this.portfolioRepository.findOne({
                where: {
                    id
                }
            });

            if (!existing)
                throw new NotFoundException();

            await this.portfolioRepository.remove(existing);

            return {
                success: true
            };
        } catch (error) {
            throw error;
        }
    }
    async findByUserId(userId: string) {
        try {
            return await this.portfolioRepository.find({ where: { userId } })
        } catch (error) {
            throw error;
        }
    }
    async findAll({ page, limit }: {
        page: number;
        limit: number;
    }) {
        try {
            const [items, total] = await this.portfolioRepository
                .createQueryBuilder('portfolio')
                .orderBy('portfolio.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            const ids = items.map((item) => item.userId);
            const users = await firstValueFrom(this.userClient.send("users.getUsersByIds", { ids }));

            const itemsWithUsers = items.map((item) => {
                return {
                    ...item,
                    user: users.find((u) => u.id === item.userId) || null
                }
            });

            return {
                items: itemsWithUsers,
                total,
                page,
                limit,
            };
        } catch (error) {
            throw error;
        }
    }
}

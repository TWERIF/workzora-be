import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { In, Repository } from 'typeorm';
import { CreatePortfolioDto, DeletePortfolioDto, PaginationDto, PortfolioIdDto, UpdatePortfolioDto } from './dto';
import { Portfolio } from './entities/portfolio.entity';

export interface PortfolioAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

const rpcError = (statusCode: HttpStatus, message: string) => new RpcException({ statusCode, message });

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @Inject('USER_SERVICE')
    private readonly userClient: ClientProxy,
  ) {}

  async create(dto: CreatePortfolioDto) {
    const existing = await this.portfolioRepository.findOne({ where: { title: dto.title, userId: dto.userId } });
    if (existing) throw rpcError(HttpStatus.CONFLICT, 'A portfolio item with this title already exists');

    return this.portfolioRepository.save(this.portfolioRepository.create(dto));
  }

  async update({ id, userId, ...changes }: UpdatePortfolioDto) {
    const existing = await this.getOwned(id, userId);
    Object.assign(existing, Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined)));
    return this.portfolioRepository.save(existing);
  }

  async delete({ id, userId }: DeletePortfolioDto) {
    const existing = await this.getOwned(id, userId);
    await this.portfolioRepository.remove(existing);
    return { success: true };
  }

  async addView({ id }: PortfolioIdDto) {
    await this.portfolioRepository.increment({ id }, 'views', 1);
    return { success: true };
  }

  findByUserId(userId: string) {
    return this.portfolioRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findByUserIds(userIds: string[]): Promise<Portfolio[]> {
    if (!userIds.length) return [];
    return this.portfolioRepository.find({ where: { userId: In(userIds) } });
  }

  async findLatestByUserIds(userIds: string[]): Promise<Record<string, Portfolio>> {
    if (!userIds.length) return {};
    const items = await this.portfolioRepository.find({ where: { userId: In(userIds) }, order: { createdAt: 'DESC' } });
    const latest: Record<string, Portfolio> = {};
    for (const item of items) latest[item.userId] ??= item;
    return latest;
  }

  async findAll({ page, limit }: PaginationDto) {
    const [items, total] = await this.portfolioRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const ids = [...new Set(items.map((item) => item.userId))];
    const users = ids.length
      ? await firstValueFrom(this.userClient.send<PortfolioAuthor[]>('users.getUsersByIds', { ids }))
      : [];
    const usersById = new Map(users.map((user) => [user.id, user]));

    return {
      items: items.map((item) => ({ ...item, user: usersById.get(item.userId) ?? null })),
      total,
      page,
      limit,
    };
  }

  private async getOwned(id: string, userId: string) {
    const existing = await this.portfolioRepository.findOne({ where: { id } });
    if (!existing) throw rpcError(HttpStatus.NOT_FOUND, 'Portfolio item not found');
    if (existing.userId !== userId) throw rpcError(HttpStatus.FORBIDDEN, 'Only the owner can change this item');
    return existing;
  }
}

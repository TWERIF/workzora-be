import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import { FindByEmailDto } from './dto';
import { User } from './entities/user.entity';

import { PortfolioService } from '../portfolio/portfolio.service';
import { ReviewsService } from '../reviews/reviews.service';
import { UserRole } from '../types';

// Fields safe to expose on public listings (no password hash / emails).
const PUBLIC_USER_FIELDS: (keyof User)[] = [
  'id', 'firstName', 'lastName', 'username', 'role', 'skills', 'ratings', 'rates', 'rate',
  'position', 'avatarUrl', 'bio', 'city', 'country', 'availability', 'createdAt',
];

export interface TopClientsQuery {
  page?: number;
  limit?: number;
  search?: string;
  // rounded star ratings (1-5) to include
  ratings?: number[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly portfolioService: PortfolioService,
    private readonly reviewsService: ReviewsService,
  ) { }

  async createUser(data: Partial<User>): Promise<User> {
    const { email, password } = data;
    if (!email || !password)
      throw new HttpException(
        'User email or password must be provided',
        HttpStatus.BAD_REQUEST,
      );

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }
  async count() {
    try {
      return this.userRepository.count();
    } catch (error) {
      throw error;
    }
  }

  async get(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: id } });
      if (!user) throw new BadRequestException();

      const { password, ...result } = user;

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMany(ids: string[]) {
    return await this.userRepository.find({
      where: {
        id: In(ids),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        position: true,
        ratings: true,
        rates: true
      }
    });
  }

  async getUsersByIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];

    const users = await this.getMany(ids);

    return users.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Користувач',
      avatarUrl: user.avatarUrl || null,
    }));
  }

  async updateUser(data: Partial<User>): Promise<{ success: true }> {
    console.log('data:', data);

    const user = await this.userRepository.findOne({
      where: { id: data.id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Registration date is set once on insert and must not be editable by the user.
    delete data.createdAt;
    // Rating and review count are derived from reviews (see ReviewsService).
    delete data.ratings;
    delete data.rates;
    // Users pick client/freelancer on the account-type page; admin can't be self-assigned.
    if (data.role !== undefined && ![UserRole.CLIENT, UserRole.FREELANCER].includes(data.role as UserRole)) {
      delete data.role;
    }

    Object.keys(data).forEach((key) => {
      if (data[key as keyof User] === undefined) {
        delete data[key as keyof User];
      }
    });

    await this.userRepository.update(user.id, data);

    return { success: true };
  }

  async findByEmail(data: FindByEmailDto): Promise<User | null> {
    return this.userRepository.findOne({ where: { email: data.email } });
  }

  async findTopClients() {
    return this.userRepository.find({
      select: PUBLIC_USER_FIELDS,
      where: { role: UserRole.CLIENT },
      order: {
        ratings: 'DESC',
      },
      take: 5,
    });
  }

  // Paginated "Top clients" listing with search, a star-rating filter and the latest review of each client.
  async findTopClientsPaged({ page = 1, limit = 10, search, ratings }: TopClientsQuery) {
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const qb = this.userRepository
      .createQueryBuilder('client')
      .select(PUBLIC_USER_FIELDS.map((field) => `client.${field}`))
      .where('client.role = :role', { role: UserRole.CLIENT });

    if (search?.trim()) {
      qb.andWhere(
        "(client.firstName ILIKE :search OR client.lastName ILIKE :search OR client.username ILIKE :search OR CONCAT(client.firstName, ' ', client.lastName) ILIKE :search)",
        { search: `%${search.trim()}%` },
      );
    }

    const ratingFilter = (ratings ?? []).map(Number).filter((r) => r >= 1 && r <= 5);
    if (ratingFilter.length) {
      qb.andWhere('ROUND(client.ratings) IN (:...ratingFilter)', { ratingFilter });
    }

    const [users, total] = await qb
      .orderBy('client.ratings', 'DESC')
      .addOrderBy('client.rates', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // counts per star bucket for the filter sidebar (independent of the rating filter itself)
    const buckets = await this.userRepository
      .createQueryBuilder('client')
      .select('ROUND(client.ratings)', 'stars')
      .addSelect('COUNT(*)', 'count')
      .where('client.role = :role AND client.ratings > 0', { role: UserRole.CLIENT })
      .groupBy('stars')
      .getRawMany<{ stars: string; count: string }>();

    const ratingCounts = Object.fromEntries(
      [5, 4, 3, 2, 1].map((stars) => [
        stars,
        Number(buckets.find((b) => Number(b.stars) === stars)?.count ?? 0),
      ]),
    );

    const lastReviews = await this.reviewsService.findLastByTargets(users.map((u) => u.id));

    return {
      data: users.map((user) => ({ ...user, lastReview: lastReviews[user.id] ?? null })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      ratingCounts,
    };
  }

  async findTopFreelancers() {
    const users = await this.userRepository.find({
      select: PUBLIC_USER_FIELDS,
      where: { role: UserRole.FREELANCER },
      order: {
        ratings: 'DESC',
      },
      take: 6,
    });
    const userIds = users.map((item) => item.id);
    const portfolios = await this.portfolioService.findByUserIds(userIds);

    console.log(portfolios);

    return users.map((item) => {
      return {
        ...item,
        portfolio: portfolios.find((el) => el.userId == item.id)
      }
    })

  }

  async getProfilesPreview({ role, amount }: { role: string; amount: any }) {
    return await this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'avatarUrl'],
      where: {
        role: role,
      },
      take: Number(amount) || 10,
      order: {
        ratings: 'DESC',
      },
    });
  }
  async uploadImage(data) {
    const user = await this.userRepository.findOne({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(user.id, { avatarUrl: data.avatarUrl });
    return { success: true };
  }
}

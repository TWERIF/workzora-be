import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

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

export const ROLE_SWITCH_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class UsersService implements OnModuleInit {
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

  // Accounts that existed before the roleSelected column have already chosen their role.
  // Fresh sign-ups (last 24h) keep the chance to pick it on the account-type page.
  async onModuleInit() {
    await this.userRepository.query(
      `UPDATE users.users SET "roleSelected" = true
       WHERE "roleSelected" = false AND ("createdAt" IS NULL OR "createdAt" < now() - interval '1 day')`,
    );
  }

  async setPassword(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    await this.userRepository.update({ email }, { password: hashed });
  }

  async switchRole({ id, activeDeals }: { id: string; activeDeals: number }) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new RpcException({ statusCode: 404, message: 'User not found' });

    if (![UserRole.CLIENT, UserRole.FREELANCER].includes(user.role as UserRole)) {
      throw new RpcException({ statusCode: 403, message: 'This account type cannot be switched' });
    }
    if (activeDeals > 0) {
      throw new RpcException({ statusCode: 409, message: 'Finish your active projects before switching the account type' });
    }
    if (user.roleSwitchedAt) {
      const nextSwitchAt = new Date(user.roleSwitchedAt.getTime() + ROLE_SWITCH_DAYS * DAY_MS);
      if (nextSwitchAt > new Date()) {
        throw new RpcException({ statusCode: 429, message: `The account type can be switched again after ${nextSwitchAt.toISOString()}` });
      }
    }

    const role = user.role === UserRole.CLIENT ? UserRole.FREELANCER : UserRole.CLIENT;
    const roleSwitchedAt = new Date();
    await this.userRepository.update(id, { role, roleSwitchedAt, roleSelected: true });

    return {
      role,
      roleSwitchedAt,
      nextSwitchAt: new Date(roleSwitchedAt.getTime() + ROLE_SWITCH_DAYS * DAY_MS),
    };
  }

  async updateUser(data: Partial<User>): Promise<{ success: true }> {
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
    // Password changes need their own flow (old password / email code), and activation is server-side only.
    delete data.password;
    delete data.isActive;
    // The role is picked once on the account-type page after sign-up; later changes go through
    // switchRole (once a week, no running deals). Admin can never be self-assigned.
    if (data.role !== undefined) {
      if (user.roleSelected || ![UserRole.CLIENT, UserRole.FREELANCER].includes(data.role as UserRole)) {
        delete data.role;
      } else {
        data.roleSelected = true;
      }
    }
    delete (data as Partial<User>).roleSwitchedAt;

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

  // Returns the user without the password hash when the credentials match, otherwise null.
  async validateCredentials(data: { email?: string; password?: string }): Promise<Omit<User, 'password' | 'setCreatedAt'> | null> {
    if (!data?.email || !data?.password) return null;
    const user = await this.userRepository.findOne({ where: { email: data.email } });
    if (!user?.password) return null;

    const matches = await bcrypt.compare(data.password, user.password);
    if (!matches) return null;

    const { password, ...result } = user;
    return result;
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

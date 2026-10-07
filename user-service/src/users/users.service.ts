import { Notifier } from '../common/notifier';
import {
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { In, Repository } from 'typeorm';
import { FindByEmailDto } from './dto';
import { User } from './entities/user.entity';

import { PortfolioService } from '../portfolio/portfolio.service';
import { ReviewsService } from '../reviews/reviews.service';
import { UserRole } from '../types';

const PUBLIC_USER_FIELDS: (keyof User)[] = [
  'id', 'firstName', 'lastName', 'username', 'role', 'skills', 'ratings', 'rates', 'rate',
  'position', 'avatarUrl', 'bio', 'city', 'country', 'availability', 'createdAt', 'lastSeenAt',
];

export interface TopClientsQuery {
  page?: number;
  limit?: number;
  search?: string;
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
    private readonly notifier: Notifier,
  ) { }

  async createUser(data: Partial<User>): Promise<User> {
    const { email, password } = data;
    if (!email || !password) {
      throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'User email or password must be provided' });
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new RpcException({ statusCode: HttpStatus.CONFLICT, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.save(this.userRepository.create({ ...data, password: hashedPassword }));
    if (user.role !== 'admin') {
      this.notifier.notify({ userId: user.id, type: 'system', key: 'welcome', link: '/knowledgebase' });
    }
    return user;
  }

  async findOrCreate(profile: { email: string; name?: string; avatar?: string }) {
    const existing = await this.userRepository.findOne({ where: { email: profile.email } });
    if (existing) {
      const { password: _password, ...user } = existing;
      return user;
    }

    const [firstName = '', ...rest] = (profile.name ?? '').trim().split(/\s+/);
    const created = await this.createUser({
      email: profile.email,
      password: randomBytes(32).toString('hex'),
      firstName,
      lastName: rest.join(' '),
      username: profile.email.split('@')[0],
      avatarUrl: profile.avatar,
      isActive: true,
    });
    const { password: _password, ...user } = created;
    return user;
  }

  async count() {
    try {
      return this.userRepository.count();
    } catch (error) {
      throw error;
    }
  }

  async get(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new RpcException({ statusCode: 404, message: 'User not found' });

    const { password: _password, ...result } = user;
    return result;
  }

  async getPublic(id: string) {
    const user = await this.userRepository.findOne({
      select: [...PUBLIC_USER_FIELDS, 'workType', 'preferredBudgetType', 'preferredProjectSize', 'rateType', 'rateNote', 'projectType', 'budgetRange', 'workFormat'],
      where: { id },
    });
    if (!user) throw new RpcException({ statusCode: 404, message: 'User not found' });
    return user;
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
      throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'User not found' });
    }

    delete data.createdAt;
    delete data.ratings;
    delete data.rates;
    delete data.password;
    delete data.isActive;
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

    return users.map((item) => ({
      ...item,
      portfolio: portfolios.find((portfolio) => portfolio.userId === item.id),
    }));
  }

  getProfilesPreview({ role, amount }: { role?: string; amount?: number }) {
    return this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'avatarUrl'],
      where: role ? { role } : {},
      take: amount ?? 10,
      order: { ratings: 'DESC' },
    });
  }

  async uploadImage(data: { userId: string; avatarUrl: string }) {
    const result = await this.userRepository.update(data.userId, { avatarUrl: data.avatarUrl });
    if (!result.affected) throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'User not found' });
    return { success: true };
  }

  async removeAvatar(id: string) {
    await this.userRepository.update(id, { avatarUrl: null });
    return { success: true };
  }

  async touch(id: string) {
    await this.userRepository.update(id, { lastSeenAt: new Date() });
  }
}

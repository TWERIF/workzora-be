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

import { UserRole } from '../types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      where: { role: UserRole.CLIENT },
      order: {
        ratings: 'DESC',
      },
      take: 5,
    });
  }

  async findTopFreelancers() {
    return this.userRepository.find({
      where: { role: UserRole.FREELANCER },
      order: {
        ratings: 'DESC',
      },
      take: 5,
    });
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

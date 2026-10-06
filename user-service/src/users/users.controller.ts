import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConfirmEmailDto, CreateUserDto, FindByEmailDto } from './dto';
import { EmailService } from './email.service';
import { User } from './entities/user.entity';
import { UserRole } from '../types';
import type { TopClientsQuery } from './users.service';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
  ) { }

  @MessagePattern('users.get')
  async get(@Payload() data: { id: string }) {
    return this.userService.get(data.id);
  }

  @MessagePattern('users.count')
  async count() {
    return this.userService.count();
  }

  @MessagePattern('users.getMany')
  async getMany(@Payload() ids: string[]) {
    return this.userService.getMany(ids);
  }

  @MessagePattern('users.getUsersByIds')
  async getUsersByIds(@Payload() data: { ids: string[] }) {
    return this.userService.getUsersByIds(data.ids);
  }

  @MessagePattern('users.create')
  async createUser(data: CreateUserDto) {
    return this.userService.createUser(data);
  }

  @MessagePattern('users.update')
  async updateUser(data: Partial<User>) {
    return this.userService.updateUser(data);
  }

  @MessagePattern('users.confirmEmail')
  async confirmEmail(data: FindByEmailDto) {
    return this.emailService.confirmEmail(data);
  }

  @MessagePattern('users.verifyCode')
  async verifyCode(data: ConfirmEmailDto) {
    return this.emailService.verifyCode(data);
  }

  @MessagePattern('users.switchRole')
  async switchRole(data: { id: string; activeDeals: number }) {
    return this.userService.switchRole(data);
  }

  @MessagePattern('users.validateCredentials')
  async validateCredentials(data: { email: string; password: string }) {
    return this.userService.validateCredentials(data);
  }

  // Public sign-up: only whitelisted fields are accepted, the role is limited to client/freelancer
  // and the account is active only if the email code was confirmed on the server.
  @MessagePattern('users.register')
  async register(data: Partial<CreateUserDto> & { locale?: string }) {
    const role = [UserRole.CLIENT, UserRole.FREELANCER].includes(data.role as UserRole) ? data.role : undefined;
    const isActive = data.email ? await this.emailService.isEmailVerified(data.email) : false;

    return this.userService.createUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      username: data.username ?? '',
      ...(role ? { role } : {}),
      isActive,
    });
  }

  @MessagePattern('users.findByEmail')
  async findByEmail(data: FindByEmailDto) {
    return this.userService.findByEmail(data);
  }

  @MessagePattern('users.findTopClients')
  async findTopClients() {
    return this.userService.findTopClients();
  }

  @MessagePattern('users.findTopClientsPaged')
  async findTopClientsPaged(@Payload() data: TopClientsQuery) {
    return this.userService.findTopClientsPaged(data);
  }

  @MessagePattern('users.findTopFreelancers')
  async findTopFreelancers() {
    return this.userService.findTopFreelancers();
  }
  @MessagePattern('users.uploadAvatar')
  async uploadAvatar(data) {
    return this.userService.uploadImage(data);
  }
  @MessagePattern('users.getProfilesPreview')
  async getProfilesPreview(@Payload() data: { role: string; amount: number }) {
    return this.userService.getProfilesPreview(data);
  }
}

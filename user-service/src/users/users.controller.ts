import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
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

  // Always answers success, so the form can't be used to find out which emails are registered.
  @MessagePattern('users.requestPasswordReset')
  async requestPasswordReset(data: { email?: string; locale?: string }) {
    const email = data?.email?.trim();
    if (email) {
      const user = await this.userService.findByEmail({ email });
      if (user) {
        await this.emailService.sendPasswordResetCode(user.email, data.locale)
          .catch((error) => console.error('Password reset email failed:', error?.message ?? error));
      }
    }
    return { success: true };
  }

  @MessagePattern('users.resetPassword')
  async resetPassword(data: { email?: string; code?: string; password?: string }) {
    const email = data?.email?.trim();
    const password = data?.password ?? '';
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      throw new RpcException({ statusCode: 400, message: 'Password must be at least 8 characters and contain a letter and a digit' });
    }
    if (!email || !data.code || !(await this.emailService.consumePasswordResetCode(email, data.code))) {
      throw new RpcException({ statusCode: 400, message: 'Invalid or expired code' });
    }
    await this.userService.setPassword(email, password);
    return { success: true };
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

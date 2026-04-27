import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConfirmEmailDto, CreateUserDto, FindByEmailDto } from './dto';
import { EmailService } from './email.service';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller()
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @MessagePattern('users.get')
  async get(id) {
    return this.userService.get(id);
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

  @MessagePattern('users.findByEmail')
  async findByEmail(data: FindByEmailDto) {
    return this.userService.findByEmail(data);
  }

  @MessagePattern('users.findTopClients')
  async findTopClients() {
    return this.userService.findTopClients();
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

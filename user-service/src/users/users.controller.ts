import { Controller, HttpStatus, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  ConfirmEmailDto,
  CreateUserDto,
  CredentialsDto,
  FindByEmailDto,
  GoogleProfileDto,
  IdDto,
  IdsDto,
  PasswordResetDto,
  PasswordResetRequestDto,
  ProfilesPreviewDto,
  RegisterUserDto,
  SwitchRoleDto,
  TopClientsQueryDto,
  UpdateUserDto,
  UploadAvatarDto,
} from './dto';
import { EmailService } from './email.service';
import { UsersService } from './users.service';

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @MessagePattern('users.getPublic')
  getPublic(@Payload() data: IdDto) {
    return this.userService.getPublic(data.id);
  }

  @MessagePattern('users.get')
  get(@Payload() data: IdDto) {
    return this.userService.get(data.id);
  }

  @MessagePattern('users.count')
  count() {
    return this.userService.count();
  }

  @MessagePattern('users.getMany')
  getMany(@Payload() ids: string[]) {
    return this.userService.getMany(Array.isArray(ids) ? ids : []);
  }

  @MessagePattern('users.getUsersByIds')
  getUsersByIds(@Payload() data: IdsDto) {
    return this.userService.getUsersByIds(data.ids);
  }

  @MessagePattern('users.create')
  createUser(@Payload() data: CreateUserDto) {
    return this.userService.createUser(data);
  }

  @MessagePattern('users.findOrCreate')
  findOrCreate(@Payload() data: GoogleProfileDto) {
    return this.userService.findOrCreate(data);
  }

  @MessagePattern('users.update')
  updateUser(@Payload() data: UpdateUserDto) {
    return this.userService.updateUser(data);
  }

  @MessagePattern('users.confirmEmail')
  confirmEmail(@Payload() data: FindByEmailDto) {
    return this.emailService.confirmEmail(data);
  }

  @MessagePattern('users.verifyCode')
  verifyCode(@Payload() data: ConfirmEmailDto) {
    return this.emailService.verifyCode(data);
  }

  @MessagePattern('users.requestPasswordReset')
  async requestPasswordReset(@Payload() data: PasswordResetRequestDto) {
    const user = await this.userService.findByEmail({ email: data.email.trim() });
    if (user) {
      await this.emailService
        .sendPasswordResetCode(user.email, data.locale)
        .catch((error: unknown) => this.logger.warn(`Password reset email failed: ${String(error)}`));
    }
    return { success: true };
  }

  @MessagePattern('users.resetPassword')
  async resetPassword(@Payload() data: PasswordResetDto) {
    if (!PASSWORD_RULE.test(data.password)) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Password must be at least 8 characters and contain a letter and a digit',
      });
    }
    const email = data.email.trim();
    if (!(await this.emailService.consumePasswordResetCode(email, data.code))) {
      throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid or expired code' });
    }
    await this.userService.setPassword(email, data.password);
    return { success: true };
  }

  @MessagePattern('users.switchRole')
  switchRole(@Payload() data: SwitchRoleDto) {
    return this.userService.switchRole(data);
  }

  @MessagePattern('users.validateCredentials')
  validateCredentials(@Payload() data: CredentialsDto) {
    return this.userService.validateCredentials(data);
  }

  @MessagePattern('users.register')
  async register(@Payload() data: RegisterUserDto) {
    const isActive = await this.emailService.isEmailVerified(data.email);
    return this.userService.createUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      ...(data.role ? { role: data.role } : {}),
      isActive,
    });
  }

  @MessagePattern('users.findByEmail')
  findByEmail(@Payload() data: FindByEmailDto) {
    return this.userService.findByEmail(data);
  }

  @MessagePattern('users.findTopClients')
  findTopClients() {
    return this.userService.findTopClients();
  }

  @MessagePattern('users.findTopClientsPaged')
  findTopClientsPaged(@Payload() data: TopClientsQueryDto) {
    return this.userService.findTopClientsPaged(data);
  }

  @MessagePattern('users.findTopFreelancers')
  findTopFreelancers() {
    return this.userService.findTopFreelancers();
  }

  @MessagePattern('users.uploadAvatar')
  uploadAvatar(@Payload() data: UploadAvatarDto) {
    return this.userService.uploadImage(data);
  }

  @MessagePattern('users.getProfilesPreview')
  getProfilesPreview(@Payload() data: ProfilesPreviewDto) {
    return this.userService.getProfilesPreview(data);
  }
}

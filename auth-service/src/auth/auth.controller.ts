import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.login')
  async login(data: LoginDto) {
    return await this.authService.login(data);
  }

  @MessagePattern('auth.google.verify')
  async googleVerify(data: { idToken: string }) {
    return this.authService.verifyGoogleToken(data.idToken);
  }

  @MessagePattern('auth.refresh')
  async refresh(token: string) {
    return await this.authService.refresh(token);
  }

  @MessagePattern('auth.verify')
  async verify(token: string) {
    return await this.authService.verify(token);
  }

  @MessagePattern('auth.health')
  async health() {
    return 'ok';
  }
}

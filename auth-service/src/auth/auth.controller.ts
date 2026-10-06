import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { GoogleVerifyDto, LoginDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.login')
  login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }

  @MessagePattern('auth.google.verify')
  googleVerify(@Payload() data: GoogleVerifyDto) {
    return this.authService.verifyGoogleToken(data.idToken);
  }

  @MessagePattern('auth.refresh')
  refresh(@Payload() token: string) {
    return this.authService.refresh(token);
  }

  @MessagePattern('auth.verify')
  verify(@Payload() token: string) {
    return this.authService.verify(token);
  }

  @MessagePattern('auth.health')
  health() {
    return 'ok';
  }
}

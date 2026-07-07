import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from '../public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('KYC_SERVICE') private readonly kycClient: ClientProxy,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.['access_token'];

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      const payload = await firstValueFrom(
        this.authClient.send('auth.verify', token),
      );

      const fullUser = await firstValueFrom(
        this.userClient.send('users.findByEmail', { email: payload.email }),
      );

      if (!fullUser) {
        throw new UnauthorizedException('User no longer exists');
      }
      console.log(fullUser)
      const verification = await firstValueFrom(
        this.kycClient.send('accout-verification.findOneByUserId', { userId: fullUser.id }),
      );

      delete fullUser.password;
      request.user = { ...fullUser, verification: verification ?? null };
      return true;
    } catch (e) {
      console.error('Guard Error:', e);
      throw new UnauthorizedException('Session expired or invalid');
    }
  }
}
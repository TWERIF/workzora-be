import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import type { AccountVerification, AuthUser, RequestWithUser } from '../../common/auth-user';
import { sendRpc } from '../../common/rpc';
import { IS_PUBLIC_KEY } from '../public.decorator';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

type StoredUser = Omit<AuthUser, 'verification'> & { password?: string };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('KYC_SERVICE') private readonly kycClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token: unknown = request.cookies?.['access_token'];
    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      const payload = await sendRpc<TokenPayload>(this.authClient, 'auth.verify', token);
      const storedUser = await sendRpc<StoredUser | null>(this.userClient, 'users.findByEmail', { email: payload.email });
      if (!storedUser) throw new UnauthorizedException('User no longer exists');

      const verification = await sendRpc<AccountVerification | null>(
        this.kycClient,
        'accout-verification.findOneByUserId',
        { userId: storedUser.id },
      );

      const { password: _password, ...user } = storedUser;
      request.user = { ...user, verification: verification ?? null };
      return true;
    } catch {
      throw new UnauthorizedException('Session expired or invalid');
    }
  }
}

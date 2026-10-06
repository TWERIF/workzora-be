import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { OAuth2Client } from 'google-auth-library';
import { LoginDto } from './dto';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

const unauthorized = (message: string) => new RpcException({ statusCode: HttpStatus.UNAUTHORIZED, message });

@Injectable()
export class AuthService {
  private readonly googleClientId = process.env.GOOGLE_CLIENT_ID;
  private readonly googleClient = new OAuth2Client(this.googleClientId);

  constructor(private readonly jwtService: JwtService) {}

  login(user: LoginDto) {
    const payload: TokenPayload = { id: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '12h' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: payload,
    };
  }

  refresh(refreshToken: string) {
    try {
      return this.login(this.jwtService.verify<TokenPayload>(refreshToken));
    } catch {
      throw unauthorized('Invalid or expired refresh token');
    }
  }

  async verifyGoogleToken(idToken: string) {
    if (!this.googleClientId) {
      throw new RpcException({ statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: 'Google sign-in is not configured' });
    }

    const payload = await this.googleClient
      .verifyIdToken({ idToken, audience: this.googleClientId })
      .then((ticket) => ticket.getPayload())
      .catch(() => undefined);

    if (!payload?.email || !payload.email_verified) throw unauthorized('Invalid Google token');

    return { email: payload.email, name: payload.name, avatar: payload.picture, provider: 'google' };
  }

  verify(token: string): TokenPayload {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch {
      throw unauthorized('Invalid token');
    }
  }
}

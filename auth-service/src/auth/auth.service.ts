import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    const payload = { id: user.id, email: user.email, role: user.role };

    const access_token = this.jwtService.sign(payload, { expiresIn: '12h' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '30d' });
    console.log(access_token);
    return { access_token, refresh_token, user: payload };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      return this.login(payload);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async verifyGoogleToken(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return {
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
      provider: 'google',
    };
  }

  async verify(token: string) {
    try {
      console.log(token);
      return this.jwtService.verify(token);
    } catch (err) {
      console.error('JWT Verify Error Detail:', err);
      throw new UnauthorizedException(err);
    }
  }
}

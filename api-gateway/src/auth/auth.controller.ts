import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { Public } from './public.decorator';
import { AuthGuard } from './guards/auth-guard';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  private setTokensToCookies(
    res: Response,
    tokens: { access_token: string; refresh_token: string },
  ) {
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  @Public()
  @Get()
  async health() {
    return firstValueFrom(this.authClient.send('auth.health', {}));
  }

  @Public()
  @Post('register')
  async register(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const user = await firstValueFrom(
      this.userClient.send('users.create', body),
    );
    const auth = await firstValueFrom(this.authClient.send('auth.login', user));

    this.setTokensToCookies(res, auth);

    return { success: true, userId: user.id };
  }

  @Public()
  @Post('google-callback')
  async googleCallback(
    @Body('idToken') idToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const googleProfile = await firstValueFrom(
      this.authClient.send('auth.google.verify', { idToken }),
    );

    const user = await firstValueFrom(
      this.userClient.send('users.findOrCreate', googleProfile),
    );

    const auth = await firstValueFrom(this.authClient.send('auth.login', user));

    this.setTokensToCookies(res, auth);

    return { success: true, userId: user.id };
  }

  @Public()
  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    console.log('1. Login attempt for:', body.email); // ЛОГ 1

    const user = await firstValueFrom(
      this.userClient.send('users.findByEmail', {
        email: body.email,
      }),
    ).catch((err) => {
      console.error('Error in users.validateUser:', err); // ЛОГ 2
      return null;
    });

    if (!user) {
      console.log('2. User validation failed'); // ЛОГ 3
      throw new UnauthorizedException('Invalid email or password');
    }

    console.log('3. User validated, calling auth.login'); // ЛОГ 4

    const auth = await firstValueFrom(
      this.authClient.send('auth.login', user),
    ).catch((err) => {
      console.error('Error in auth.login:', err);
      return null;
    });

    if (!auth) throw new UnauthorizedException('Auth service failed');

    this.setTokensToCookies(res, auth);
    return { success: true, user: auth.user };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const auth = await firstValueFrom(
        this.authClient.send('auth.refresh', refreshToken),
      );

      this.setTokensToCookies(res, auth);

      return { success: true };
    } catch (error) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      throw new UnauthorizedException(
        'Invalid or expired refresh token. Please login again.',
      );
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { success: true, message: 'Logged out successfully' };
  }

  @Public()
  @Post('confirm-email')
  async confirmEmail(@Body() body: any) {
    const code = await firstValueFrom(
      this.userClient.send('users.confirmEmail', body),
    );
    if (!code) throw new BadRequestException('Invalid email');
    return code;
  }

  @Public()
  @Post('verify-email')
  async verifyCode(@Body() body: any) {
    const status = await firstValueFrom(
      this.userClient.send('users.verifyCode', body),
    );
    if (!status) throw new BadRequestException('Invalid code');
    return status;
  }

  @UseGuards(AuthGuard)
  @Get('verify')
  async verifySession(@Req() req: any) {
    return req.user;
  }
}

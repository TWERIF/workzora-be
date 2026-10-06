import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { sendRpc } from '../common/rpc';
import {
  EmailDto,
  ForgotPasswordDto,
  GoogleCallbackDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto';
import { Public } from './public.decorator';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: Pick<AuthUser, 'id' | 'email' | 'role'>;
}

interface CreatedUser {
  id: string;
  email: string;
  role: string;
}

const ACCESS_TOKEN_MAX_AGE = 12 * 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const STRICT_LIMIT = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  private setTokensToCookies(res: Response, tokens: Pick<AuthTokens, 'access_token' | 'refresh_token'>) {
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('access_token', tokens.access_token, { httpOnly: true, secure, sameSite: 'lax', maxAge: ACCESS_TOKEN_MAX_AGE });
    res.cookie('refresh_token', tokens.refresh_token, { httpOnly: true, secure, sameSite: 'lax', maxAge: REFRESH_TOKEN_MAX_AGE });
  }

  private async issueTokens(res: Response, user: CreatedUser) {
    const auth = await sendRpc<AuthTokens>(this.authClient, 'auth.login', user);
    this.setTokensToCookies(res, auth);
    return auth;
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Auth service health check' })
  health() {
    return sendRpc(this.authClient, 'auth.health', {});
  }

  @Public()
  @Get('seed')
  @ApiOperation({ summary: 'Create the local admin account, only with ALLOW_SEED=true' })
  async seed() {
    if (process.env.ALLOW_SEED !== 'true') throw new NotFoundException();
    const user = await sendRpc<CreatedUser>(this.userClient, 'users.create', {
      email: 'admin@example.com',
      username: 'adminworkzora',
      password: '12345678',
      firstName: 'Workzora',
      lastName: 'Admin',
      role: 'admin',
      isActive: true,
    });
    return { success: true, userId: user.id };
  }

  @Public()
  @Throttle(STRICT_LIMIT)
  @Post('register')
  @ApiOperation({ summary: 'Sign up' })
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await sendRpc<CreatedUser>(this.userClient, 'users.register', body);
    await this.issueTokens(res, user);
    return { success: true, userId: user.id };
  }

  @Public()
  @Throttle(STRICT_LIMIT)
  @Post('google-callback')
  @ApiOperation({ summary: 'Sign in with a Google ID token' })
  async googleCallback(@Body() body: GoogleCallbackDto, @Res({ passthrough: true }) res: Response) {
    const profile = await sendRpc<Record<string, string>>(this.authClient, 'auth.google.verify', { idToken: body.idToken });
    const user = await sendRpc<CreatedUser>(this.userClient, 'users.findOrCreate', profile);
    await this.issueTokens(res, user);
    return { success: true, userId: user.id };
  }

  @Public()
  @Throttle(STRICT_LIMIT)
  @Post('login')
  @HttpCode(201)
  @ApiOperation({ summary: 'Sign in with email and password' })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await sendRpc<CreatedUser | null>(this.userClient, 'users.validateCredentials', body).catch(() => null);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const auth = await this.issueTokens(res, user);
    return { success: true, user: auth.user };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh the session cookies' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken: unknown = req.cookies?.['refresh_token'];
    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const auth = await sendRpc<AuthTokens>(this.authClient, 'auth.refresh', refreshToken);
      this.setTokensToCookies(res, auth);
      return { success: true };
    } catch {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      throw new UnauthorizedException('Invalid or expired refresh token. Please login again.');
    }
  }

  @Post('logout')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Sign out' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { success: true, message: 'Logged out successfully' };
  }

  @Public()
  @Throttle(STRICT_LIMIT)
  @Post('forgot-password')
  @ApiOperation({ summary: 'Send a password reset code' })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return sendRpc(this.userClient, 'users.requestPasswordReset', body);
  }

  @Public()
  @Throttle(STRICT_LIMIT)
  @Post('reset-password')
  @ApiOperation({ summary: 'Set a new password with the reset code' })
  resetPassword(@Body() body: ResetPasswordDto) {
    return sendRpc(this.userClient, 'users.resetPassword', body);
  }

  @Public()
  @Throttle(STRICT_LIMIT)
  @Post('confirm-email')
  @ApiOperation({ summary: 'Send an email confirmation code' })
  confirmEmail(@Body() body: EmailDto) {
    return sendRpc(this.userClient, 'users.confirmEmail', body);
  }

  @Public()
  @Throttle(STRICT_LIMIT)
  @Post('verify-email')
  @ApiOperation({ summary: 'Check the email confirmation code' })
  async verifyEmail(@Body() body: VerifyEmailDto) {
    const status = await sendRpc<{ success: boolean } | false>(this.userClient, 'users.verifyCode', body);
    return status || { success: false };
  }

  @Get('verify')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Current user' })
  verifySession(@CurrentUser() user: AuthUser) {
    return user;
  }
}

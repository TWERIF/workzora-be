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
  ResetCodeDto,
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

const SESSION_ONLY_COOKIE = 'session_only';
const TOUCH_INTERVAL = 2 * 60 * 1000;
@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly lastTouch = new Map<string, number>();

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  private setTokensToCookies(res: Response, tokens: Pick<AuthTokens, 'access_token' | 'refresh_token'>, remember = true) {
    const secure = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure, sameSite: 'lax' as const };
    res.cookie('access_token', tokens.access_token, remember ? { ...base, maxAge: ACCESS_TOKEN_MAX_AGE } : base);
    res.cookie('refresh_token', tokens.refresh_token, remember ? { ...base, maxAge: REFRESH_TOKEN_MAX_AGE } : base);
    if (remember) res.clearCookie(SESSION_ONLY_COOKIE);
    else res.cookie(SESSION_ONLY_COOKIE, '1', base);
  }

  private clearSession(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie(SESSION_ONLY_COOKIE);
  }

  private async issueTokens(res: Response, user: CreatedUser, remember = true) {
    const auth = await sendRpc<AuthTokens>(this.authClient, 'auth.login', user);
    this.setTokensToCookies(res, auth, remember);
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
    const { remember, ...credentials } = body;
    const user = await sendRpc<CreatedUser | null>(this.userClient, 'users.validateCredentials', credentials).catch(() => null);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const auth = await this.issueTokens(res, user, remember ?? true);
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
      this.setTokensToCookies(res, auth, req.cookies?.[SESSION_ONLY_COOKIE] !== '1');
      return { success: true };
    } catch {
      this.clearSession(res);
      throw new UnauthorizedException('Invalid or expired refresh token. Please login again.');
    }
  }

  @Post('logout')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Sign out' })
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearSession(res);
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
  @Post('check-reset-code')
  @HttpCode(200)
  @ApiOperation({ summary: 'Check a password reset code without using it' })
  checkResetCode(@Body() body: ResetCodeDto) {
    return sendRpc<{ valid: boolean }>(this.userClient, 'users.checkPasswordResetCode', body);
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
  confirmEmail(@Body() body: ForgotPasswordDto) {
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
    const now = Date.now();
    if ((this.lastTouch.get(user.id) ?? 0) < now - TOUCH_INTERVAL) {
      this.lastTouch.set(user.id, now);
      this.userClient.emit('users.touch', { id: user.id }).subscribe({ error: () => this.lastTouch.delete(user.id) });
    }
    return user;
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  FREELANCER = 'freelancer',
}

export interface AccountVerification {
  id: string;
  status: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  verification: AccountVerification | null;
}

export interface RequestWithUser extends Request {
  user: AuthUser;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<RequestWithUser>().user,
);

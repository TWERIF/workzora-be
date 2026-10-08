import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RequestWithUser } from '../../common/auth-user';
import { IS_PUBLIC_KEY } from '../public.decorator';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const requiredRoles = this.reflector.getAllAndOverride<string[] | undefined>('roles', targets);
    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    return !!user?.role && requiredRoles.includes(user.role);
  }
}

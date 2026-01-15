import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '../common/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );


    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // TEMP DEBUG (keep for now)
    console.log('REQUIRED ROLES:', requiredRoles);
    console.log('USER FROM JWT:', user);

    if (!user || !user.role) {
      throw new ForbiddenException('Missing user role');
    }


    const userRole = user.role.toUpperCase();

    if (!requiredRoles.includes(userRole as Role)) {
      throw new ForbiddenException('Insufficient Role');
    }

    return true;
  }
}

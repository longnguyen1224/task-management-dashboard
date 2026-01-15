import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: any) {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Allow login endpoint
    if (url === '/api/auth/login') {
      return true;
    }

    // Allow Swagger docs
    if (url.startsWith('/swagger') || url.startsWith('/api-json')) {
      return true;
    }

    // Everything else requires JWT
    return super.canActivate(context);
  }
}

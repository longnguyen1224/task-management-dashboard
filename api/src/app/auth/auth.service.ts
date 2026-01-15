import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from '../users/user.entity';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private jwtService: JwtService,
    ) {}

    async login(email: string, password: string) {
        const user = await this.userRepo.findOne({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedException('Invalid Credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organization.id,
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
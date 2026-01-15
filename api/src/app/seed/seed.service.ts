import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { Role } from '../common/roles.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepo.count();
    if (count > 0) return;

    // one organization
    const org = await this.orgRepo.save(
      this.orgRepo.create({ name: 'Main Org' }),
    );

    const passwordHash = await bcrypt.hash('password123', 10);

    const owner = this.userRepo.create({
      email: 'owner@test.com',
      passwordHash,
      role: Role.OWNER,
      organization: org,
    });

    const admin = this.userRepo.create({
      email: 'admin@test.com',
      passwordHash,
      role: Role.ADMIN,
      organization: org,
    });

    const viewer = this.userRepo.create({
      email: 'viewer@test.com',
      passwordHash,
      role: Role.VIEWER,
      organization: org,
    });

    await this.userRepo.save([owner, admin, viewer]);

    console.log('Seed data created');
    console.log('ORG ID:', org.id);
  
  }
}

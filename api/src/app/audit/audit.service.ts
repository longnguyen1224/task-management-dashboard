import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(data: {
    userId: string;
    role: string;
    organizationId: string;
    action: string;
    resource: string;
    resourceId: string;
  }) {
    const log = this.auditRepo.create({
      userId: data.userId,
      role: data.role,
      organizationId: data.organizationId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
    });

    await this.auditRepo.save(log);
  }

  async findAll() {
    return this.auditRepo.find({
      order: { createdAt: 'DESC' },
    });
  }
}

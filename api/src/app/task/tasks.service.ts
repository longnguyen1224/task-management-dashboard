import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Role } from '../common/roles.enum';
import { Organization } from '../organizations/organization.entity';
import { getAccessibleOrgIds } from '../organizations/org-scope.util';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,

    private readonly auditService: AuditService,
  ) {}

 // GET /tasks
  async findAll(user: any, query: any) {
    if (!user || !user.organizationId) {
      throw new ForbiddenException('Invalid user context');
    }

    const orgIds = await getAccessibleOrgIds(
      user.organizationId,
      this.orgRepo,
    );

    if (!orgIds || orgIds.length === 0) {
      return [];
    }

    return this.taskRepo.find({
      where: {
        organizationId: In(orgIds),
      },
      order: {
        status: 'ASC',
        order: 'ASC',
        createdAt: 'DESC',
      } as const,
    });
  }


 
  // POST /tasks
  
  async create(dto: CreateTaskDto, user: any) {
    if (![Role.OWNER, Role.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      organizationId: user.organizationId,
      createdById: user.sub,
    });

    const saved = await this.taskRepo.save(task);

    //await this.auditService.log({
      //userId: user.sub,
      //role: user.role,
      //organizationId: user.organizationId,
      //action: 'CREATE',
      //resource: 'task',
      //resourceId: saved.id,
    //});

    return saved;
  }

 
  // PUT /tasks/:id
 
  async update(id: string, dto: UpdateTaskDto, user: any) {
    const task = await this.taskRepo.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const orgIds = await getAccessibleOrgIds(
      user.organizationId,
      this.orgRepo,
    );

    if (!orgIds.includes(task.organizationId)) {
      throw new ForbiddenException('Cross-org access denied');
    }

    if (![Role.OWNER, Role.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    Object.assign(task, dto);
    const updated = await this.taskRepo.save(task);

    await this.auditService.log({
      userId: user.sub,
      role: user.role,
      organizationId: user.organizationId,
      action: 'UPDATE',
      resource: 'task',
      resourceId: task.id,
    });

    return updated;
  }

  
  // DELETE /tasks/:id
 
  async remove(id: string, user: any) {
    const task = await this.taskRepo.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const orgIds = await getAccessibleOrgIds(
      user.organizationId,
      this.orgRepo,
    );

    if (!orgIds.includes(task.organizationId)) {
      throw new ForbiddenException('Cross-org access denied');
    }

    if (![Role.OWNER, Role.ADMIN].includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    //  SAVE ID BEFORE DELETE
    const taskId = task.id;

    await this.taskRepo.remove(task);

    // SAFE audit logging
    await this.auditService.log({
      userId: user.sub,
      role: user.role,
      organizationId: user.organizationId,
      action: 'DELETE',
      resource: 'task',
      resourceId: taskId,
    });

    return { success: true };
  }
}

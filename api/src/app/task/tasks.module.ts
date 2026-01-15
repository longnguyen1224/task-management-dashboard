import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Organization } from '../organizations/organization.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Organization]),
    AuditModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}

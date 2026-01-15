import { Controller, Get, Post, Put, Delete, Body, Req, Param, } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/roles.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Query } from '@nestjs/common';
@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  // GET /tasks
  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.VIEWER)
  findAll(@Req() req: any, @Query() query: any) {
    return this.tasksService.findAll(req.user, query);
  }

  // POST /tasks
  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(dto, req.user);
  }

  // PUT /tasks/:id
  @Put(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.update(id, dto, req.user);
  }

  // DELETE /tasks/:id
  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.remove(id, req.user);
  }
}

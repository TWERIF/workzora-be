import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { Id } from '../categories/dto';
import type { AwaitingPaymentDto, CreateProjectDto, MyProjectsDto, UpdateProjectDto } from './dto';
import { ProjectsService } from './projects.service';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @MessagePattern('projects.findOneProject')
  findOne(@Payload() data: Id) {
    return this.projectsService.findOne(data.id);
  }

  @MessagePattern('projects.count')
  async count() {
    return this.projectsService.count();
  }

  @MessagePattern('projects.findManyByIds')
  findManyByIds(@Payload() data: { ids: string[] }) {
    return this.projectsService.findManyByIds(data.ids);
  }

  @MessagePattern('projects.update')
  update(@Payload() data: UpdateProjectDto) {
    console.log("Controller: ", data);
    return this.projectsService.update(data);
  }

  @MessagePattern('projects.create')
  create(@Payload() data: CreateProjectDto) {
    return this.projectsService.create(data);
  }

  @MessagePattern('projects.delete')
  delete(@Payload() data: Id) {
    return this.projectsService.delete(data);
  }

  @MessagePattern('projects.getTopProjects')
  getTopProjects() {
    try {
      return this.projectsService.getTopProjects();
    } catch (e) {
      return { error: 'DB_ERROR' };
    }
  }
  @MessagePattern('projects.findMyProjects')
  findMyProjects(@Payload() data: MyProjectsDto) {
    try {
      return this.projectsService.findMyProjects(data);
    } catch (e) {
      return { error: 'DB_ERROR' };
    }
  }
  @MessagePattern('projects.findProjects')
  async getProjects(
    @Payload() data: { id: string; role: string; page: number; limit: number },
  ) {
    try {
      return await this.projectsService.getProjects(data);
    } catch (e) {
      return { error: 'DB_ERROR' };
    }
  }

  @MessagePattern('projects.toAwaitingPayment')
  toAwaitingPayment(@Payload() data: AwaitingPaymentDto) {
    return this.projectsService.toAwaitingPayment(data);
  }

  @MessagePattern('projects.toInProgress')
  toInProgress(@Payload() data: Id) {
    return this.projectsService.toInProgress(data);
  }
  @MessagePattern('projects.toInCompleted')
  toInCompleted(@Payload() data: Id) {
    return this.projectsService.toInCompleted(data);
  }
  @MessagePattern('projects.toClosed')
  toClosed(@Payload() data: Id) {
    return this.projectsService.toClosed(data);
  }
}

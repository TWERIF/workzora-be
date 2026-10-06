import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AwaitingPaymentDto,
  CompleteProjectDto,
  CreateProjectDto,
  FindProjectsDto,
  IdDto,
  IdsDto,
  MyProjectsDto,
  StatsRangeDto,
  UpdateProjectDto,
  UserIdDto,
} from './dto';
import { ProjectsService } from './projects.service';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern('projects.findOneProject')
  findOne(@Payload() data: IdDto) {
    return this.projectsService.findOne(data.id);
  }

  @MessagePattern('stats.projects')
  stats(@Payload() range: StatsRangeDto) {
    return this.projectsService.stats(range);
  }

  @MessagePattern('projects.activeDeals')
  activeDeals(@Payload() data: UserIdDto) {
    return this.projectsService.countActiveDeals(data);
  }

  @MessagePattern('projects.count')
  count() {
    return this.projectsService.count();
  }

  @MessagePattern('projects.findManyByIds')
  findManyByIds(@Payload() data: IdsDto) {
    return this.projectsService.findManyByIds(data.ids);
  }

  @MessagePattern('projects.update')
  update(@Payload() data: UpdateProjectDto) {
    return this.projectsService.update(data);
  }

  @MessagePattern('projects.create')
  create(@Payload() data: CreateProjectDto) {
    return this.projectsService.create(data);
  }

  @MessagePattern('projects.delete')
  delete(@Payload() data: IdDto) {
    return this.projectsService.delete(data);
  }

  @MessagePattern('projects.getTopProjects')
  getTopProjects() {
    return this.projectsService.getTopProjects();
  }

  @MessagePattern('projects.findMyProjects')
  findMyProjects(@Payload() data: MyProjectsDto) {
    return this.projectsService.findMyProjects(data);
  }

  @MessagePattern('projects.findProjects')
  getProjects(@Payload() data: FindProjectsDto) {
    return this.projectsService.getProjects(data);
  }

  @MessagePattern('projects.toAwaitingPayment')
  toAwaitingPayment(@Payload() data: AwaitingPaymentDto) {
    return this.projectsService.toAwaitingPayment(data);
  }

  @MessagePattern('projects.toInProgress')
  toInProgress(@Payload() data: IdDto) {
    return this.projectsService.toInProgress(data);
  }

  @MessagePattern('projects.toInCompleted')
  toInCompleted(@Payload() data: CompleteProjectDto) {
    return this.projectsService.toInCompleted(data);
  }

  @MessagePattern('projects.lastByClients')
  lastByClients(@Payload() data: IdsDto) {
    return this.projectsService.findLastByClients(data.ids);
  }

  @MessagePattern('projects.toClosed')
  toClosed(@Payload() data: IdDto) {
    return this.projectsService.toClosed(data);
  }
}

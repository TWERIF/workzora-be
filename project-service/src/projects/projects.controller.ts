import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern('projects.findOneProject')
  findOne(@Payload() data: { id: string }) {
    return this.projectsService.findOne(data.id);
  }

  @MessagePattern('projects.getTopProjects')
  getTopProjects() {
    try {
      return this.projectsService.getTopProjects();
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
}

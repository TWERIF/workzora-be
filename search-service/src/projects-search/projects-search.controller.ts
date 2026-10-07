import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { IndexIdDto, IndexProjectDto, SearchTermDto } from '../common/index-dto';
import { SearchProject } from './entities/project.entity';
import { SearchService } from './projects-search.service';

@Controller()
export class ProjectsSearchController {
    constructor(
        private readonly searchService: SearchService,
    ) { }

    @MessagePattern('projects.search')
    async handleSearchProjects(
        @Payload() data: SearchTermDto,
    ): Promise<SearchProject[]> {
        return await this.searchService.search(data.searchTerm);
    }

    @EventPattern('project.created')
    async handleProjectCreated(@Payload() data: IndexProjectDto) {
        await this.searchService.indexProject(data);
    }

    @EventPattern('project.updated')
    async handleProjectUpdated(@Payload() data: IndexProjectDto) {
        await this.searchService.updateIndexedProject(data);
    }

    @EventPattern('project.deleted')
    async handleProjectDeleted(@Payload() data: IndexIdDto) {
        await this.searchService.removeIndexedProject(data.id);
    }
}
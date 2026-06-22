import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { SearchProject } from './entities/project.entity';
import { SearchService } from './projects-search.service';

@Controller()
export class ProjectsSearchController {
    constructor(
        private readonly searchService: SearchService,
    ) { }

    @MessagePattern('projects.search')
    async handleSearchProjects(
        @Payload() data: { searchTerm: string },
        @Ctx() context: RmqContext,
    ): Promise<SearchProject[]> {
        return await this.searchService.search(data.searchTerm);
    }

    @EventPattern('project.created')
    async handleProjectCreated(@Payload() data: any) {
        await this.searchService.indexProject(data);
    }

    @EventPattern('project.updated')
    async handleProjectUpdated(@Payload() data: any) {
        await this.searchService.updateIndexedProject(data);
    }

    @EventPattern('project.deleted')
    async handleProjectDeleted(@Payload() data: { id: string }) {
        await this.searchService.removeIndexedProject(data.id);
    }
}
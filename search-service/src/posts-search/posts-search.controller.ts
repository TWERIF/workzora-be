import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { SearchPost } from './entities/post.entity';
import { PostsSearchService } from './posts-search.service';


@Controller()
export class PostsSearchController {
    constructor(
        private readonly searchService: PostsSearchService,
    ) { }

    @MessagePattern('posts.search')
    async handleSearchProjects(
        @Payload() data: { searchTerm: string },
        @Ctx() context: RmqContext,
    ): Promise<SearchPost[]> {
        return await this.searchService.search(data.searchTerm);
    }

    @EventPattern('post.created')
    async handleProjectCreated(@Payload() data: any) {
        await this.searchService.indexProject(data);
    }

    @EventPattern('post.updated')
    async handleProjectUpdated(@Payload() data: any) {
        await this.searchService.updateIndexedProject(data);
    }

    @EventPattern('post.deleted')
    async handleProjectDeleted(@Payload() data: { id: string }) {
        await this.searchService.removeIndexedProject(data.id);
    }
}
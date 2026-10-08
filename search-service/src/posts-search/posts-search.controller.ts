import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { IndexIdDto, IndexPostDto, SearchTermDto } from '../common/index-dto';
import { SearchPost } from './entities/post.entity';
import { PostsSearchService } from './posts-search.service';

@Controller()
export class PostsSearchController {
    constructor(
        private readonly searchService: PostsSearchService,
    ) { }

    @MessagePattern('posts.search')
    async handleSearchProjects(
        @Payload() data: SearchTermDto,
    ): Promise<SearchPost[]> {
        return await this.searchService.search(data.searchTerm);
    }

    @EventPattern('post.created')
    async handleProjectCreated(@Payload() data: IndexPostDto) {
        await this.searchService.indexProject(data);
    }

    @EventPattern('post.updated')
    async handleProjectUpdated(@Payload() data: IndexPostDto) {
        await this.searchService.updateIndexedProject(data);
    }

    @EventPattern('post.deleted')
    async handleProjectDeleted(@Payload() data: IndexIdDto) {
        await this.searchService.removeIndexedProject(data.id);
    }
}
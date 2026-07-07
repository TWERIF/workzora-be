import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { SearchPost } from './entities/post.entity';

@Injectable()
export class PostsSearchService {
    constructor(
        @InjectRepository(SearchPost)
        private readonly searchRepository: Repository<SearchPost>,

        @Inject('POSTS_SERVICE_CLIENT') private readonly postsClient: ClientProxy
    ) { }

    async indexProject(projectData: any) {
        const searchRecord = this.searchRepository.create({
            id: projectData.id,
            title: projectData.title,
            teaser: projectData.description,
            tag: projectData.tag
        });
        await this.searchRepository.save(searchRecord);
    }

    async updateIndexedProject(projectData: any) {
        await this.searchRepository.update(projectData.id, {
            title: projectData.title,
            teaser: projectData.description,
            tag: projectData.tag
        });
    }

    async removeIndexedProject(id: string) {
        await this.searchRepository.delete(id);
    }

    async search(query: string) {
        const searchResults = await this.searchRepository
            .createQueryBuilder('post')
            .where('post.search_vector @@ plainto_tsquery(:query)', { query })
            .getMany();

        const ids = searchResults.map(p => p.id);

        if (ids.length === 0) return [];

        const fullProjects = await firstValueFrom(
            this.postsClient.send('posts.findManyByIds', { ids })
        );

        return fullProjects;
    }
}
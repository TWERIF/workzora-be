import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { IndexProjectDto } from '../common/index-dto';
import { SearchProject } from './entities/project.entity';

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(SearchProject)
        private readonly searchRepository: Repository<SearchProject>,

        @Inject('PROJECTS_SERVICE_CLIENT') private readonly projectsClient: ClientProxy
    ) { }

    async indexProject(projectData: IndexProjectDto) {
        const searchRecord = this.searchRepository.create({
            id: projectData.id,
            title: projectData.title,
            description: projectData.description,
        });
        await this.searchRepository.save(searchRecord);
    }

    async updateIndexedProject(projectData: IndexProjectDto) {
        await this.searchRepository.update(projectData.id, {
            title: projectData.title,
            description: projectData.description,
        });
    }

    async removeIndexedProject(id: string) {
        await this.searchRepository.delete(id);
    }

    async search(query: string) {
        const searchResults = await this.searchRepository
            .createQueryBuilder('project')
            .where('project.search_vector @@ plainto_tsquery(:query)', { query })
            .getMany();

        const ids = searchResults.map(p => p.id);

        if (ids.length === 0) return [];

        const fullProjects = await firstValueFrom(
            this.projectsClient.send('projects.findManyByIds', { ids })
        );

        return fullProjects;
    }
}
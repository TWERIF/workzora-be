import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getProjects({
    id,
    role,
    page = 1,
    limit = 10,
  }: {
    id: string;
    role: string;
    page: number;
    limit: number;
  }) {
    const skip = (page - 1) * limit;
    let whereCondition = {};

    if (role === 'client') {
      whereCondition = { clientId: id };
    } else if (role === 'freelancer') {
      whereCondition = { freelancerId: id };
    } else {
      return { data: [], total: 0 };
    }

    const [projects, total] = await this.projectRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async findOne(id: string) {
    return await this.projectRepository.findOne({ where: { id: id } });
  }

  async getTopProjects() {
    return await this.projectRepository.find({
      order: { views: 'DESC' },
      take: 6,
    });
  }
}

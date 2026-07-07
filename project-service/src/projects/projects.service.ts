import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ClientProxy } from '@nestjs/microservices';
import { Id } from '../categories/dto';
import { Category } from '../categories/entities/category.entity';
import { ChatService } from '../chat/chat.service';
import { AwaitingPaymentDto, CreateProjectDto, MyProjectsDto, UpdateProjectDto } from './dto';
import { Project, ProjectStatus } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @Inject('RABBIT_MQ_CLIENT')
    private readonly rabbitClient: ClientProxy,

    private readonly chatService: ChatService
  ) { }
  async count() {
    try {
      return this.projectRepository.count();
    } catch (error) {
      throw error;
    }
  }
  async create(dto: CreateProjectDto) {
    const categories = await this.categoryRepository.findBy({
      id: In(dto.categories),
    });

    const project = this.projectRepository.create({
      title: dto.title,
      description: dto.description,
      categories,
      clientId: dto.clientId,
      price: dto.price,
    });

    await this.projectRepository.save(project);

    this.rabbitClient.emit('project.created', project);

    return project;
  }
  async update(dto: UpdateProjectDto) {
    const project = await this.projectRepository.findOne({
      where: { id: dto.id },
      relations: {
        categories: true,
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (dto.title !== undefined) {
      project.title = dto.title;
    }

    if (dto.description !== undefined) {
      project.description = dto.description;
    }

    if (dto.categories !== undefined) {
      const categories = await this.categoryRepository.findBy({
        id: In(dto.categories),
      });

      if (categories.length !== dto.categories.length) {
        throw new BadRequestException('One or more categories not found');
      }

      project.categories = categories;
    }

    if (dto.price !== undefined) {
      project.price = dto.price;
    }

    if (dto.clientId !== undefined) {
      project.clientId = dto.clientId;
    }
    if (dto.status) {
      project.status = dto.status;
    }
    if (dto.freelancerId) {
      project.freelancerId = dto.freelancerId;
    }

    await this.projectRepository.save(project);

    this.rabbitClient.emit('project.updated', project);

    return project;
  }

  async toAwaitingPayment(data: AwaitingPaymentDto) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: data.id },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      project.freelancerId = data.freelancerId;
      project.status = ProjectStatus.AWAITING_PAYMENT;

      await this.projectRepository.save(project);

      const chat = await this.chatService.findOrCreateChat(data.id);

      const systemMessageContent = 'Вітаємо! Виконавець був обраний. Проект перейшов у статус очікування оплати. Будь ласка, зарезервуйте кошти для початку роботи.';
      await this.chatService.sendSystemMessage(chat.id, project.id, systemMessageContent);

    } catch (error) {
      throw error;
    }
  }

  async delete({ id }: Id) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectRepository.remove(project);

    this.rabbitClient.emit('project.deleted', { id });

    return {
      success: true,
      id,
    };
  }
  async findManyByIds(ids: string[]) {
    return await this.projectRepository.find({
      where: { id: In(ids) },
      relations: { categories: true },
    });
  }
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
      relations: {
        categories: true,
      },
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
    return await this.projectRepository.findOne({
      where: { id },
      relations: {
        categories: true,
      },
    });
  }

  async getTopProjects() {
    return await this.projectRepository.find({
      order: { views: 'DESC' },
      relations: {
        categories: true,
      },
      take: 6,
    });
  }

  async findMyProjects(data: MyProjectsDto) {
    const { status, userId, page = 1, limit = 10 } = data;
    const skip = (page - 1) * limit;

    const [items, total] = await this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect('project.categories', 'category')
      .where(
        "(project.clientId = :userId OR project.freelancerId = :userId)",
        { userId }
      )
      .andWhere("project.status = :status", { status: status as ProjectStatus })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

  }
}
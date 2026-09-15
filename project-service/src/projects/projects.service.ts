import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Id } from '../categories/dto';
import { Category } from '../categories/entities/category.entity';
import { ChatService } from '../chat/chat.service';
import { AwaitingPaymentDto, CreateProjectDto, FindProjectsDto, MyProjectsDto, UpdateProjectDto } from './dto';
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

    @Inject('BIDS_SERVICE')
    private readonly bidsClient: ClientProxy,

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
      tags: dto.tags ?? [],
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

    if (dto.tags !== undefined) {
      project.tags = dto.tags;
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

      const wonBid = await firstValueFrom(
        this.bidsClient.send("bids.getWonBid", { id: project.id, freelancerId: data.freelancerId })
      )

      if (!wonBid) {
        throw new RpcException('Won bid not found for this project/freelancer');
      }

      project.time = wonBid.time;
      project.freelancerId = data.freelancerId;
      project.status = ProjectStatus.AWAITING_PAYMENT;

      const saved = await this.projectRepository.save(project);

      const chat = await this.chatService.findOrCreateChat(data.id);

      const systemMessageContent = 'Вітаємо! Виконавець був обраний. Проект перейшов у статус очікування оплати. Будь ласка, зарезервуйте кошти для початку роботи.';
      await this.chatService.sendSystemMessage(chat.id, project.id, systemMessageContent);

      return saved;
    } catch (error) {
      throw error;
    }
  }

  async toInProgress(data: Id) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: data.id },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      project.status = ProjectStatus.IN_PROGRESS;

      await this.projectRepository.save(project);

      const chat = await this.chatService.findOrCreateChat(data.id);

      const systemMessageContent = 'Кошти зарезервовано, проект переведено до статусу виконання!';
      await this.chatService.sendSystemMessage(chat.id, project.id, systemMessageContent);

    } catch (error) {
      throw error;
    }
  }

  async toInCompleted(data: Id) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: data.id },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      project.status = ProjectStatus.COMPLETED;

      await this.projectRepository.save(project);

      const chat = await this.chatService.findOrCreateChat(data.id);

      const systemMessageContent = 'Проект виконано, тепер можете обмінятися відгуками. Виконавець, очікуйте на оплату протягом 24 годин';
      await this.chatService.sendSystemMessage(chat.id, project.id, systemMessageContent);

    } catch (error) {
      throw error;
    }
  }

  async toClosed(data: Id) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: data.id },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      project.status = ProjectStatus.CLOSED;

      await this.projectRepository.save(project);

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

  private async attachProposalsCounts<T extends { id: string }>(
    projects: T[],
  ): Promise<(T & { proposalsCount: number })[]> {
    if (!projects.length) return [];

    const countsMap = await firstValueFrom(
      this.bidsClient.send('bids.countByProjects', {
        ids: projects.map((p) => p.id),
      }),
    );

    return projects.map((p) => ({
      ...p,
      proposalsCount: countsMap[p.id] ?? 0,
    }));
  }

  async getProjects({
    search,
    categories,
    tags,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
  }: FindProjectsDto) {
    const skip = (page - 1) * limit;
    console.log(`query started`);

    const qb = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.categories', 'category')
      // .where('project.status = :status', { status: ProjectStatus.OPEN }); 

    if (search) {
      qb.andWhere(
        '(project.title ILIKE :search OR project.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categories?.length) {
      qb.andWhere('category.id IN (:...categories)', { categories });
    }

    if (tags?.length) {
      qb.andWhere('project.tags && :tags', { tags });
    }

    if (minPrice !== undefined) {
      qb.andWhere('project.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('project.price <= :maxPrice', { maxPrice });
    }

    qb.orderBy('project.createdAt', 'DESC').skip(skip).take(limit);

    const [projects, total] = await qb.getManyAndCount();
    const data = await this.attachProposalsCounts(projects);

    console.log(`data: ${data}`)

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: { categories: true },
    });
    if (!project) return project;

    const proposalsCount = await firstValueFrom(
      this.bidsClient.send('bids.countByProject', { id }),
    );

    return { ...project, proposalsCount };
  }

  async getTopProjects() {
    const projects = await this.projectRepository.find({
      order: { views: 'DESC' },
      relations: { categories: true },
      take: 6,
    });

    return this.attachProposalsCounts(projects);
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
import { Notifier } from '../common/notifier';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Category } from '../categories/entities/category.entity';
import { ChatService } from '../chat/chat.service';
import { AdminProjectsDto, ClientProjectsDto, AwaitingPaymentDto, CompleteProjectDto, CreateProjectDto, FindProjectsDto, IdDto, MyProjectsDto, UpdateProjectDto } from './dto';
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

    @Inject('ESCROW_SERVICE')
    private readonly escrowClient: ClientProxy,

    private readonly chatService: ChatService,

    private readonly notifier: Notifier,
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
      throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Project not found' });
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
        throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'One or more categories not found' });
      }

      project.categories = categories;
    }

    if (dto.price !== undefined) {
      project.price = dto.price;
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
        throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Project not found' });
      }
      if (project.clientId !== data.clientId) {
        throw new RpcException({ statusCode: HttpStatus.FORBIDDEN, message: 'Only the project owner can choose a freelancer' });
      }
      if (project.status !== ProjectStatus.OPEN) {
        throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'A freelancer has already been chosen for this project' });
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

      this.notifier.notify({
        userId: data.freelancerId,
        type: 'projects',
        key: 'freelancerSelected',
        params: { project: project.title },
        link: `/chats/${project.id}`,
      });

      return saved;
    } catch (error) {
      throw error;
    }
  }

  async toInProgress(data: IdDto) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: data.id },
      });

      if (!project) {
        throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Project not found' });
      }

      project.status = ProjectStatus.IN_PROGRESS;

      await this.projectRepository.save(project);

      const chat = await this.chatService.findOrCreateChat(data.id);

      const systemMessageContent = 'Кошти зарезервовано, проект переведено до статусу виконання!';
      await this.chatService.sendSystemMessage(chat.id, project.id, systemMessageContent);

      if (project.freelancerId) {
        this.notifier.notify({
          userId: project.freelancerId,
          type: 'payments',
          key: 'fundsReserved',
          params: { project: project.title },
          link: `/chats/${project.id}`,
        });
      }

    } catch (error) {
      throw error;
    }
  }

  async toInCompleted(data: CompleteProjectDto) {
    const project = await this.projectRepository.findOne({
      where: { id: data.id },
    });

    if (!project) {
      throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Project not found' });
    }
    if (project.clientId !== data.clientId) {
      throw new RpcException({ statusCode: HttpStatus.FORBIDDEN, message: 'Only the project owner can complete it' });
    }
    if (project.status !== ProjectStatus.IN_PROGRESS) {
      throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'Only a project in progress can be completed' });
    }

    await firstValueFrom(
      this.escrowClient.send('invoices.release', { projectId: project.id, clientId: data.clientId }),
    ).catch((error) => {
      throw new RpcException(error);
    });

    project.status = ProjectStatus.COMPLETED;
    const saved = await this.projectRepository.save(project);

    const chat = await this.chatService.findOrCreateChat(data.id);

    const systemMessageContent = 'Проект виконано, кошти зараховано на баланс виконавця. Тепер можете обмінятися відгуками.';
    await this.chatService.sendSystemMessage(chat.id, project.id, systemMessageContent);

    for (const userId of [project.clientId, project.freelancerId]) {
      if (!userId) continue;
      this.notifier.notify({
        userId,
        type: 'projects',
        key: 'projectCompleted',
        params: { project: project.title },
        link: `/review/${project.id}`,
      });
    }

    return saved;
  }

  async toClosed(data: IdDto) {
    const project = await this.projectRepository.findOne({ where: { id: data.id } });
    if (!project) throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Project not found' });
    if (project.status === ProjectStatus.IN_PROGRESS) {
      throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'A paid project in progress cannot be closed' });
    }

    project.status = ProjectStatus.CLOSED;
    await this.projectRepository.save(project);
    return { success: true };
  }


  async delete({ id }: IdDto) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Project not found' });
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

  getProjects(dto: FindProjectsDto) {
    return this.listProjects(dto, [ProjectStatus.OPEN]);
  }

  adminList({ status, ...dto }: AdminProjectsDto) {
    return this.listProjects(dto, status ? [status] : undefined);
  }

  private async listProjects(
    { search, categories, tags, minPrice, maxPrice, page = 1, limit = 10 }: FindProjectsDto,
    statuses?: ProjectStatus[],
  ) {
    const qb = this.projectRepository.createQueryBuilder('project').leftJoinAndSelect('project.categories', 'category');

    if (statuses?.length) qb.andWhere('project.status IN (:...statuses)', { statuses });
    if (search) {
      qb.andWhere('(project.title ILIKE :search OR project.description ILIKE :search)', { search: `%${search}%` });
    }
    if (categories?.length) qb.andWhere('category.id IN (:...categories)', { categories });
    if (tags?.length) qb.andWhere('project.tags && :tags', { tags });
    if (minPrice !== undefined) qb.andWhere('project.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined) qb.andWhere('project.price <= :maxPrice', { maxPrice });

    qb.orderBy('project.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [projects, total] = await qb.getManyAndCount();
    const data = await this.attachProposalsCounts(projects);
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

  async findLastByClients(ids: string[]) {
    if (!ids?.length) return {};

    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .distinctOn(['project.clientId'])
      .where('project.clientId IN (:...ids)', { ids })
      .orderBy('project.clientId')
      .addOrderBy('project.createdAt', 'DESC')
      .getMany();

    const withCounts = await this.attachProposalsCounts(projects);
    return Object.fromEntries(withCounts.map((p) => [p.clientId, p]));
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

  async stats({ from, to }: { from: string; to: string }) {
    const byDay: { day: string; count: string }[] = await this.projectRepository.query(
      `SELECT to_char(("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Kyiv')::date, 'YYYY-MM-DD') AS day, count(*) AS count
       FROM project.projects
       WHERE ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Kyiv')::date BETWEEN $1 AND $2
       GROUP BY 1 ORDER BY 1`,
      [from, to],
    );
    const byStatus: { status: string; count: string }[] = await this.projectRepository.query(
      `SELECT status, count(*) AS count FROM project.projects GROUP BY status`,
    );

    return {
      total: byStatus.reduce((sum, r) => sum + Number(r.count), 0),
      byStatus: Object.fromEntries(byStatus.map((r) => [r.status, Number(r.count)])),
      byDay: byDay.map((r) => ({ day: r.day, count: Number(r.count) })),
    };
  }

  async userStats({ userId }: { userId: string }) {
    const count = (where: Partial<Record<'clientId' | 'freelancerId', string>> & { status?: ProjectStatus }) =>
      this.projectRepository.count({ where });
    const [completedAsFreelancer, takenAsFreelancer, posted, completedAsClient] = await Promise.all([
      count({ freelancerId: userId, status: ProjectStatus.COMPLETED }),
      this.projectRepository.count({
        where: [
          { freelancerId: userId, status: ProjectStatus.IN_PROGRESS },
          { freelancerId: userId, status: ProjectStatus.COMPLETED },
        ],
      }),
      count({ clientId: userId }),
      count({ clientId: userId, status: ProjectStatus.COMPLETED }),
    ]);
    return { completedAsFreelancer, takenAsFreelancer, posted, completedAsClient };
  }

  async byClient({ clientId, status, page, limit }: ClientProjectsDto) {
    const statuses =
      status === 'completed'
        ? [ProjectStatus.COMPLETED]
        : [ProjectStatus.OPEN, ProjectStatus.AWAITING_PAYMENT, ProjectStatus.IN_PROGRESS];
    const [items, total] = await this.projectRepository.findAndCount({
      where: { clientId, status: In(statuses) },
      relations: { categories: true },
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: items.map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        price: Number(project.price),
        tags: project.tags,
        views: project.views,
        status: project.status,
        createdAt: project.createdAt,
        categories: project.categories.map((category) => ({ id: category.id, title: category.title })),
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async sharedProject({ userId, otherId }: { userId: string; otherId: string }) {
    const project = await this.projectRepository.findOne({
      where: [
        { clientId: userId, freelancerId: otherId },
        { clientId: otherId, freelancerId: userId },
      ],
      order: { updatedAt: 'DESC' },
      select: { id: true, status: true },
    });
    return { projectId: project?.id ?? null };
  }

  async countActiveDeals({ userId }: { userId: string }) {
    const asClient = await this.projectRepository.count({
      where: [
        { clientId: userId, status: ProjectStatus.AWAITING_PAYMENT },
        { clientId: userId, status: ProjectStatus.IN_PROGRESS },
      ],
    });
    const asFreelancer = await this.projectRepository.count({
      where: [
        { freelancerId: userId, status: ProjectStatus.AWAITING_PAYMENT },
        { freelancerId: userId, status: ProjectStatus.IN_PROGRESS },
      ],
    });
    return { asClient, asFreelancer, total: asClient + asFreelancer };
  }
}

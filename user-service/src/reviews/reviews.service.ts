import { Notifier } from '../common/notifier';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { REVIEW_CRITERIA, Review } from './entities/review.entity';

export const MAX_REVIEW_LENGTH = 1000;

export interface CreateReviewPayload {
  projectId: string;
  projectTitle: string;
  authorId: string;
  authorRole: string;
  targetId: string;
  quality: number;
  professionalism: number;
  communication: number;
  price: number;
  deadlines: number;
  text: string;
  privateFeedback?: string;
}

const rpcError = (statusCode: HttpStatus, message: string) => new RpcException({ statusCode, message });

@Injectable()
export class ReviewsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly notifier: Notifier,
  ) { }

  async create(data: CreateReviewPayload) {
    for (const key of REVIEW_CRITERIA) {
      const value = Number(data[key]);
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        throw rpcError(HttpStatus.BAD_REQUEST, `"${key}" must be an integer from 1 to 5`);
      }
    }

    const text = (data.text ?? '').trim();
    const privateFeedback = (data.privateFeedback ?? '').trim();
    if (!text) throw rpcError(HttpStatus.BAD_REQUEST, 'Review text is required');
    if (text.length > MAX_REVIEW_LENGTH || privateFeedback.length > MAX_REVIEW_LENGTH) {
      throw rpcError(HttpStatus.BAD_REQUEST, `Review text must be at most ${MAX_REVIEW_LENGTH} characters`);
    }

    const existing = await this.reviewRepository.findOne({
      where: { projectId: data.projectId, authorId: data.authorId },
    });
    if (existing) throw rpcError(HttpStatus.CONFLICT, 'You have already reviewed this project');

    const rating = REVIEW_CRITERIA.reduce((sum, key) => sum + Number(data[key]), 0) / REVIEW_CRITERIA.length;

    const saved = await this.dataSource.transaction(async (manager) => {
      const review = await manager.getRepository(Review).save(
        manager.getRepository(Review).create({
          projectId: data.projectId,
          projectTitle: data.projectTitle ?? '',
          authorId: data.authorId,
          authorRole: data.authorRole,
          targetId: data.targetId,
          quality: Number(data.quality),
          professionalism: Number(data.professionalism),
          communication: Number(data.communication),
          price: Number(data.price),
          deadlines: Number(data.deadlines),
          rating,
          text,
          privateFeedback: privateFeedback || null,
        }),
      );

      const stats = await manager
        .getRepository(Review)
        .createQueryBuilder('r')
        .select('AVG(r.rating)', 'avg')
        .addSelect('COUNT(*)', 'count')
        .where('r.targetId = :targetId', { targetId: data.targetId })
        .getRawOne<{ avg: string; count: string }>();

      await manager.getRepository(User).update(data.targetId, {
        ratings: Math.round(Number(stats?.avg ?? 0) * 10) / 10,
        rates: Number(stats?.count ?? 0),
      });

      return review;
    });

    const author = await this.userRepository.findOne({ where: { id: data.authorId }, select: { id: true, firstName: true, lastName: true } });
    this.notifier.notify({
      userId: data.targetId,
      type: 'projects',
      key: 'reviewReceived',
      params: {
        name: [author?.firstName, author?.lastName].filter(Boolean).join(' '),
        rating: Math.round(rating * 10) / 10,
        project: saved.projectTitle,
      },
      link: `/public-profile/${data.targetId}`,
    });

    const { privateFeedback: _hidden, ...publicReview } = saved;
    return publicReview;
  }

  async findByTarget(targetId: string, page = 1, limit = 5) {
    page = Number(page) || 1;
    limit = Number(limit) || 5;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { targetId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: await this.attachAuthors(reviews),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findMine(projectId: string, authorId: string) {
    return this.reviewRepository.findOne({ where: { projectId, authorId } });
  }

  async findLastByTargets(ids: string[]): Promise<Record<string, Review>> {
    if (!ids.length) return {};

    const reviews = await this.reviewRepository
      .createQueryBuilder('r')
      .distinctOn(['r.targetId'])
      .where('r.targetId IN (:...ids)', { ids })
      .orderBy('r.targetId')
      .addOrderBy('r.createdAt', 'DESC')
      .getMany();

    return Object.fromEntries(reviews.map((r) => [r.targetId, r]));
  }

  private async attachAuthors(reviews: Review[]) {
    const authorIds = [...new Set(reviews.map((r) => r.authorId))];
    const authors = authorIds.length
      ? await this.userRepository.find({
        where: { id: In(authorIds) },
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      })
      : [];

    return reviews.map((review) => {
      const author = authors.find((a) => a.id === review.authorId);
      return {
        ...review,
        author: author
          ? {
            id: author.id,
            name: `${author.firstName || ''} ${author.lastName || ''}`.trim(),
            avatarUrl: author.avatarUrl || null,
          }
          : null,
      };
    });
  }
}

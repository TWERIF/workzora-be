import {
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,

        @Inject('SEARCH_CLIENT')
        private readonly searchClient: ClientProxy,
    ) { }

    private calculateMinutes(article: string): number {
        if (!article) return 1;
        const count = article.length;
        const wpm = 200;

        const minutes = count / wpm;

        return minutes <= 1 ? 1 : Math.ceil(minutes);
    }

    async create(dto: CreatePostDto): Promise<Post> {
        try {
            const post = this.postsRepository.create({
                ...dto,
                minutesToRead: this.calculateMinutes(dto.article),
            });
            this.searchClient.emit("post.created", post);
            return await this.postsRepository.save(post);
        } catch (error) {
            throw error;
        }
    }

    async update(dto: UpdatePostDto): Promise<Post> {
        try {
            const post = await this.postsRepository.findOne({
                where: { id:dto.id },
            });

            if (!post) {
                throw new NotFoundException('Post not found');
            }
            Object.assign(post, dto);

            if (dto.article) {
                post.minutesToRead = this.calculateMinutes(dto.article);
            }
            this.searchClient.emit("post.updated", post);
            return await this.postsRepository.save(post);
        } catch (error) {
            throw error;
        }
    }
    async findManyByIds(ids: string[]) {
        return await this.postsRepository.find({
            where: { id: In(ids) }
        });
    }
    async delete(id: string): Promise<void> {
        try {
            const result = await this.postsRepository.delete(id);

            if (!result.affected) {
                throw new NotFoundException('Post not found');
            }
            this.searchClient.emit("post.deleted", id);
        } catch (error) {
            throw error;
        }
    }

    async getAll(page = 1, limit = 10) {
        try {
            const [posts, total] = await this.postsRepository.findAndCount({
                order: {
                    createdAt: 'DESC',
                },
                skip: (page - 1) * limit,
                take: limit,
            });

            return {
                data: posts,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            throw error;
        }
    }

    async getLatestThree(): Promise<Post[]> {
        try {
            return await this.postsRepository.find({
                take: 3,
                order: {
                    createdAt: 'DESC',
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async getOne(id: string): Promise<Post> {
        try {
            const post = await this.postsRepository.findOne({
                where: { id },
            });

            if (!post) {
                throw new NotFoundException('Post not found');
            }

            return post;
        } catch (error) {
            throw error;
        }
    }
}
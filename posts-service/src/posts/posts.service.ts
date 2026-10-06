import {
    Inject,
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Not, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { slugify } from './slug.util';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class PostsService implements OnModuleInit {
    private readonly logger = new Logger(PostsService.name);

    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,

        @Inject('SEARCH_CLIENT')
        private readonly searchClient: ClientProxy,
    ) { }

    // Posts created before slugs existed get one on startup.
    async onModuleInit() {
        const posts = await this.postsRepository.find({
            where: { slug: IsNull() },
            order: { createdAt: 'ASC' },
        });
        for (const post of posts) {
            post.slug = await this.uniqueSlug(post.title, post.id);
            await this.postsRepository.save(post);
            // these posts were indexed before they had an id, so index them again
            this.searchClient.emit("post.updated", post);
        }
        if (posts.length) this.logger.log(`Generated slugs for ${posts.length} posts`);
    }

    // Appends -2, -3... when another post already uses the same slug.
    private async uniqueSlug(title: string, excludeId?: string): Promise<string> {
        const base = slugify(title);
        const taken = await this.postsRepository.find({
            select: { id: true, slug: true },
            where: { slug: Like(`${base}%`), ...(excludeId ? { id: Not(excludeId) } : {}) },
        });
        const used = new Set(taken.map((p) => p.slug));
        if (!used.has(base)) return base;

        let n = 2;
        while (used.has(`${base}-${n}`)) n++;
        return `${base}-${n}`;
    }

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
                slug: await this.uniqueSlug(dto.title),
                minutesToRead: this.calculateMinutes(dto.article),
            });
            const saved = await this.postsRepository.save(post);
            // emitted after save so the search index receives the generated id
            this.searchClient.emit("post.created", saved);
            return saved;
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
                throw new RpcException({ statusCode: 404, message: 'Post not found' });
            }
            const titleChanged = !!dto.title && dto.title !== post.title;
            Object.assign(post, dto);
            if (titleChanged || !post.slug) {
                post.slug = await this.uniqueSlug(post.title, post.id);
            }

            if (dto.article) {
                post.minutesToRead = this.calculateMinutes(dto.article);
            }
            const saved = await this.postsRepository.save(post);
            this.searchClient.emit("post.updated", saved);
            return saved;
        } catch (error) {
            throw error;
        }
    }
    async findManyByIds(ids: string[]) {
        return await this.postsRepository.find({
            where: { id: In(ids) }
        });
    }
    // returns a value: an RMQ reply without one makes the gateway fail with EmptyError
    async delete(id: string): Promise<{ success: true }> {
        try {
            const result = await this.postsRepository.delete(id);

            if (!result.affected) {
                throw new RpcException({ statusCode: 404, message: 'Post not found' });
            }
            this.searchClient.emit("post.deleted", id);
            return { success: true };
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

    // Accepts either the post id (old links) or its slug.
    async getOne(idOrSlug: string): Promise<Post> {
        try {
            const post = await this.postsRepository.findOne({
                where: UUID_RE.test(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug },
            });

            if (!post) {
                throw new RpcException({ statusCode: 404, message: 'Post not found' });
            }

            return post;
        } catch (error) {
            throw error;
        }
    }
}
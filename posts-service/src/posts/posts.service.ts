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
import { GetPostsDto } from './dto/get-posts.dto';
import { normalizeTag, POST_TAGS } from './tags';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class PostsService implements OnModuleInit {
    private readonly logger = new Logger(PostsService.name);

    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,

        @Inject('SEARCH_CLIENT')
        private readonly searchClient: ClientProxy,
        @Inject('EMAIL_CLIENT')
        private readonly emailClient: ClientProxy,
    ) { }

    async onModuleInit() {
        const posts = await this.postsRepository.find({
            where: { slug: IsNull() },
            order: { createdAt: 'ASC' },
        });
        for (const post of posts) {
            post.slug = await this.uniqueSlug(post.title, post.id);
            await this.postsRepository.save(post);
            this.searchClient.emit("post.updated", post);
        }
        if (posts.length) this.logger.log(`Generated slugs for ${posts.length} posts`);

        const legacy = (await this.postsRepository.find()).filter((post) => !(POST_TAGS as readonly string[]).includes(post.tag));
        for (const post of legacy) await this.postsRepository.update(post.id, { tag: normalizeTag(post.tag) });
    }

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
            this.searchClient.emit("post.created", saved);
            this.emailClient.emit("post.published", { title: saved.title, slug: saved.slug, teaser: saved.teaser, imageUrl: saved.imageUrl });
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
    async delete(id: string): Promise<{ success: true }> {
        try {
            const result = await this.postsRepository.delete(id);

            if (!result.affected) {
                throw new RpcException({ statusCode: 404, message: 'Post not found' });
            }
            this.searchClient.emit("post.deleted", { id });
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    async getAll({ page = 1, limit = 10, tag, exclude }: GetPostsDto) {
        try {
            const [posts, total] = await this.postsRepository.findAndCount({
                where: { ...(tag ? { tag } : {}), ...(exclude ? { id: Not(exclude) } : {}) },
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

    getPopular(): Promise<Post[]> {
        return this.postsRepository.find({ order: { views: 'DESC', createdAt: 'DESC' }, take: 5 });
    }

    async addView(id: string) {
        await this.postsRepository.increment({ id }, 'views', 1);
        return { success: true };
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
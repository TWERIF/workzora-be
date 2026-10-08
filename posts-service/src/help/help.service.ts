import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
import { HELP_CATEGORIES, HelpAdminListDto, HelpArticleDto, HelpListDto, HelpSlugDto, HelpUpdateDto } from './dto';
import { HelpArticle } from './help-article.entity';
import { HELP_SEED } from './seed';

const LIST_FIELDS: (keyof HelpArticle)[] = ['id', 'category', 'slug', 'locale', 'title', 'summary', 'position', 'minutesToRead', 'updatedAt'];
const REACTION_COLUMNS = { yes: 'helpfulYes', maybe: 'helpfulMaybe', no: 'helpfulNo' } as const;

const minutesToRead = (html: string) => Math.max(1, Math.ceil(html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length / 200));

@Injectable()
export class HelpService implements OnModuleInit {
    private readonly logger = new Logger(HelpService.name);

    constructor(@InjectRepository(HelpArticle) private readonly articles: Repository<HelpArticle>) {}

    async onModuleInit() {
        if (await this.articles.count()) return;
        await this.articles.save(HELP_SEED.map((item) => this.articles.create({ ...item, minutesToRead: minutesToRead(item.body) })));
        this.logger.log(`Seeded ${HELP_SEED.length} help articles`);
    }

    async categories({ locale }: { locale: string }) {
        const rows = await this.articles
            .createQueryBuilder('article')
            .select('article.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .where('article.locale = :locale', { locale })
            .groupBy('article.category')
            .getRawMany<{ category: string; count: string }>();
        return HELP_CATEGORIES.map((key) => ({ key, count: Number(rows.find((row) => row.category === key)?.count ?? 0) }));
    }

    list({ locale, category, search }: HelpListDto) {
        const qb = this.articles
            .createQueryBuilder('article')
            .select(LIST_FIELDS.map((field) => `article.${field}`))
            .where('article.locale = :locale', { locale });
        if (category) qb.andWhere('article.category = :category', { category });
        if (search?.trim()) {
            const term = `%${search.trim()}%`;
            qb.andWhere(
                new Brackets((where) =>
                    where.where('article.title ILIKE :term', { term }).orWhere('article.summary ILIKE :term', { term }).orWhere('article.body ILIKE :term', { term }),
                ),
            );
            qb.take(30);
        }
        return qb.orderBy('article.category', 'ASC').addOrderBy('article.position', 'ASC').addOrderBy('article.createdAt', 'ASC').getMany();
    }

    async getBySlug({ locale, category, slug }: HelpSlugDto) {
        const article = await this.articles.findOne({ where: { locale, category, slug } });
        if (!article) throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Help article not found' });
        return article;
    }

    async feedback(id: string, reaction: keyof typeof REACTION_COLUMNS) {
        const result = await this.articles.increment({ id }, REACTION_COLUMNS[reaction], 1);
        if (!result.affected) throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Help article not found' });
        return { success: true };
    }

    async adminList({ page = 1, limit = 20, category, locale, search }: HelpAdminListDto) {
        const qb = this.articles.createQueryBuilder('article');
        if (category) qb.andWhere('article.category = :category', { category });
        if (locale) qb.andWhere('article.locale = :locale', { locale });
        if (search?.trim()) qb.andWhere('article.title ILIKE :term', { term: `%${search.trim()}%` });
        const [data, total] = await qb
            .orderBy('article.category', 'ASC')
            .addOrderBy('article.position', 'ASC')
            .addOrderBy('article.locale', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async adminGet(id: string) {
        const article = await this.articles.findOne({ where: { id } });
        if (!article) throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Help article not found' });
        return article;
    }

    async create(dto: HelpArticleDto) {
        await this.assertSlugFree(dto.slug, dto.locale);
        return this.articles.save(this.articles.create({ ...dto, minutesToRead: minutesToRead(dto.body) }));
    }

    async update({ id, ...dto }: HelpUpdateDto) {
        const article = await this.adminGet(id);
        await this.assertSlugFree(dto.slug, dto.locale, id);
        Object.assign(article, dto, { minutesToRead: minutesToRead(dto.body) });
        return this.articles.save(article);
    }

    async remove(id: string) {
        const result = await this.articles.delete(id);
        if (!result.affected) throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Help article not found' });
        return { success: true };
    }

    private async assertSlugFree(slug: string, locale: string, exceptId?: string) {
        const taken = await this.articles.exists({ where: { slug, locale, ...(exceptId ? { id: Not(exceptId) } : {}) } });
        if (taken) throw new RpcException({ statusCode: HttpStatus.CONFLICT, message: 'An article with this slug already exists in this language' });
    }
}

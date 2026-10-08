import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    CreateCategoriesDto,
    UpdateCategoriesDto
} from './dto';
import { Category } from './entities/category.entity';

type CategoryWithCount = Category & { count?: number };

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(dto: CreateCategoriesDto): Promise<Category> {
        if (dto.parentId) await this.assertTopLevel(dto.parentId);
        const category = this.categoryRepository.create({
            title: dto.title,
            description: dto.description,
            parentId: dto.parentId ?? null,
        });

        return this.categoryRepository.save(category);
    }

    async findOne(id: string) {
        const category = await this.categoryRepository
            .createQueryBuilder('category')
            .where('category.id = :id', { id })
            .loadRelationCountAndMap(
                'category.count',
                'category.projects',
            )
            .getOne();

        if (!category) {
            throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Category not found' });
        }

        return category;
    }

    async findAll(data: { page: number; limit: number }) {
        const page = Number(data.page) || 1;
        const limit = Number(data.limit) || 10;

        const query = this.categoryRepository
            .createQueryBuilder('category')
            .loadRelationCountAndMap(
                'category.count',
                'category.projects',
            )
            .orderBy('category.title', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [items, total] = await query.getManyAndCount();

        return {
            items: items.map((item: CategoryWithCount) => ({
                ...item,
                subcategories: [],
                count: item.count ?? 0,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async update(dto: UpdateCategoriesDto): Promise<Category> {
        const category = await this.findOne(dto.id);

        if (dto.parentId) {
            if (dto.parentId === category.id) throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'A category cannot be its own parent' });
            await this.assertTopLevel(dto.parentId);
            if (await this.categoryRepository.exist({ where: { parentId: category.id } })) {
                throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'A category with specializations cannot become a specialization' });
            }
        }
        Object.assign(category, {
            title: dto.title ?? category.title,
            description:
                dto.description ?? category.description,
            parentId: dto.parentId === undefined ? category.parentId : dto.parentId,
        });

        return this.categoryRepository.save(category);
    }
    async search(data: {
        search: string;
        page: number;
        limit: number;
    }) {
        const page = Number(data.page) || 1;
        const limit = Number(data.limit) || 10;

        const query = this.categoryRepository
            .createQueryBuilder('category')
            .loadRelationCountAndMap(
                'category.count',
                'category.projects',
            )
            .where('category.title ILIKE :search', {
                search: `%${data.search}%`,
            })
            .orderBy('category.title', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [items, total] = await query.getManyAndCount();

        return {
            items: items.map((item: CategoryWithCount) => ({
                ...item,
                subcategories: [],
                count: item.count ?? 0,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async delete(data: { id: string }) {
        const category = await this.findOne(data.id);
        if (await this.categoryRepository.exist({ where: { parentId: category.id } })) {
            throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'Remove or move the specializations of this category first' });
        }

        await this.categoryRepository.remove(category);

        return {
            success: true,
            id: data.id,
        };
    }

    async tree() {
        const categories = await this.categoryRepository.find({ order: { title: 'ASC' } });
        const counts: { category_id: string; count: string }[] = await this.categoryRepository.query(
            `SELECT pc.category_id, COUNT(DISTINCT p.id) AS count
             FROM project.project_categories pc
             JOIN project.projects p ON p.id = pc.project_id AND p.status = 'open'
             GROUP BY pc.category_id`,
        );
        const own = new Map(counts.map((row) => [row.category_id, Number(row.count)]));
        const parents = categories.filter((category) => !category.parentId);
        return Promise.all(
            parents.map(async (parent) => {
                const children = categories.filter((category) => category.parentId === parent.id);
                const ids = [parent.id, ...children.map((child) => child.id)];
                const [{ count }] = await this.categoryRepository.query(
                    `SELECT COUNT(DISTINCT p.id) AS count
                     FROM project.project_categories pc
                     JOIN project.projects p ON p.id = pc.project_id AND p.status = 'open'
                     WHERE pc.category_id = ANY($1)`,
                    [ids],
                );
                return {
                    id: parent.id,
                    title: parent.title,
                    description: parent.description,
                    count: Number(count),
                    specializations: children.map((child) => ({ id: child.id, title: child.title, count: own.get(child.id) ?? 0 })),
                };
            }),
        );
    }

    private async assertTopLevel(id: string) {
        const parent = await this.categoryRepository.findOne({ where: { id } });
        if (!parent) throw new RpcException({ statusCode: HttpStatus.NOT_FOUND, message: 'Parent category not found' });
        if (parent.parentId) throw new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: 'Specializations can only be added to a top-level category' });
    }
}

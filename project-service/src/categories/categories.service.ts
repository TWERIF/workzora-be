import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
    CreateCategoriesDto,
    UpdateCategoriesDto
} from './dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(dto: CreateCategoriesDto): Promise<Category> {
        const category = this.categoryRepository.create({
            title: dto.title,
            description: dto.description,
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
            throw new NotFoundException('Category not found');
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
            items: items.map((item: any) => ({
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

        Object.assign(category, {
            title: dto.title ?? category.title,
            description:
                dto.description ?? category.description,
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
            items: items.map((item: any) => ({
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

        await this.categoryRepository.remove(category);

        return {
            success: true,
            id: data.id,
        };
    }
}
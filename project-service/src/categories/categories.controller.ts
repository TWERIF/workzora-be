import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import type { CreateCategoriesDto, Id, UpdateCategoriesDto } from './dto';

@Controller()
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @MessagePattern('categories.findOne')
    async findOne(@Payload() data: Id) {
        return await this.categoriesService.findOne(data.id);
    }

    @MessagePattern('categories.update')
    async update(@Payload() data: UpdateCategoriesDto) {
        return await this.categoriesService.update(data);
    }

    @MessagePattern('categories.create')
    async create(@Payload() data: CreateCategoriesDto) {
        return await this.categoriesService.create(data);
    }

    @MessagePattern('categories.delete')
    async delete(@Payload() data: Id) {
        return await this.categoriesService.delete(data);
    }

    @MessagePattern('categories.findAll')
    async findAll(
        @Payload() data: { page: number; limit: number },
    ) {
        try {
            return await this.categoriesService.findAll(data);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    @MessagePattern('categories.search')
    async search(
        @Payload()
        data: {
            search: string;
            page: number;
            limit: number;
        },
    ) {
        try {
            return await this.categoriesService.search(data);
        } catch (e) {
            return { error: 'DB_ERROR' };
        }
    }
}

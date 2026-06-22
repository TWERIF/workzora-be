import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import type { CreateCategoriesDto, Id, UpdateCategoriesDto } from './dto';

@Controller()
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @MessagePattern('categories.findOne')
    findOne(@Payload() data: Id) {
        return this.categoriesService.findOne(data.id);
    }

    @MessagePattern('categories.update')
    update(@Payload() data: UpdateCategoriesDto) {
        return this.categoriesService.update(data);
    }

    @MessagePattern('categories.create')
    create(@Payload() data: CreateCategoriesDto) {
        return this.categoriesService.create(data);
    }

    @MessagePattern('categories.delete')
    delete(@Payload() data: Id) {
        return this.categoriesService.delete(data);
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

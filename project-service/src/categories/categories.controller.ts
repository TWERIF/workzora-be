import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { CategoriesPageDto, CreateCategoriesDto, IdDto, SearchCategoriesDto, UpdateCategoriesDto } from './dto';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @MessagePattern('categories.findOne')
  findOne(@Payload() data: IdDto) {
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
  delete(@Payload() data: IdDto) {
    return this.categoriesService.delete(data);
  }

  @MessagePattern('categories.tree')
  tree() {
    return this.categoriesService.tree();
  }

  @MessagePattern('categories.findAll')
  findAll(@Payload() data: CategoriesPageDto) {
    return this.categoriesService.findAll(data);
  }

  @MessagePattern('categories.search')
  search(@Payload() data: SearchCategoriesDto) {
    return this.categoriesService.search(data);
  }
}

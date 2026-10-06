import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateReviewDto, FindByTargetDto, FindMineDto } from './dto';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @MessagePattern('reviews.create')
  create(@Payload() data: CreateReviewDto) {
    return this.reviewsService.create(data);
  }

  @MessagePattern('reviews.findByTarget')
  findByTarget(@Payload() data: FindByTargetDto) {
    return this.reviewsService.findByTarget(data.targetId, data.page, data.limit);
  }

  @MessagePattern('reviews.findMine')
  findMine(@Payload() data: FindMineDto) {
    return this.reviewsService.findMine(data.projectId, data.authorId);
  }
}

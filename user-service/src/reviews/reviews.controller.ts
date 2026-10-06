import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { CreateReviewPayload } from './reviews.service';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @MessagePattern('reviews.create')
  create(@Payload() data: CreateReviewPayload) {
    return this.reviewsService.create(data);
  }

  @MessagePattern('reviews.findByTarget')
  findByTarget(@Payload() data: { targetId: string; page?: number; limit?: number }) {
    return this.reviewsService.findByTarget(data.targetId, data.page, data.limit);
  }

  @MessagePattern('reviews.findMine')
  findMine(@Payload() data: { projectId: string; authorId: string }) {
    return this.reviewsService.findMine(data.projectId, data.authorId);
  }
}

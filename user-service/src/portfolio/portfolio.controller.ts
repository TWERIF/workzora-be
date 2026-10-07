import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePortfolioDto, DeletePortfolioDto, PaginationDto, PortfolioIdDto, UpdatePortfolioDto, UserIdDto, UserIdsDto } from './dto';
import { PortfolioService } from './portfolio.service';

@Controller()
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @MessagePattern('portfolio.create')
  create(@Payload() dto: CreatePortfolioDto) {
    return this.portfolioService.create(dto);
  }

  @MessagePattern('portfolio.update')
  update(@Payload() dto: UpdatePortfolioDto) {
    return this.portfolioService.update(dto);
  }

  @MessagePattern('portfolio.delete')
  delete(@Payload() dto: DeletePortfolioDto) {
    return this.portfolioService.delete(dto);
  }

  @MessagePattern('portfolio.addView')
  addView(@Payload() dto: PortfolioIdDto) {
    return this.portfolioService.addView(dto);
  }

  @MessagePattern('portfolio.findAll')
  findAll(@Payload() payload: PaginationDto) {
    return this.portfolioService.findAll(payload);
  }

  @MessagePattern('portfolio.findByUserId')
  findByUserId(@Payload() payload: UserIdDto) {
    return this.portfolioService.findByUserId(payload.userId);
  }

  @MessagePattern('portfolio.findByUserIds')
  findByUserIds(@Payload() payload: UserIdsDto) {
    return this.portfolioService.findByUserIds(payload.userIds);
  }
}

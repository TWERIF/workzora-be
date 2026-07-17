import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { CreatePortfolio, UpdatePortfolio } from './dto';
import { PortfolioService } from './portfolio.service';

@Controller()
export class PortfolioController {
    constructor(
        private readonly portfolioService: PortfolioService,
    ) { }

    @MessagePattern('portfolio.create')
    create(
        @Payload() dto: CreatePortfolio,
    ) {
        return this.portfolioService.create(dto);
    }

    @MessagePattern('portfolio.update')
    update(
        @Payload() dto: UpdatePortfolio,
    ) {
        return this.portfolioService.update(dto);
    }

    @MessagePattern('portfolio.delete')
    delete(
        @Payload() id: string,
    ) {
        return this.portfolioService.delete(id);
    }

    @MessagePattern('portfolio.findAll')
    findAll(
        @Payload()
        payload: {
            page: number;
            limit: number;
        },
    ) {
        return this.portfolioService.findAll(payload);
    }

    @MessagePattern('portfolio.findByUserId')
    findByUserId(
        @Payload() userId: string,
    ) {
        return this.portfolioService.findByUserId(userId);
    }
}
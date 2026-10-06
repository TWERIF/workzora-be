import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { StatsService } from './stats.service';
import type { StatsRange } from './stats.service';

@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @EventPattern('stats.visit')
  async recordVisit(@Payload() data: { visitorId: string }) {
    await this.statsService.recordVisit(data.visitorId);
  }

  @MessagePattern('stats.visits')
  visits(@Payload() range: StatsRange) {
    return this.statsService.visitStats(range);
  }

  @MessagePattern('stats.users')
  users(@Payload() range: StatsRange) {
    return this.statsService.userStats(range);
  }
}

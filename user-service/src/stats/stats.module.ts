import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { DailyVisit } from './entities/daily-visit.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([DailyVisit, User])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}

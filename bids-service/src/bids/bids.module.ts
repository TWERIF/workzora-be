import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { Bid } from './entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid])],
  providers: [BidsService],
  controllers: [BidsController]
})
export class BidsModule { }

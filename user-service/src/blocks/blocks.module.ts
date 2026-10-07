import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { UserBlock } from './entities/user-block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserBlock, User])],
  controllers: [BlocksController],
  providers: [BlocksService],
})
export class BlocksModule {}

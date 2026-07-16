import { Module } from '@nestjs/common';
import { SenderService } from './sender.service';
import { SenderController } from './sender.controller';

@Module({
  providers: [SenderService],
  controllers: [SenderController]
})
export class SenderModule {}

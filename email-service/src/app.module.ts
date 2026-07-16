import { Module } from '@nestjs/common';
import { SenderModule } from './sender/sender.module';

@Module({
  imports: [SenderModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

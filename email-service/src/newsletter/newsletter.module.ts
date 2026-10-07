import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SenderModule } from '../sender/sender.module';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { Subscriber } from './subscriber.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Subscriber]), SenderModule],
    providers: [NewsletterService],
    controllers: [NewsletterController],
})
export class NewsletterModule {}

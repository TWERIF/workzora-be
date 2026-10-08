import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpArticle } from './help-article.entity';
import { HelpController } from './help.controller';
import { HelpService } from './help.service';

@Module({
    imports: [TypeOrmModule.forFeature([HelpArticle])],
    providers: [HelpService],
    controllers: [HelpController],
})
export class HelpModule {}

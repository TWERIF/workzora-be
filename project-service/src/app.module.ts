import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'postgres',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'workzorauser',
      password: process.env.POSTGRES_PASSWORD || 'J95jACtFtadE',
      database: process.env.POSTGRES_DB || 'workzoradb',
      schema: 'users',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProjectsModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

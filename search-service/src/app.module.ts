import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsSearchModule } from './projects-search/projects-search.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'postgres',
        port: Number(process.env.POSTGRES_PORT) || 5432,
        username: process.env.POSTGRES_USER || 'workzorauser',
        password: process.env.POSTGRES_PASSWORD || 'J95jACtFtadE',
        database: process.env.POSTGRES_DB || 'workzoradb',
        autoLoadEntities: true,
        synchronize: false,
      })
    }),

    ProjectsSearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
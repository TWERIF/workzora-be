import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsSearchModule } from './projects-search/projects-search.module';
import { PostsSearchModule } from './posts-search/posts-search.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        ...(process.env.NEON_URL
          ? { url: process.env.NEON_URL, ssl: true }
          : {
              host: process.env.POSTGRES_HOST || 'postgres',
              port: Number(process.env.POSTGRES_PORT) || 5432,
              username: process.env.POSTGRES_USER,
              password: process.env.POSTGRES_PASSWORD,
              database: process.env.POSTGRES_DB,
            }),
        extra: { max: Number(process.env.POSTGRES_POOL_MAX) || 5 },
        autoLoadEntities: true,
        synchronize: false,
      })
    }),

    ProjectsSearchModule,

    PostsSearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NewsletterModule } from './newsletter/newsletter.module';
import { SenderModule } from './sender/sender.module';

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
        synchronize: true,
      }),
      dataSourceFactory: async (options) => {
        if (!options) throw new Error('Invalid options passed');
        const init = new DataSource({ ...options, synchronize: false });
        await init.initialize();
        await init.query('CREATE SCHEMA IF NOT EXISTS "newsletter"');
        await init.destroy();
        return new DataSource(options).initialize();
      },
    }),
    SenderModule,
    NewsletterModule,
  ],
})
export class AppModule {}

import { NotifierModule } from './common/notifier';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlocksModule } from './blocks/blocks.module';
import { PaymentDataModule } from './payment-data/payment-data.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    NotifierModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'postgres',
        port: Number(process.env.POSTGRES_PORT) || 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        autoLoadEntities: true,
        synchronize: true,
      }),
      dataSourceFactory: async (options) => {
        if (!options) throw new Error('Invalid options passed');

        const initDataSource = new DataSource({
          ...options,
          synchronize: false,
        });

        await initDataSource.initialize();

        const schemas = ['users', 'portfolio', 'payment_data', 'reviews', 'analytics'];
        for (const schema of schemas) {
          await initDataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        }

        await initDataSource.destroy();

        const dataSource = new DataSource(options);
        return await dataSource.initialize();
      },
    }),
    UsersModule,
    BlocksModule, PortfolioModule, PaymentDataModule, ReviewsModule, StatsModule
  ],
})
export class AppModule { }










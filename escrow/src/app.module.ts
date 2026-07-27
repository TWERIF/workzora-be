import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InvoicesModule } from './invoices/invoices.module';

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
        synchronize: true,
      }),
      dataSourceFactory: async (options) => {
        if (!options) throw new Error('Invalid options passed');

        const initDataSource = new DataSource({
          ...options,
          synchronize: false,
        });

        await initDataSource.initialize();

        const schemas = ['invoice'];
        for (const schema of schemas) {
          await initDataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        }

        await initDataSource.destroy();

        const dataSource = new DataSource(options);
        return await dataSource.initialize();
      },
    }),

    InvoicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
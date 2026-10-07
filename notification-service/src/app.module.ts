import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
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
        const init = new DataSource({ ...options, synchronize: false });
        await init.initialize();
        await init.query('CREATE SCHEMA IF NOT EXISTS "notifications"');
        await init.destroy();
        return new DataSource(options).initialize();
      },
    }),
    NotificationsModule,
  ],
})
export class AppModule {}

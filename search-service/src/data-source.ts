import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
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
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
});
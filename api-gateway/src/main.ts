import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'https://workzora.com', 'https://www.workzora.com', 'https://workzora.com/admin', 'http://workzora.com/admin', 'http://185.229.251.118','http://185.229.251.118:3000','http://185.229.251.118:3001', 'http://workzora.com'], credentials: true });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();

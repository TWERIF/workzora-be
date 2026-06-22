import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'search_queue',
        queueOptions: { durable: true },
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe());

  await app.listen();
  console.log('Search microservice listening...');
}

bootstrap();

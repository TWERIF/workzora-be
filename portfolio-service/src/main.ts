import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'portfolio_queue',
        queueOptions: { durable: true },
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe());

  await app.listen();
  console.log('Portfolio microservice listening...');
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { rpcValidationPipe } from './common/rpc-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: 'notifications_queue',
      queueOptions: { durable: true },
    },
  });
  app.useGlobalPipes(rpcValidationPipe);
  await app.listen();
}
bootstrap();

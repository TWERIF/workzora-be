import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { rpcValidationPipe } from './common/rpc-validation.pipe';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'email_queue',
        queueOptions: { durable: true },
      },
    },
  );
  app.useGlobalPipes(rpcValidationPipe);

  await app.listen();
}

bootstrap();

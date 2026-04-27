import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatGateway } from './chat.gateway';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';

@Module({
  imports: [
    // ОБОВ'ЯЗКОВИЙ БЛОК: Реєструємо клієнт, щоб контролер міг його знайти
    ClientsModule.register([
      {
        name: 'PROJECT_SERVICE', // Ця назва має точно збігатися з @Inject('PROJECT_SERVICE')
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'], // URL вашого RabbitMQ
          queue: 'projects_queue', // Черга мікросервісу проєктів
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, CloudinaryService],
})
export class ChatModule {}

import { Global, Inject, Injectable, Logger, Module } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';

export type NotificationType = 'projects' | 'messages' | 'payments' | 'system';

export interface NotificationEvent {
  userId: string;
  type: NotificationType;
  key: string;
  params?: Record<string, string | number>;
  link?: string;
  dedupeKey?: string;
}

const NOTIFICATIONS_CLIENT = 'NOTIFICATIONS_CLIENT';

@Injectable()
export class Notifier {
  private readonly logger = new Logger(Notifier.name);

  constructor(@Inject(NOTIFICATIONS_CLIENT) private readonly client: ClientProxy) {}

  notify(event: NotificationEvent) {
    this.client.emit('notification.create', event).subscribe({
      error: (error: unknown) => this.logger.warn(`Notification ${event.key} was not sent: ${String(error)}`),
    });
  }
}

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: NOTIFICATIONS_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'notifications_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [Notifier],
  exports: [Notifier],
})
export class NotifierModule {}

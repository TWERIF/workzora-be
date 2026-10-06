import { ClientProviderOptions, Transport } from '@nestjs/microservices';

export const QUEUES = {
  AUTH_SERVICE: 'auth_queue',
  USER_SERVICE: 'users_queue',
  PROJECT_SERVICE: 'projects_queue',
  BIDS_SERVICE: 'bids_queue',
  KYC_SERVICE: 'kyc_queue',
  POSTS_SERVICE: 'posts_queue',
  SEARCH_SERVICE: 'search_queue',
  INVOICES_SERVICE: 'escrow_queue',
} as const;

export type ServiceName = keyof typeof QUEUES;

export const rmqClient = (name: ServiceName): ClientProviderOptions => ({
  name,
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL ?? 'amqp://rabbitmq:5672'],
    queue: QUEUES[name],
    queueOptions: { durable: true },
  },
});

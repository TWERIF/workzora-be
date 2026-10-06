import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

// Microservices reply to failures with plain objects:
//   RpcException({ statusCode, message }) -> { statusCode, message }
//   RpcException('text')                  -> { status: 'error', message: 'text' }
//   any other error                       -> { status: 'error', message: 'Internal server error' }
// This turns them into HttpExceptions so the client gets a meaningful status and message.
export async function sendRpc<T = any>(client: ClientProxy, pattern: string, data: unknown = {}): Promise<T> {
  try {
    return await firstValueFrom(client.send<T>(pattern, data));
  } catch (error: any) {
    if (error instanceof HttpException) throw error;

    const message = error?.message ?? 'Service unavailable';
    const statusCode =
      typeof error?.statusCode === 'number'
        ? error.statusCode
        : message === 'Internal server error'
          ? HttpStatus.INTERNAL_SERVER_ERROR
          : HttpStatus.BAD_REQUEST;

    throw new HttpException(message, statusCode);
  }
}

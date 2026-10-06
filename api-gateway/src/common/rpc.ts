import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface RpcErrorPayload {
  statusCode?: number;
  message?: string | string[];
}

const isRpcError = (error: unknown): error is RpcErrorPayload =>
  typeof error === 'object' && error !== null && ('message' in error || 'statusCode' in error);

export async function sendRpc<T = unknown>(client: ClientProxy, pattern: string, data: unknown = {}): Promise<T> {
  try {
    return await firstValueFrom(client.send<T>(pattern, data));
  } catch (error: unknown) {
    if (error instanceof HttpException) throw error;

    const payload = isRpcError(error) ? error : {};
    const message = payload.message ?? 'Service unavailable';
    const statusCode =
      typeof payload.statusCode === 'number'
        ? payload.statusCode
        : message === 'Internal server error'
          ? HttpStatus.INTERNAL_SERVER_ERROR
          : HttpStatus.BAD_REQUEST;

    throw new HttpException(message, statusCode);
  }
}

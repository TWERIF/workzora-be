import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

const collectMessages = (errors: ValidationError[]): string[] =>
  errors.flatMap((error) => [...Object.values(error.constraints ?? {}), ...collectMessages(error.children ?? [])]);

export const rpcValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (errors) =>
    new RpcException({ statusCode: HttpStatus.BAD_REQUEST, message: collectMessages(errors) }),
});

export const rpcError = (statusCode: HttpStatus, message: string) => new RpcException({ statusCode, message });

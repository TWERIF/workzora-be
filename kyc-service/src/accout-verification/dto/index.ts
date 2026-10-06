import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUrl, IsUUID, Max, Min } from 'class-validator';
import { VerificationStatus } from '../entities/account-verification.entity';

export class CreateAccountVerificationDto {
  @IsUUID()
  userId!: string;

  @IsUrl({ protocols: ['https'], require_protocol: true })
  documentUrl!: string;

  @IsUrl({ protocols: ['https'], require_protocol: true })
  selfieUrl!: string;
}

export class VerifyAccountDto {
  @IsUUID()
  id!: string;

  @IsEnum(VerificationStatus)
  status!: VerificationStatus;
}

export class IdDto {
  @IsUUID()
  id!: string;
}

export class UserIdDto {
  @IsUUID()
  userId!: string;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

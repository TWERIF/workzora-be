import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsISO8601, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { WonDispute } from '../entities/invoice.entity';

export class IdDto {
  @IsUUID()
  id!: string;
}

export class StatsRangeDto {
  @IsISO8601()
  from!: string;

  @IsISO8601()
  to!: string;
}

export class CreateEscrowDto {
  @IsInt()
  @Min(1)
  amount!: number;

  @IsInt()
  currencyCode!: number;

  @IsUUID()
  projectId!: string;

  @IsUUID()
  clientId!: string;

  @IsUUID()
  freelancerId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(458)
  description?: string;
}

export class InvoiceForUserDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;

  @IsBoolean()
  isAdmin!: boolean;
}

export class InvoiceStatusDto {
  @IsString()
  @MaxLength(100)
  invoiceId!: string;

  @IsUUID()
  userId!: string;
}

export class MonobankInvoiceDto {
  @IsString()
  @MaxLength(100)
  invoiceId!: string;
}

export class ConfirmEscrowDto {
  @IsUUID()
  invoiceId!: string;

  @IsUUID()
  clientId!: string;
}

export class ReleaseEscrowDto {
  @IsUUID()
  projectId!: string;

  @IsUUID()
  clientId!: string;
}

export class OpenDisputeDto {
  @IsUUID()
  invoiceId!: string;

  @IsUUID()
  initiatorId!: string;

  @IsString()
  @MaxLength(2000)
  reason!: string;
}

export class ResolveDisputeDto {
  @IsUUID()
  invoiceId!: string;

  @IsUUID()
  adminId!: string;

  @Type(() => Number)
  @IsIn([WonDispute.CLIENT, WonDispute.FREELANCER])
  decision!: WonDispute;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

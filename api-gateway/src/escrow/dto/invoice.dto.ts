import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export enum WonDispute {
  CLIENT,
  FREELANCER,
}

export class CreateEscrowBodyDto {
  @ApiProperty()
  @IsUUID()
  projectId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(458)
  description?: string;
}

export class OpenDisputeBodyDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  reason!: string;
}

export class ResolveDisputeBodyDto {
  @ApiProperty({ enum: WonDispute, description: '0 client, 1 freelancer' })
  @Type(() => Number)
  @IsIn([WonDispute.CLIENT, WonDispute.FREELANCER])
  decision!: WonDispute;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class HistoryQueryDto {
  @ApiPropertyOptional({ description: 'ISO date, only newer entries' })
  @IsOptional()
  @IsISO8601()
  from?: string;
}

export class TransactionsQueryDto extends HistoryQueryDto {
  @ApiPropertyOptional({ enum: ['balance', 'bonus'] })
  @IsOptional()
  @IsIn(['balance', 'bonus'])
  kind?: 'balance' | 'bonus';
}

export class CreateWithdrawalDto {
  @ApiProperty({ description: 'USD, at least 10' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(10)
  @Max(1_000_000)
  amount!: number;

  @ApiPropertyOptional({ description: 'Card to pay out to, the primary card when omitted' })
  @IsOptional()
  @IsUUID()
  cardId?: string;
}

export class AdminWithdrawalsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['processing', 'completed', 'rejected'] })
  @IsOptional()
  @IsIn(['processing', 'completed', 'rejected'])
  status?: string;
}

export class RejectWithdrawalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

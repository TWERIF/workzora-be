import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { TransactionKind } from '../entities/wallet-transaction.entity';
import { WithdrawalStatus } from '../entities/withdrawal.entity';

export class UserIdDto {
  @IsUUID()
  userId!: string;
}

export class TransactionsDto extends UserIdDto {
  @IsOptional()
  @IsEnum(TransactionKind)
  kind?: TransactionKind;

  @IsOptional()
  @IsISO8601()
  from?: string;
}

export class WithdrawalsDto extends UserIdDto {
  @IsOptional()
  @IsISO8601()
  from?: string;
}

export class CreateWithdrawalDto extends UserIdDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsString()
  @MaxLength(40)
  maskedCard!: string;

  @IsOptional()
  @IsUUID()
  cardId?: string;
}

export class AdminWithdrawalsDto {
  @IsOptional()
  @IsEnum(WithdrawalStatus)
  status?: WithdrawalStatus;

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

export class WithdrawalIdDto {
  @IsUUID()
  id!: string;
}

export class CompleteWithdrawalDto extends WithdrawalIdDto {
  @IsUUID()
  adminId!: string;
}

export class RejectWithdrawalDto extends CompleteWithdrawalDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

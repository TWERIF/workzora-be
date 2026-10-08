import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { TicketStatus } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  locale?: string;
}

export class TicketListDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class TicketIdDto {
  @IsUUID()
  id!: string;
}

export class UserTicketDto extends TicketIdDto {
  @IsUUID()
  userId!: string;
}

export class UserIdDto {
  @IsUUID()
  userId!: string;
}

export class AdminReplyDto extends TicketIdDto {
  @IsUUID()
  adminId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}

export class UserReplyDto extends UserTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}

export class CloseTicketDto extends TicketIdDto {
  @IsUUID()
  adminId!: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message!: string;
}

export class TicketMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}

export class TicketsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['open', 'closed'] })
  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: 'open' | 'closed';
}

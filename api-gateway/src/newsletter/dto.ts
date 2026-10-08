import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class SubscribeDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiPropertyOptional({ enum: ['en', 'uk'] })
  @IsOptional()
  @IsIn(['en', 'uk'])
  locale?: 'en' | 'uk';
}

export class UnsubscribeDto {
  @ApiProperty()
  @IsUUID()
  token!: string;
}

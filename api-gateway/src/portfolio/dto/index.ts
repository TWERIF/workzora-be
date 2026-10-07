import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({ description: 'Up to 5 tags separated by commas' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tags?: string;
}

export class UpdatePortfolioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ description: 'Up to 5 tags separated by commas' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tags?: string;
}

export const parseTags = (value?: string) =>
  value === undefined
    ? undefined
    : [...new Set(value.split(',').map((tag) => tag.trim().replace(/^#/, '')).filter(Boolean))].slice(0, 5);

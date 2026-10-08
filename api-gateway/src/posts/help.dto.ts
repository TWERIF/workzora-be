import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../common/pagination.dto';

export const HELP_CATEGORIES = [
  'getting-started',
  'for-clients',
  'for-freelancers',
  'payments-escrow',
  'projects-proposals',
  'account-settings',
  'safety-arbitration',
  'technical-support',
] as const;

const LOCALES = ['en', 'uk'] as const;

export class HelpLocaleQueryDto {
  @ApiPropertyOptional({ enum: LOCALES, default: 'en' })
  @IsOptional()
  @IsIn(LOCALES)
  locale: string = 'en';
}

export class HelpListQueryDto extends HelpLocaleQueryDto {
  @ApiPropertyOptional({ enum: HELP_CATEGORIES })
  @IsOptional()
  @IsIn(HELP_CATEGORIES)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class HelpFeedbackDto {
  @ApiProperty({ enum: ['yes', 'maybe', 'no'] })
  @IsIn(['yes', 'maybe', 'no'])
  reaction!: string;
}

export class HelpAdminQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: HELP_CATEGORIES })
  @IsOptional()
  @IsIn(HELP_CATEGORIES)
  category?: string;

  @ApiPropertyOptional({ enum: LOCALES })
  @IsOptional()
  @IsIn(LOCALES)
  locale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class HelpArticleDto {
  @ApiProperty({ enum: HELP_CATEGORIES })
  @IsIn(HELP_CATEGORIES)
  category!: string;

  @ApiProperty({ enum: LOCALES })
  @IsIn(LOCALES)
  locale!: string;

  @ApiProperty({ description: 'Latin letters, digits and dashes; the same slug links translations' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  @MaxLength(120)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(400)
  summary!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  position!: number;
}

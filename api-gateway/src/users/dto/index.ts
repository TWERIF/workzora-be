import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export const WORK_TYPES = ['FULLTIME', 'PARTTIME', 'FLEXIBLE'] as const;
export const BUDGET_TYPES = ['HOURLY', 'FIXED'] as const;
export const PROJECT_SIZES = ['SMALL', 'MEDIUM', 'LARGE'] as const;
export const AVAILABILITY = ['AVAILABLE', 'OPENTOOFFERS', 'BUSY', 'NOTAVAILABLE'] as const;
export const RATE_TYPES = ['STANDARD', 'FROM'] as const;
export const PROJECT_TYPES = ['ONE_TIME', 'ONGOING', 'LONG_TERM', 'CONSULTATIONS'] as const;
export const BUDGET_RANGES = ['UNDER_500', 'FROM_500_TO_1000', 'FROM_1000_TO_3000', 'OVER_3000'] as const;
export const WORK_FORMATS = ['REMOTE', 'PARTTIME', 'FULLTIME', 'FLEXIBLE'] as const;

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  reserveEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  position?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  skills?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Up to 5 category or specialization ids' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUUID('4', { each: true })
  specializations?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100000)
  rate?: number;

  @ApiPropertyOptional({ enum: WORK_TYPES })
  @IsOptional()
  @IsIn(WORK_TYPES)
  workType?: string;

  @ApiPropertyOptional({ enum: AVAILABILITY })
  @IsOptional()
  @IsIn(AVAILABILITY)
  availability?: string;

  @ApiPropertyOptional({ enum: BUDGET_TYPES })
  @IsOptional()
  @IsIn(BUDGET_TYPES)
  preferredBudgetType?: string;

  @ApiPropertyOptional({ enum: PROJECT_SIZES })
  @IsOptional()
  @IsIn(PROJECT_SIZES)
  preferredProjectSize?: string;

  @ApiPropertyOptional({ enum: RATE_TYPES })
  @IsOptional()
  @IsIn(RATE_TYPES)
  rateType?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  rateNote?: string;

  @ApiPropertyOptional({ enum: PROJECT_TYPES })
  @IsOptional()
  @IsIn(PROJECT_TYPES)
  projectType?: string;

  @ApiPropertyOptional({ enum: BUDGET_RANGES })
  @IsOptional()
  @IsIn(BUDGET_RANGES)
  budgetRange?: string;

  @ApiPropertyOptional({ enum: WORK_FORMATS })
  @IsOptional()
  @IsIn(WORK_FORMATS)
  workFormat?: string;

  @ApiPropertyOptional({ enum: ['client', 'freelancer'], description: 'Only once, right after sign-up' })
  @IsOptional()
  @IsIn(['client', 'freelancer'])
  role?: string;
}

export class ProfilesPreviewQueryDto {
  @ApiPropertyOptional({ enum: ['client', 'freelancer'] })
  @IsOptional()
  @IsIn(['client', 'freelancer'])
  role?: string;

  @ApiPropertyOptional({ default: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  amount?: number;
}

export class FreelancersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Category id' })
  @IsOptional()
  @IsUUID('4')
  category?: string;

  @ApiPropertyOptional({ description: 'Comma separated specialization ids' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.split(',').filter(Boolean) : value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  specializations?: string[];
}

export class TopClientsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Comma separated star ratings, for example 4,5' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean).map(Number) : value,
  )
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(5, { each: true })
  ratings?: number[];
}

export class ClientProjectsQueryDto extends PaginationQueryDto {
  @ApiProperty({ enum: ['active', 'completed'] })
  @IsIn(['active', 'completed'])
  status!: 'active' | 'completed';
}

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

const PROJECT_STATUSES = ['open', 'awaiting_payment', 'in_progress', 'completed', 'closed'] as const;

const splitList = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value;

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(20000)
  description!: string;

  @ApiProperty({ type: [String], description: '1 to 3 category ids' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsUUID('all', { each: true })
  categories!: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiProperty({ description: 'USD' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(20000)
  price!: number;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class AwaitingPaymentDto {
  @ApiProperty()
  @IsUUID()
  freelancerId!: string;
}

export class MyProjectsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: PROJECT_STATUSES })
  @IsOptional()
  @IsIn(PROJECT_STATUSES)
  status?: string;
}

export class SearchQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  searchTerm?: string;
}

export class FindProjectsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ description: 'Comma separated category ids' })
  @IsOptional()
  @Transform(splitList)
  @IsArray()
  @IsUUID('all', { each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Comma separated tags' })
  @IsOptional()
  @Transform(splitList)
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}

export class AdminProjectsQueryDto extends FindProjectsQueryDto {
  @ApiPropertyOptional({ enum: PROJECT_STATUSES })
  @IsOptional()
  @IsIn(PROJECT_STATUSES)
  status?: string;
}

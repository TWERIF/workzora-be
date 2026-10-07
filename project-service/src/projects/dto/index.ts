import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class IdDto {
  @IsUUID()
  id!: string;
}

export class IdsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  ids!: string[];
}

export class UserIdDto {
  @IsUUID()
  userId!: string;
}

export class UserPairDto extends UserIdDto {
  @IsUUID()
  otherId!: string;
}

export class StatsRangeDto {
  @IsISO8601()
  from!: string;

  @IsISO8601()
  to!: string;
}

export class PaginationDto {
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
  limit: number = 10;
}

export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(20000)
  description!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsUUID('all', { each: true })
  categories!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsUUID()
  clientId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price!: number;
}

export class UpdateProjectDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsUUID('all', { each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price?: number;
}

export class FindProjectsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}

export class AdminProjectsDto extends FindProjectsDto {
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

export class MyProjectsDto extends PaginationDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsIn(['deals'])
  group?: 'deals';
}

export class AwaitingPaymentDto extends IdDto {
  @IsUUID()
  freelancerId!: string;

  @IsUUID()
  clientId!: string;
}

export class CompleteProjectDto extends IdDto {
  @IsUUID()
  clientId!: string;
}

export class PaymentsListDto extends PaginationDto {
  @IsUUID()
  id!: string;

  @IsString()
  role!: string;
}

export class ClientProjectsDto {
  @IsUUID()
  clientId!: string;

  @IsIn(['active', 'completed'])
  status!: 'active' | 'completed';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}

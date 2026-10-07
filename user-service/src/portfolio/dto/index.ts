import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, IsUrl, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreatePortfolioDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsUrl({ protocols: ['https'], require_protocol: true })
  imageUrl!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];
}

export class UpdatePortfolioDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];
}

export class PortfolioIdDto {
  @IsUUID()
  id!: string;
}

export class DeletePortfolioDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;
}

export class UserIdDto {
  @IsUUID()
  userId!: string;
}

export class UserIdsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  userIds!: string[];
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

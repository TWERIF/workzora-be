import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class IdDto {
  @IsUUID()
  id!: string;
}

export class DeleteBidDto extends IdDto {
  @IsUUID()
  userId!: string;
}

export class WonBidDto extends IdDto {
  @IsUUID()
  freelancerId!: string;
}

export class ProjectIdsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  ids!: string[];
}

export class CreateBidDto {
  @IsUUID()
  projectId!: string;

  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  time!: number;
}

export class UpdateBidDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  time?: number;
}

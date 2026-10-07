import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  projectId!: string;

  @IsString()
  @MaxLength(200)
  projectTitle!: string;

  @IsUUID()
  authorId!: string;

  @IsIn(['client', 'freelancer'])
  authorRole!: string;

  @IsUUID()
  targetId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  quality!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  professionalism!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  communication!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  deadlines?: number;

  @IsString()
  @MaxLength(1000)
  text!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  privateFeedback?: string;
}

export class FindByTargetDto {
  @IsUUID()
  targetId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class FindMineDto {
  @IsUUID()
  projectId!: string;

  @IsUUID()
  authorId!: string;
}

export class RespondReviewDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text!: string;
}

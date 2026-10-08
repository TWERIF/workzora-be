import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

const SCORE_MIN = 1;
const SCORE_MAX = 5;

export class CreateReviewDto {
  @ApiProperty()
  @IsUUID()
  projectId!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  quality!: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  professionalism!: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  communication!: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  price!: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(SCORE_MIN)
  @Max(SCORE_MAX)
  @IsOptional()
  deadlines?: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  privateFeedback?: string;
}

export class ReviewsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 5;
}

export class ReviewResponseDto {
  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text!: string;
}

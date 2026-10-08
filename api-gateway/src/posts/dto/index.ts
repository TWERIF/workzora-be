import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUrl, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export const POST_TAGS = ['freelance', 'marketing', 'ai', 'telegram', 'case-studies'] as const;

export class PostsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  @ApiPropertyOptional({ enum: POST_TAGS })
  @IsOptional()
  @IsIn(POST_TAGS)
  tag?: string;

  @ApiPropertyOptional({ description: 'Article id to leave out, for example the featured one' })
  @IsOptional()
  @IsUUID()
  exclude?: string;
}

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty({ enum: POST_TAGS })
  @IsIn(POST_TAGS)
  tag!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  teaser!: string;

  @ApiProperty({ description: 'HTML' })
  @IsString()
  @MinLength(1)
  @MaxLength(200000)
  article!: string;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({ description: 'Keep the current cover' })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  imageUrl?: string;
}

export class SearchPostsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  searchTerm?: string;
}

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(72)
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

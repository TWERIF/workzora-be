import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description!: string;

  @ApiPropertyOptional({ description: 'Top-level category this specialization belongs to' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class SearchCategoriesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

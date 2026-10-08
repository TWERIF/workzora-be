import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class IdDto {
  @IsUUID()
  id!: string;
}

export class CreateCategoriesDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCategoriesDto extends IdDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}

export class CategoriesPageDto {
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

export class SearchCategoriesDto extends CategoriesPageDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search: string = '';
}

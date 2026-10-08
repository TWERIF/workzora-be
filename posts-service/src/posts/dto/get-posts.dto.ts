import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { POST_TAGS } from '../tags';

export class GetPostsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit = 10;

    @IsOptional()
    @IsIn(POST_TAGS)
    tag?: string;

    @IsOptional()
    @IsUUID()
    exclude?: string;
}

export class PostIdDto {
    @IsUUID()
    id!: string;
}

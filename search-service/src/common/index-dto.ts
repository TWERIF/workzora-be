import { IsOptional, IsString, IsUUID } from 'class-validator';

export class IndexIdDto {
    @IsUUID()
    id!: string;
}

export class IndexProjectDto extends IndexIdDto {
    @IsString()
    title!: string;

    @IsString()
    description!: string;
}

export class IndexPostDto extends IndexIdDto {
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    teaser?: string;

    @IsOptional()
    @IsString()
    tag?: string;
}

export class SearchTermDto {
    @IsString()
    searchTerm!: string;
}

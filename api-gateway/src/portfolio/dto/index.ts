import {
    IsOptional,
    IsString
} from 'class-validator';

export class CreatePortfolioDto {
    @IsString()
    title!: string;

    @IsString()
    description!: string;
}

export class UpdatePortfolioDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    imageUrl?: string;
}
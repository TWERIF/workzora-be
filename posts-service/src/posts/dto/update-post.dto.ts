import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength
} from 'class-validator';

export class UpdatePostDto {
    @IsUUID()
    id!: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(255)
    title!: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(72)
    tag!: string;

    @IsString()
    @IsOptional()
    imageUrl!: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(500)
    teaser!: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    article!: string;
}
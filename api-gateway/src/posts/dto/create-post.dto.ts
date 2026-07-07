import {
    IsNotEmpty,
    IsString,
    IsUrl,
    MaxLength
} from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(72)
    tag!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    teaser!: string;

    @IsString()
    @IsNotEmpty()
    article!: string;
}
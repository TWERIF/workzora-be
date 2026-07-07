import {
    IsNotEmpty,
    IsString,
    IsUUID,
    MaxLength
} from 'class-validator';

export class CreatePostDto {
    @IsUUID()
    userId!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(72)
    tag!: string;

    @IsString()
    imageUrl!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    teaser!: string;

    @IsString()
    @IsNotEmpty()
    article!: string;
}
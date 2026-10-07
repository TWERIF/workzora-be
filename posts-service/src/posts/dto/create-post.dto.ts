import { POST_TAGS } from '../tags';
import {
    IsIn,
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

    @IsIn(POST_TAGS)
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
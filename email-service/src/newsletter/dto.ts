import { IsEmail, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { EMAIL_LOCALES, type EmailLocale } from '../types';

export class SubscribeDto {
    @IsEmail()
    @MaxLength(254)
    email!: string;

    @IsOptional()
    @IsIn(EMAIL_LOCALES)
    locale?: EmailLocale;
}

export class UnsubscribeDto {
    @IsUUID()
    token!: string;
}

export class PostPublishedDto {
    @IsString()
    title!: string;

    @IsString()
    slug!: string;

    @IsString()
    teaser!: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

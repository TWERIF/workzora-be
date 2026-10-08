import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';

export class Participant {
    @IsString()
    @MaxLength(200)
    name!: string;

    @IsEmail()
    email!: string;
}

export class EmailData {
    @IsString()
    html!: string;

    @IsString()
    @MaxLength(300)
    subject!: string;

    @ValidateNested()
    @Type(() => Participant)
    from!: Participant;

    @ValidateNested()
    @Type(() => Participant)
    to!: Participant;
}

export const CODE_EMAIL_KINDS = ['password-reset', 'email-confirm'] as const;
export type CodeEmailKind = (typeof CODE_EMAIL_KINDS)[number];

export const EMAIL_LOCALES = ['en', 'uk'] as const;
export type EmailLocale = (typeof EMAIL_LOCALES)[number];

export class CodeEmailDto {
    @IsIn(CODE_EMAIL_KINDS)
    kind!: CodeEmailKind;

    @IsEmail()
    to!: string;

    @Matches(/^\d{5,6}$/)
    code!: string;

    @IsOptional()
    @IsIn(EMAIL_LOCALES)
    locale?: EmailLocale;
}

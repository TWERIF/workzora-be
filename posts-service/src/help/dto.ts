import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export const HELP_CATEGORIES = [
    'getting-started',
    'for-clients',
    'for-freelancers',
    'payments-escrow',
    'projects-proposals',
    'account-settings',
    'safety-arbitration',
    'technical-support',
] as const;

export const HELP_LOCALES = ['en', 'uk'] as const;
export const HELP_REACTIONS = ['yes', 'maybe', 'no'] as const;

export class LocaleDto {
    @IsIn(HELP_LOCALES)
    locale!: string;
}

export class HelpListDto extends LocaleDto {
    @IsOptional()
    @IsIn(HELP_CATEGORIES)
    category?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;
}

export class HelpSlugDto extends LocaleDto {
    @IsIn(HELP_CATEGORIES)
    category!: string;

    @IsString()
    @MaxLength(120)
    slug!: string;
}

export class HelpFeedbackDto {
    @IsUUID()
    id!: string;

    @IsIn(HELP_REACTIONS)
    reaction!: string;
}

export class HelpAdminListDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit = 20;

    @IsOptional()
    @IsIn(HELP_CATEGORIES)
    category?: string;

    @IsOptional()
    @IsIn(HELP_LOCALES)
    locale?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;
}

export class HelpArticleDto {
    @IsIn(HELP_CATEGORIES)
    category!: string;

    @IsIn(HELP_LOCALES)
    locale!: string;

    @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    @MaxLength(120)
    slug!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(200)
    title!: string;

    @IsString()
    @MaxLength(400)
    summary!: string;

    @IsString()
    @MinLength(1)
    body!: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(1000)
    position!: number;
}

export class HelpUpdateDto extends HelpArticleDto {
    @IsUUID()
    id!: string;
}

export class HelpIdDto {
    @IsUUID()
    id!: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const LOCALES = ['en', 'uk'];

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'At least 8 characters with a letter and a digit' })
  @IsString()
  @Matches(PASSWORD_RULE, { message: 'Password must be at least 8 characters and contain a letter and a digit' })
  password!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  username!: string;

  @ApiPropertyOptional({ enum: ['client', 'freelancer'] })
  @IsOptional()
  @IsIn(['client', 'freelancer'])
  role?: 'client' | 'freelancer';

  @ApiPropertyOptional({ enum: LOCALES })
  @IsOptional()
  @IsIn(LOCALES)
  locale?: string;
}

export class GoogleCallbackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class EmailDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class VerifyEmailDto extends EmailDto {
  @ApiProperty({ example: 12345 })
  @Type(() => Number)
  @IsInt()
  @Min(10000)
  @Max(99999)
  code!: number;
}

export class ForgotPasswordDto extends EmailDto {
  @ApiPropertyOptional({ enum: LOCALES })
  @IsOptional()
  @IsIn(LOCALES)
  locale?: string;
}

export class ResetPasswordDto extends EmailDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_RULE, { message: 'Password must be at least 8 characters and contain a letter and a digit' })
  password!: string;
}

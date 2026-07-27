import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  username!: string;

  @IsBoolean()
  isActive!: boolean;

  @IsString()
  @IsOptional()
  role?: string;
}
export class FindByEmailDto {
  @IsEmail()
  email!: string;
}
export class ConfirmEmailDto extends FindByEmailDto {
  @IsNumber()
  code!: number;
}

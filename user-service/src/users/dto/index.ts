import { IsBoolean, IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsBoolean()
  isActive!: boolean;
}
export class FindByEmailDto {
  @IsEmail()
  email!: string;
}
export class ConfirmEmailDto extends FindByEmailDto {
  @IsNumber()
  code!: number;
}

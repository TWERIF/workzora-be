import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  role!: string;
}

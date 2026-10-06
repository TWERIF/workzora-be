import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LoginDto {
  @IsUUID()
  id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  role!: string;
}

export class GoogleVerifyDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

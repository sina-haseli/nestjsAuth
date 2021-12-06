import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthenticationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

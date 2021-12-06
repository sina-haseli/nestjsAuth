import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUser {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  avatar: string;
}

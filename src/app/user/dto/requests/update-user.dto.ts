import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  firstName: string;

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  lastName: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  avatar: string;
}

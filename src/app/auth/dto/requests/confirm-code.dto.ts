import { IsNumberString, IsString, Length } from 'class-validator';
import { IsPhoneNumber } from '../../decorator/phone-number.decorator';

export class ConfirmCodeDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  @IsNumberString()
  @Length(5, 5)
  smsCode: string;
}

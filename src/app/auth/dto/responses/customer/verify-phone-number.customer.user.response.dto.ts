import { User } from '../../../../user/entities/user.entity';
import UserResponse from './base.customer.user.response.dto';

export default class VerifyPhoneNumberCustomerUserResponseDto {
  constructor(data: { accessToken: string; userFull: User }) {
    this.accessToken = data.accessToken;
    this.user = data.userFull ? new UserResponse(data.userFull) : null;
  }
  accessToken: string;
  user: UserResponse;
}

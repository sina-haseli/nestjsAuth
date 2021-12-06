import { User } from '../../../../user/entities/user.entity';

export default class BaseCustomerUserResponseDto {
  constructor(data: User) {
    this.id = data.id;
    this.avatar = data.avatar;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.fullName =
      this.firstName || this.lastName
        ? this.firstName + ' ' + this.lastName
        : null;
  }

  id: number;
  avatar: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

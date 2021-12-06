import { User } from '../../entities/user.entity';

export default class UserAdminResponseDto {
  constructor(data: User) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.avatar = data.avatar;
    this.email = data.email;
    this.last_login = data.last_login;
  }

  id: number;
  file: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar: string;
  email: string;
  last_login: Date;
}

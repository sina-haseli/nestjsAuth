import { User } from '../../entities/user.entity';

export default class UserAdminResponseDto {
  constructor(data: User) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.avatar = data.avatar;
    this.email = data.email;
    this.is_verified = data.is_verified;
  }

  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  is_verified: boolean;
}

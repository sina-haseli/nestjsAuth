import { User } from '../../../../user/entities/user.entity';
import PermissionUserAuthResponseDto from './authentication-user-login.customer.user.response.dto';

export default class BaseCustomerUserResponseDto {
  constructor(data: User) {
    this.id = data.id;
    this.phoneNumber = data.phoneNumber;
    this.avatar = data.avatar;
    const permissions = data.role.permissions
      ? data.role.permissions.map(
          (item) => new PermissionUserAuthResponseDto(item),
        )
      : [];
    this.permissions = permissions.map((item) => item.code);
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.fullName =
      this.firstName || this.lastName
        ? this.firstName + ' ' + this.lastName
        : null;
  }

  id: number;
  phoneNumber: string;
  avatar: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: any[];
}

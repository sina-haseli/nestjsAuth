import { Role } from '../../entities/role.entity';
import { User } from '../../../user/entities/user.entity';
import PermissionResponseDto from './permission.response.dto';

export default class RoleResponseDto {
  constructor(data: Role) {
    this.id = data.id;
    this.title = data.title;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.permissions = data.permissions
      ? data.permissions.map((m) => new PermissionResponseDto(m))
      : [];
  }
  id: number;
  createdBy: User;
  createdAt: Date;
  title: string;
  permissions: PermissionResponseDto[];
}

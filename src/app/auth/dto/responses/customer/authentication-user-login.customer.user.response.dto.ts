import { Permission } from '../../../entities/permission.entity';

export default class PermissionUserAuthResponseDto {
  constructor(data: Permission) {
    this.code = data.code;
  }
  code: string;
}

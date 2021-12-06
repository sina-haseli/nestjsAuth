import { Permission } from '../../entities/permission.entity';

export default class PermissionResponseDto {
  constructor(data: Permission) {
    this.id = data.id;
    this.title = data.title;
    this.code = data.code;
  }
  id: number;
  title: string;
  code: string;
}

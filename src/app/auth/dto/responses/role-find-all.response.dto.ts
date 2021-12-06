import { Role } from '../../entities/role.entity';

export default class RoleFindAllResponseDto {
  constructor(data: Role) {
    this.id = data.id;
    this.title = data.title;
  }
  id: number;
  title: string;
}

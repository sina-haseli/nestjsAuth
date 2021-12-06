import { BusinessService } from '../../base/business.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleRequestDto } from '../dto/requests/create.role.request.dto';
import { User } from '../../user/entities/user.entity';
import { PermissionService } from './permission.service';
import { UpdateRoleRequestDto } from '../dto/requests/update.role.request.dto';
import CommonDeleteResponseDto from '../../common/dto/common-delete.response.dto';
import { PaginationRole } from '../dto/responses/pagination-role.response.dto';

@Injectable()
export class RoleService extends BusinessService<Role> {
  constructor(private roleRepository: RoleRepository, private permissionService: PermissionService) {
    super(roleRepository);
  }
  async getAll(paginate: PaginationRole) {
    return this.roleRepository.getAll(paginate);
  }
  async create(createRoleRequestDto: CreateRoleRequestDto, user: User) {
    const { title, permissionIds } = createRoleRequestDto;
    const permissions = permissionIds
      ? await Promise.all(permissionIds?.map((id) => this.permissionService.assertOrFail(id)))
      : undefined;
    const role = new Role({
      permissions: permissions,
      title: title,
    });

    return this.save(role, user);
  }

  async update(id: number, updateRoleRequestDto: UpdateRoleRequestDto) {
    const { title, permissionIds } = updateRoleRequestDto;
    await this.assertOrFail(id);
    const permissions = permissionIds
      ? await Promise.all(permissionIds.map((id) => this.permissionService.assertOrFail(id)))
      : undefined;

    const role = new Role({ id, title, permissions });
    return this.roleRepository.save(role);
  }

  async deleteByAdmin(id: number, user: User) {
    const result = await this.roleRepository.findOne({ id });
    if (result.title === 'admin') {
      throw new ForbiddenException();
    }
    await this.assertOrFail(id);
    await this.softDelete(this.roleRepository, id, user);
    return new CommonDeleteResponseDto({ isDeleted: true });
  }
}

import { EntityRepository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { BusinessRepository } from '../../base/business.repository';
import { PaginationRole } from '../dto/responses/pagination-role.response.dto';
import { paginate } from '../../common/functions/paginate';
import RoleFindAllResponseDto from '../dto/responses/role-find-all.response.dto';

@EntityRepository(Role)
export class RoleRepository extends BusinessRepository<Role> {
  async getAll(pagination: PaginationRole) {
    const { isDesc, page, pageSize, search, sortBy } = pagination;
    const query = this.createQueryBuilder('role').leftJoinAndSelect('role.permissions', 'permissions');
    if (search) {
      query.andWhere('role.title LIKE :search', { search: `%${search}%` });
    }
    return paginate(
      query,
      { pageSize, page },
      {
        isDesc: isDesc,
        sortBy: sortBy ? `role.${sortBy}` : 'role.createdAt',
      },
      RoleFindAllResponseDto,
    );
  }
}

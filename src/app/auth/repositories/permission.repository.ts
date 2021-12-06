import { EntityRepository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { BusinessRepository } from '../../base/business.repository';

@EntityRepository(Permission)
export class PermissionRepository extends BusinessRepository<Permission> {}

import { BusinessService } from '../../base/business.service';
import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionService extends BusinessService<Permission> {
  constructor(private permissionRepository: PermissionRepository) {
    super(permissionRepository);
  }
}

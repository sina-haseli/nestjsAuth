import { BusinessController } from '../../common/decorator/business-controller.decorator';
import { Get, Param, ParseIntPipe } from '@nestjs/common';
import PermissionResponseDto from '../dto/responses/permission.response.dto';
import { PermissionService } from '../services/permission.service';

@BusinessController('/permissions', 'Permission (Admin)')
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get()
  async findAll() {
    const result = await this.permissionService.findAll();
    return result.map((item) => new PermissionResponseDto(item));
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.permissionService.findOne(id);
  }
}

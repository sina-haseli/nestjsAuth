import { BusinessController } from '../../common/decorator/business-controller.decorator';
import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { CreateRoleRequestDto } from '../dto/requests/create.role.request.dto';
import { Auth } from '../decorator/auth.decorator';
import { PermissionEnum } from '../plugins/create-default-permissions';
import CommonUpdateResponseDto from '../../common/dto/common-update.response.dto';
import { UpdateRoleRequestDto } from '../dto/requests/update.role.request.dto';
import { PaginationRole } from '../dto/responses/pagination-role.response.dto';
import { GetUser } from '../decorator/get-user.decorator';
import { User } from '../../user/entities/user.entity';

@BusinessController('/admin/roles', 'Role (Admin)')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  @Auth(PermissionEnum.ROLE_POST_CREATE)
  async create(@Body() createRoleRequestDto: CreateRoleRequestDto) {
    return this.roleService.create(createRoleRequestDto, null);
  }

  @Get()
  @Auth(PermissionEnum.ROLE_GET_ALL)
  async findAll(@Query() paginate: PaginationRole) {
    return this.roleService.getAll(paginate);
  }

  @Get('/:id')
  @Auth(PermissionEnum.ROLE_GET_ONE)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.roleService.findOne(id, 'permissions');
  }

  @Patch('/:id')
  @Auth(PermissionEnum.ROLE_UPDATE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleRequestDto: UpdateRoleRequestDto,
  ) {
    await this.roleService.update(id, updateRoleRequestDto);
    return new CommonUpdateResponseDto({ isUpdated: true });
  }

  @Delete('/:id')
  @Auth(PermissionEnum.ROLE_DELETE)
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return await this.roleService.deleteByAdmin(id, user);
  }
}

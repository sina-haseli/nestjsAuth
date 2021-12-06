import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BusinessController } from '../../common/decorator/business-controller.decorator';
import CommonUpdateResponseDto from '../../common/dto/common-update.response.dto';
import { CreateUser } from '../dto/requests/create-user.dto';
import { UpdateUserDto } from '../dto/requests/update-user.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { GetUser } from '../../auth/decorator/get-user.decorator';

@BusinessController('/admin/users', 'Admin Users (Admin)')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  async create(@Body() createUserDto: CreateUser, @GetUser() user: User) {
    return await this.userService.save(createUserDto, user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    await this.userService.updateById(id, updateUserDto, user);
    return new CommonUpdateResponseDto({ isUpdated: true });
  }

  @Get(':id')
  async findOneUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getOneOrFail(id);
  }

  @Delete(':id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return await this.userService.deleteByAdmin(id, user);
  }
}

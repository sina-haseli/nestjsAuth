import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsArrayId } from '../../../common/decorator/validator/is-array-id.decorator';

export class UpdateRoleRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title: string;

  @IsArrayId()
  @IsNotEmpty()
  @IsOptional()
  permissionIds: number[];
}

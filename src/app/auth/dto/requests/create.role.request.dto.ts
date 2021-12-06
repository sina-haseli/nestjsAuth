import { IsNotEmpty, IsString } from 'class-validator';
import { IsArrayId } from '../../../common/decorator/validator/is-array-id.decorator';

export class CreateRoleRequestDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsArrayId()
  @IsNotEmpty()
  permissionIds: number[];
}

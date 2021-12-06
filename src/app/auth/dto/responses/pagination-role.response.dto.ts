import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { CommonPaginationRequestDto } from '../../../common/dto/common.pagination.request.dto';
import { Transform } from 'class-transformer';
import { rolePropertiesEnum } from '../../enum/role-properties.enum';

export class PaginationRole extends CommonPaginationRequestDto {
  @IsOptional()
  @IsEnum(rolePropertiesEnum)
  sortBy?: rolePropertiesEnum;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  isDesc?: boolean = true;
}

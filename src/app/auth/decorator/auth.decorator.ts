// import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from '../role.guard';
// import { ApiBearerAuth } from '@nestjs/swagger';
// import { PermissionEnum } from '../plugins/create-default-permissions';
//
// export const Auth = (permission: PermissionEnum = null) => {
//   return applyDecorators(ApiBearerAuth(), SetMetadata('permission', permission), UseGuards(AuthGuard(), RolesGuard));
// };

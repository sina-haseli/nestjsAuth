// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
//
// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}
//
//   // canActivate(context: ExecutionContext): boolean {
//   //   const permission: PermissionEnum = this.reflector.get<PermissionEnum>(
//   //     'permission',
//   //     context.getHandler(),
//   //   );
//   //   if (!permission) {
//   //     return true;
//   //   }
//   //   const request = context.switchToHttp().getRequest();
//   //   const userPermissions = request.user.role.permissions.map((item) =>
//   //     item.code.toString(),
//   //   );
//   //   if (!userPermissions.includes(permission)) {
//   //     throw new ForbiddenException();
//   //   }
//   //   return true;
//   // }
// }

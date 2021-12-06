import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { jwtSecret } from '../../config/jwt-secret';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../user/repositories/user.repository';
import { AuthService } from './services/auth.service';
import { PermissionService } from './services/permission.service';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { RoleController } from './controllers/role.controller';
import { RoleService } from './services/role.service';
import { ForgotPassword } from './entities/forgottenpassword.entity';
import { EmailVerification } from './entities/emailverification.entity';
import { LocalStrategy } from './jwt-local.strategy';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionRepository, RoleRepository]),
    TypeOrmModule.forFeature([ForgotPassword]),
    TypeOrmModule.forFeature([EmailVerification]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: {
        expiresIn: '120d',
      },
    }),
    TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [AuthController, RoleController],
  providers: [
    JwtStrategy,
    AuthService,
    PermissionService,
    RoleService,
    LocalStrategy,
    GoogleStrategy,
  ],
  exports: [
    JwtStrategy,
    PassportModule,
    AuthService,
    RoleService,
    LocalStrategy,
  ],
})
export class AuthModule {}

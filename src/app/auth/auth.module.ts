import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { jwtSecret } from '../../config/jwt-secret';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../user/repositories/user.repository';
import { AuthService } from './services/auth.service';
import { ForgotPassword } from './entities/forgottenpassword.entity';
import { EmailVerification } from './entities/emailverification.entity';
import { LocalStrategy } from './jwt-local.strategy';
import { GoogleStrategy } from './google.strategy';
import { UserModule } from '../user/user.module';
import { TwoFactorAuthenticationController } from './controllers/twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './services/twoFactorAuthentication.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ForgotPassword, EmailVerification]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: {
        expiresIn: '120d',
      },
    }),
    TypeOrmModule.forFeature([UserRepository]),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController, TwoFactorAuthenticationController],
  providers: [
    JwtStrategy,
    AuthService,
    LocalStrategy,
    GoogleStrategy,
    TwoFactorAuthenticationService,
  ],
  exports: [
    JwtStrategy,
    PassportModule,
    AuthService,
    LocalStrategy,
    TwoFactorAuthenticationService,
  ],
})
export class AuthModule {}

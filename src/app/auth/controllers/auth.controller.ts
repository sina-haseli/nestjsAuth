import {
  Body,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { User } from '../../user/entities/user.entity';
import { BusinessController } from '../../common/decorator/business-controller.decorator';
import { ResponseCode } from '../../common/interfaces/responsecode.interface';
import { ResponseError, ResponseSuccess } from '../../common/dto/response.dto';
import { UserService } from '../../user/services/user.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUser } from '../../user/dto/requests/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ManagementClient } from 'auth0';

@BusinessController('/auth', 'Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UserService,
  ) {}

  // @HttpCode(200)
  // @Post('/authentication-user')
  // async authUser(@Body() authenticationDto: AuthenticationDto) {
  //   await this.authService.authUserByEmail(authenticationDto);
  //   return new LoginNumberResponse();
  // }
  //
  // @Get('/who-am-i')
  // async whoAmI(@GetUser() user: User) {
  //   const result = await this.authService.whoAmI(user);
  //   return new BaseCustomerUserResponseDto(result);
  // }

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    return req.user;
  }

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  @Get('secret')
  @UseGuards(AuthGuard('jwt')) // 2
  secretEndpoint(@Req() req): string {
    return 'this endpoint should be protected';
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt')) // 2
  async profile(@Req() req): Promise<any> {
    const authZero = new ManagementClient({
      // 3
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      scope: 'read:users update:users',
    });

    const response = await authZero
      .getUser({ id: req.user.sub }) // 4
      .then((user: User) => {
        return user;
      })
      .catch((err) => {
        return err;
      });

    return response;
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req) {
    const user = await this.usersService.findById(req.user.id);
    user.updated_time = new Date();
    await this.usersService.save(user);
    const data = await this.authService.login(req.user);
    return new ResponseSuccess(ResponseCode.RESULT_SUCCESS, data);
  }

  @UsePipes(new ValidationPipe())
  @Post('register')
  async register(@Body() userData: CreateUser) {
    const entity = Object.assign(new User(), userData);

    // check user exist
    const isUserExists = await this.usersService.checkUserExists(entity.email);
    if (isUserExists) {
      return new ResponseError(
        ResponseCode.RESULT_USER_EXISTS,
        'This user is exists',
      );
    }

    // create a new user
    try {
      const user = await this.usersService.create(entity);
      const token = await this.authService.createEmailToken(user.email);
      const sent = await this.authService.sendVerifyEmail(user.email, token);

      if (sent) {
        return new ResponseSuccess(ResponseCode.RESULT_SUCCESS);
      } else {
        return new ResponseError(ResponseCode.RESULT_FAIL, 'Email not sent');
      }
    } catch (error) {
      return new ResponseError(ResponseCode.RESULT_FAIL, 'Register failure');
    }
  }

  @Get('email/verify/:token')
  async verifyEmail(@Param('token') token: number) {
    try {
      const isEmailVerified = await this.authService.verifyEmail(token);
      return new ResponseSuccess(ResponseCode.RESULT_SUCCESS, isEmailVerified);
    } catch (error) {
      return new ResponseSuccess(ResponseCode.RESULT_FAIL, error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('email/resend-verification')
  async sendEmailVerification(@Req() req) {
    try {
      const user = await this.usersService.findById(req.user.id);
      const token = await this.authService.recreateEmailToken(user);
      if (token < 0) {
        return new ResponseError(
          ResponseCode.RESULT_FAIL,
          'Email has not been sent',
        );
      }

      const isEmailSent = await this.authService.sendVerifyEmail(
        user.email,
        token,
      );
      if (isEmailSent) {
        return new ResponseSuccess(ResponseCode.RESULT_SUCCESS, null);
      } else {
        return new ResponseError(
          ResponseCode.RESULT_FAIL,
          'Email has not been sent',
        );
      }
    } catch (error) {
      return new ResponseError(
        ResponseCode.RESULT_FAIL,
        'Error when sending email',
      );
    }
  }

  @Get('email/forgot-password/:email')
  async sendEmailForgotPassword(@Param('email') email: string) {
    try {
      const isEmailSent = await this.authService.sendEmailForgotPassword(email);
      if (isEmailSent) {
        return new ResponseSuccess(ResponseCode.RESULT_SUCCESS, null);
      } else {
        return new ResponseError(
          ResponseCode.RESULT_FAIL,
          'Email has not been sent',
        );
      }
    } catch (error) {
      return new ResponseError(
        ResponseCode.RESULT_FAIL,
        'Error when sending email',
      );
    }
  }

  @Get('email/reset-password/:token')
  async resetPasswordFromToken(@Param('token') token) {
    try {
      const user = await this.authService.checkVerificationCode(token);
      const randomPassword = await this.authService.generateRandomPassword();
      // change password
      user.password = bcrypt.hashSync(
        randomPassword,
        bcrypt.genSaltSync(8),
        null,
      );
      await this.usersService.update(user);
      // send email the new password
      const isEmailSent = await this.authService.emailResetedPassword(
        user.email,
        randomPassword,
      );
      if (isEmailSent) {
        return new ResponseSuccess(ResponseCode.RESULT_SUCCESS, null);
      } else {
        return new ResponseError(
          ResponseCode.RESULT_FAIL,
          'Email has not been sent',
        );
      }
    } catch (error) {
      return new ResponseError(
        ResponseCode.RESULT_FAIL,
        'Unexpected error happen',
      );
    }
  }
}

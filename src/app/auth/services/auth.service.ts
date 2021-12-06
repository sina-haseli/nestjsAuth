// import {
//   HttpException,
//   HttpStatus,
//   Inject,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import * as bcrypt from 'bcryptjs';
// import { UserRepository } from '../../user/repositories/user.repository';
// import { AuthenticationDto } from '../dto/requests/authentication.dto';
// import { JwtService } from '@nestjs/jwt';
// import { User } from '../../user/entities/user.entity';
// import { BusinessService } from '../../base/business.service';
// import { ConsentRegistry } from '../consentregistry.interface';
// import { ForgottenPassword } from '../forgottenpassword.interface';
// import { EmailVerificationInterface } from '../emailVerification.interface';
// import { CreateUser } from '../../user/dto/requests/create-user.dto';
// import UserAdminResponseDto from '../../user/dto/responses/admin-user-responses.dto';
// import { JWTService } from './jwt.service';
//
// @Injectable()
// export class AuthService extends BusinessService<User> {
//   constructor(
//     private jwtService: JwtService,
//     private jwtServices: JWTService,
//     private userRepo: UserRepository,
//     @Inject('EmailVerification')
//     private readonly emailVerificationModel: EmailVerificationInterface,
//     @Inject('ForgottenPassword')
//     private readonly forgottenPasswordModel: ForgottenPassword,
//     @Inject('ConsentRegistry')
//     private readonly consentRegistryModel: ConsentRegistry,
//   ) {
//     super(userRepo);
//   }
//
//   async validateLogin(email, password) {
//     const userFromDb = await this.userRepo.findOne({ email: email });
//     if (!userFromDb)
//       throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
//     if (!userFromDb.email)
//       throw new HttpException('LOGIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
//
//     const isValidPass = await bcrypt.compare(password, userFromDb.password);
//
//     if (isValidPass) {
//       const accessToken = await this.jwtServices.createToken(email, null);
//       return { token: accessToken, user: new UserAdminResponseDto(userFromDb) };
//     } else {
//       throw new HttpException('LOGIN.ERROR', HttpStatus.UNAUTHORIZED);
//     }
//   }
//
//   async authUserByEmail(authDto: AuthenticationDto): Promise<void> {
//     const { email, password } = authDto;
//     const user = await this.userRepo.findOne({
//       where: { email },
//     });
//     if (!user) {
//       throw new UnauthorizedException('کاربری با این email ثبت نشده است ');
//     }
//     if (user.password !== password) {
//       throw new UnauthorizedException('wrong password');
//     }
//     return;
//   }
//
//   async createEmailToken(email: string): Promise<boolean> {
//     const emailVerification = await this.emailVerificationModel.findOne({email: email});
//     if (emailVerification && ( (new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 < 15 )){
//       throw new HttpException(
//         'LOGIN.EMAIL_SENDED_RECENTLY',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     } else {
//       var emailVerificationModel = await this.emailVerificationModel.findOneAndUpdate(
//         {email: email},
//         {
//           email: email,
//           emailToken: (Math.floor(Math.random() * (9000000)) + 1000000).toString(), //Generate 7 digits number
//           timestamp: new Date()
//         },
//         {upsert: true}
//       );
//       return true;
//     }
//   }
//
//
//   async whoAmI(user: User) {
//     return this.findOne(user.id, 'role');
//   }
// }
import {Injectable, HttpException, HttpStatus} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailVerification } from '../entities/emailverification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import { ForgotPassword } from '../entities/forgottenpassword.entity';
import { User } from '../../user/entities/user.entity';
import {BusinessService} from "../../base/business.service";
import {UserRepository} from "../../user/repositories/user.repository";
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  DOMAIN,
  CONTACT_EMAIL,
} = process.env;

@Injectable()
export class AuthService extends BusinessService<User> {
  transport;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(ForgotPassword)
    private readonly forgotPasswordRepository: Repository<ForgotPassword>,
    private usersService: UserRepository,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
  ) {
    super(usersService);
    this.transport = nodemailer.createTransport(
      smtpTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: true,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      }),
    );
  }

  async getOneOrFail(id: number) {
    const user = await this.getOne(id);
    this.checkNotFound(user);
    return user;
  }

  async getOne(id: number) {
    return this.usersService.getOne(id);
  }

  async checkUserExists(email: string): Promise<boolean> {
    const user = await this.usersService.findOne({ where: { email: email } });
    return user !== undefined;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersService.findOne({
      where: {
        email: email,
      },
    });
  }

  async findById(id: number): Promise<User> {
    return await this.usersService.findOne({
      where: {
        id: id,
      },
    });
  }

  async create(user: User): Promise<User> {
    return await this.usersService.save(user);
  }

  async update(contact: User) {
    return await this.usersService.update(contact.id, contact);
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.findByEmail(email);
    if (user && bcrypt.compareSync(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async createEmailToken(email: string): Promise<number> {
    const user = await this.findByEmail(email);
    const emailVerification = new EmailVerification();
    emailVerification.user = user;
    emailVerification.token = Math.floor(Math.random() * 9000000) + 1000000;
    emailVerification.timestamp = new Date();
    emailVerification.email = user.email;
    emailVerification.emailToken = emailVerification.token;
    await this.emailVerificationRepository.save(emailVerification);

    return emailVerification.token;
  }

  async recreateEmailToken(user: User): Promise<number> {
    const emailVerification = await this.emailVerificationRepository.findOne({
      where: { user: user },
    });

    if (!emailVerification) {
      return -1;
    } else {
      emailVerification.token = Math.floor(Math.random() * 9000000) + 1000000;
      emailVerification.timestamp = new Date();
      await this.emailVerificationRepository.update(
        emailVerification.id,
        emailVerification,
      );

      return emailVerification.token;
    }
  }

  async sendVerifyEmail(email: string, token: number): Promise<boolean> {
    const verifyUrl = DOMAIN + '/auth/email/verify/' + token;
    let htmlContent = '<p>Visit this link to verify your email address:</p>';
    htmlContent += '<a href=' + verifyUrl + '>' + verifyUrl + '</a>';
    htmlContent +=
      '<p>Please do not reply to this notification, this inbox is not monitored.</p>';
    htmlContent +=
      '<p>If you are having a problem with your account, please email ' +
      CONTACT_EMAIL +
      '</p>';
    htmlContent += '<p>Thanks for using the app</p>';

    const mailOptions = {
      from: 'PRODUCT_NAME <' + CONTACT_EMAIL + '>',
      to: email, // list of receivers
      subject: '[PRODUCT_NAME] verify your email address', // Subject line
      text: 'Hello world', // plaintext body
      html: htmlContent,
    };

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const authService = this.transport;
    try {
      const sent = await new Promise<boolean>(async function (resolve, reject) {
        return await authService.sendMail(mailOptions, async (error) => {
          if (error) {
            return reject(false);
          }
          resolve(true);
        });
      });
      return sent;
    } catch (error) {
      return false;
    }
  }

  async verifyEmail(token: number): Promise<boolean> {
    const emailVerification = await this.emailVerificationRepository.findOne({
      where: { token: token },
    });
    if (emailVerification && emailVerification.email) {
      const userData = await this.findByEmail(
        emailVerification.email,
      );
      if (userData) {
        userData.is_verified = true;
        const savedUser = await this.usersService.save(userData, null);
        await this.emailVerificationRepository.delete({ token: token });
        console.log(!!savedUser, !!savedUser.is_verified);
        return !!savedUser;
      }
    } else {
      throw new HttpException(
        'LOGIN.EMAIL_CODE_NOT_VALID',
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }

  async createForgottenPasswordToken(email: string): Promise<ForgotPassword> {
    const userData = await this.findByEmail(email);
    let forgotPassword = await this.forgotPasswordRepository.findOne({
      user: userData,
    });
    if (
      forgotPassword &&
      (new Date().getTime() - forgotPassword.timestamp.getTime()) / 60000 < 15
    ) {
      throw new HttpException(
        'RESET_PASSWORD.EMAIL_SENT_RECENTLY',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      if (!forgotPassword) {
        forgotPassword = new ForgotPassword();
        forgotPassword.user = userData;
      }

      forgotPassword.token = Math.floor(Math.random() * 9000000) + 1000000;
      forgotPassword.timestamp = new Date();

      const ret = await this.forgotPasswordRepository.save(forgotPassword);

      if (ret) {
        return ret;
      } else {
        throw new HttpException(
          'LOGIN.ERROR.GENERIC_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const userData = await this.findByEmail(email);
    if (!userData)
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const tokenModel = await this.createForgottenPasswordToken(email);

    if (tokenModel && tokenModel.token) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: true,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });

      const url = DOMAIN + '/auth/email/reset-password/' + tokenModel.token;

      const mailOptions = {
        from: 'PRODUCT_NAME <' + CONTACT_EMAIL + '>',
        to: email,
        subject: '[PRODUCT_NAME] Reset password code',
        text: 'Forgot Password',
        html:
          'Hello <br><br> We have received a request to reset your password for your account with email<br>' +
          email +
          '<br>' +
          "If you didn't make this request, please disregard this email or contact our support team at " +
          CONTACT_EMAIL +
          ' . Otherwise, you can reset your password using this link:' +
          '<a href=' +
          url +
          '>' +
          url +
          '</a>', // html body
      };

      const sended = await new Promise<boolean>(async function (
        resolve,
        reject,
      ) {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Message sent: %s', error);
            return reject(false);
          }
          console.log('Message sent: %s', info.messageId);
          resolve(true);
        });
      });

      return sended;
    } else {
      throw new HttpException(
        'REGISTER.USER_NOT_REGISTERED',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async checkVerificationCode(token: string): Promise<User> {
    const forgotPassword = await this.forgotPasswordRepository.findOne({
      relations: ['user'],
      where: { token: token },
    });
    return forgotPassword.user;
  }

  async generateRandomPassword() {
    // eslint-disable-next-line prefer-const
    let length = 8,
      // eslint-disable-next-line prefer-const
      charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  async emailResetedPassword(
    email: string,
    password: string,
  ): Promise<boolean> {
    let htmlContent = '<p>Your new password is: ' + password + ' </p>';
    htmlContent +=
      '<p>Please do not reply to this notification, this inbox is not monitored.</p>';
    htmlContent +=
      '<p>If you are having a problem with your account, please email ' +
      CONTACT_EMAIL +
      '</p>';
    htmlContent += '<p>Thanks for using the app</p>';

    const mailOptions = {
      from: 'PRODUCT_NAME <' + CONTACT_EMAIL + '>',
      to: email,
      subject: '[PRODUCT_NAME] forgotten password confirmation',
      html: htmlContent,
    };

    try {
      const sent = await new Promise<boolean>(async function (resolve, reject) {
        return await this.authService.transport.sendMail(
          mailOptions,
          async (error) => {
            if (error) {
              return reject(false);
            }
            resolve(true);
          },
        );
      });
      return sent;
    } catch (error) {
      return false;
    }
  }
}

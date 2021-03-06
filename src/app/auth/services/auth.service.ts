import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailVerification } from '../entities/emailverification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import { ForgotPassword } from '../entities/forgottenpassword.entity';
import { User } from '../../user/entities/user.entity';
import { BusinessService } from '../../base/business.service';
import { UserRepository } from '../../user/repositories/user.repository';
import RegisterDto from "../dto/requests/register.dto";
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

  async turnOnTwoFactorAuthentication(userId: number) {
    return this.usersService.update(userId, {
      isTwoFactorAuthenticationEnabled: true,
    });
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

    let result;

    const user = await this.findByEmail(req.user.email);
    if (user) {
      result = await this.findByEmail(req.user.email);
      await this.updateById(
        result.id,
        {
          avatar: req.user.picture,
        },
        null,
      );
    } else {
      result = await this.usersService.save({
        email: req.user.email,
        password: null,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.picture,
        isTwoFactorAuthenticationEnabled: false,
      });
    }

    return this.login(result)
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
      const userData = await this.findByEmail(emailVerification.email);
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

  getCookieWithJwtAccessToken(userId: number, isSecondFactorAuthenticated = false) {
    const payload: any = { userId, isSecondFactorAuthenticated };
    const token = this.jwtService.sign(payload, {
      secret: 'JWT_ACCESS_TOKEN_SECRET',
      expiresIn: 'JWT_ACCESS_TOKEN_EXPIRATION_TIME'
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age='JWT_ACCESS_TOKEN_EXPIRATION_TIME'`;
  }

  // ----------------------------------------------------------------------------------------------------------


  async getAuthenticatedUser(email: string, hashedPassword: string) {
    try {
      const user = await this.findByEmail(email);
      const isPasswordMatching = await bcrypt.compare(
          hashedPassword,
          user.password
      );
      if (!isPasswordMatching) {
        throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
      }
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(
        plainTextPassword,
        hashedPassword
    );
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  async getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId, isSecondFactorAuthenticated: false };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age='JWT_EXPIRATION_TIME'`;
  }

  async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createdUser = await this.usersService.save({
        ...registrationData,
        password: hashedPassword
      });
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

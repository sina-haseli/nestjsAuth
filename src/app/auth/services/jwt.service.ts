import * as jwt from 'jsonwebtoken';
import { jwtSecret, expireDuration } from '../../../config/jwt-secret';
import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JWTService {
  constructor(@Inject() private readonly userService: UserService) {}

  async createToken(email, roles) {
    const expiresIn = expireDuration,
      secretOrKey = jwtSecret;
    const userInfo = { email: email, roles: roles };
    const token = jwt.sign(userInfo, secretOrKey, { expiresIn });
    return {
      expires_in: expiresIn,
      access_token: token,
    };
  }

  async validateUser(email): Promise<User> {
    const userFromDb = await this.userService.findOne(email);
    if (userFromDb) {
      return userFromDb;
    }
    return null;
  }
}

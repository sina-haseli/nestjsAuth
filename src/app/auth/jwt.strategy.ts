import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 1
      audience: 'http://localhost:1337',
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    });
  }

  validate(payload: any, done: VerifiedCallback) {
    if (!payload) {
      done(new UnauthorizedException(), false); // 2
    }

    return done(null, payload);
  }

  // constructor(
  //   @InjectRepository(UserRepository)
  //   private userRepository: UserRepository,
  // ) {
  //   super({
  //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //     secretOrKey: jwtSecret,
  //   });
  // }
  //
  // async validate(payload: JwtPayload): Promise<User> {
  //   const { email } = payload;
  //   const user = await this.userRepository
  //     .createQueryBuilder('user')
  //     .andWhere('user.email = :email', {
  //       email,
  //     })
  //     .getOne();
  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }
  //   return user;
  // }
}

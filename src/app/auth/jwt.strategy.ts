// import { PassportStrategy } from '@nestjs/passport';
// import { passportJwtSecret } from 'jwks-rsa';
// import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
//
// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       secretOrKeyProvider: passportJwtSecret({
//         cache: true,
//         rateLimit: true,
//         jwksRequestsPerMinute: 5,
//         jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
//       }),
//
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 1
//       audience: 'http://localhost:1337',
//       issuer: `https://${process.env.AUTH0_DOMAIN}/`,
//     });
//   }
//
//   validate(payload: any, done: VerifiedCallback) {
//     if (!payload) {
//       done(new UnauthorizedException(), false); // 2
//     }
//
//     return done(null, payload);
//   }
// }


// --------------------------------------------------

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {UserService} from "../user/services/user.service";
import {jwtSecret} from "../../config/jwt-secret";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
      private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log('@@@@@@@ PAYLOAD JWT STG,', payload)
    return this.userService.findById(payload.sub);
  }
}
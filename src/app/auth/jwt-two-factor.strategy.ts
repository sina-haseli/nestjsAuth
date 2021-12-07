import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import {UserService} from "../user/services/user.service";

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
    Strategy,
    'jwt-two-factor'
) {
    constructor(
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                return request?.cookies?.Authentication;
            }]),
            secretOrKey: 'JWT_ACCESS_TOKEN_SECRET'
        });
    }

    async validate(payload: TokenPayload) {
        const user = await this.userService.findById(payload.userId);
        if (!user.isTwoFactorAuthenticationEnabled) {
            return user;
        }
        if (payload.isSecondFactorAuthenticated) {
            return user;
        }
    }
}
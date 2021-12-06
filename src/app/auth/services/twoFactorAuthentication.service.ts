import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import {User} from "../../user/entities/user.entity";
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import {UserRepository} from "../../user/repositories/user.repository";
import {BusinessService} from "../../base/business.service";

@Injectable()
export class TwoFactorAuthenticationService extends BusinessService<User>{
    constructor (
        private usersService: UserRepository,
    ) {
        super(usersService);
    }

    async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
        return this.usersService.update(userId, {
            twoFactorAuthenticationSecret: secret
        });
    }

    public async generateTwoFactorAuthenticationSecret(user: User) {
        const secret = authenticator.generateSecret();

        const otpauthUrl = authenticator.keyuri(user.email, 'TWO_FACTOR_AUTHENTICATION_APP_NAME', secret);

        await this.setTwoFactorAuthenticationSecret(secret, user.id);

        return {
            secret,
            otpauthUrl
        }
    }

    public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
    }

    public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
        return authenticator.verify({
            token: twoFactorAuthenticationCode,
            secret: user.twoFactorAuthenticationSecret
        })
    }
}
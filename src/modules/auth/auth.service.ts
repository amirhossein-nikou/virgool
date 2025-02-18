import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { contains, isEmail, isMobilePhone } from 'class-validator';
import { randomInt } from 'crypto';
import { Request, Response } from 'express';
import { CookieName } from 'src/common/enums/cookie.enum';
import { AuthMessage, BadRequestMessage, NotFoundMessage, PublicMessages } from 'src/common/enums/message.enum';
import { cookieOptionsUtil } from 'src/common/utils/cookie.utils';
import { Repository } from 'typeorm';
import { OtpEntity } from '../user/entities/otp.entity';
import { ProfileEntity } from '../user/entities/profile.entity';
import { UserEntity } from '../user/entities/user.entity';
import { ChangeMethodEnum } from '../user/enum/change.enum';
import { AuthMethodEnum } from './authEnums/auth-method.enum';
import { AuthTypeEnum } from './authEnums/auth-type.enum';
import { ResultType } from './authType/result';
import { AuthDto } from './dto/auth.dto';
import { TokenService } from './token.service';
import { GoogleUser } from './authType/googleUser.type';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
        @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
        private tokenService: TokenService,
        @Inject(REQUEST) private request: Request
        //kavenegarService
    ) { }
    async userExistence(authDto: AuthDto, res: Response) {
        const { method, type, username } = authDto;
        let result: ResultType;
        switch (type) {
            case AuthTypeEnum.Login:
                result = await this.login(method, username)
                //KavenegarSmsSender
                return this.sendResponse(res, result)
            case AuthTypeEnum.Register:
                result = await this.register(method, username)
                //KavenegarSmsSender
                return this.sendResponse(res, result)
            default:
                throw new UnauthorizedException("user Existence")
        }
    }
    async login(method: AuthMethodEnum, username: string) {
        const validUsername = this.usernameValidator(method, username);
        let user = await this.checkUser(method, validUsername)
        if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount)
        const otp = await this.saveOtp(user.id, method, CookieName.OTP)
        const token = this.tokenService.createToken({ userId: user.id })
        return {
            token,
            code: otp.code
        }
    }
    async register(method: AuthMethodEnum, username: string) {
        const validUsername = this.usernameValidator(method, username)
        let user = await this.checkUser(method, validUsername)
        if (user) throw new ConflictException(AuthMessage.ExistAccount)
        if (method === AuthMethodEnum.Username) {
            throw new BadRequestException(BadRequestMessage.InvalidRegisterData);
        }
        user = this.userRepository.create({
            [method]: username
        })
        user = await this.userRepository.save(user);
        user.username = `m_${user.id}`
        await this.userRepository.save(user)
        const otp = await this.saveOtp(user.id, method, CookieName.OTP);
        const token = this.tokenService.createToken({ userId: user.id })
        return {
            token,
            code: otp.code
        }
    }

    async sendResponse(res: Response, result: ResultType) {
        const { token, code } = result;
        res.cookie(CookieName.OTP, token, cookieOptionsUtil())
        res.json({
            message: PublicMessages.SendCode,
            code
        })
    }

    async checkOtp(code: string) {
        const token = this.request.cookies?.[CookieName.OTP]
        if (!token) throw new UnauthorizedException(AuthMessage.TokenNotFound);
        const { userId } = this.tokenService.verifyToken(token)
        const otp = await this.otpRepository.findOneBy({ userId })
        if (!otp) throw new UnauthorizedException(AuthMessage.CodeNotExist)
        if (otp.expiresIn < new Date) throw new UnauthorizedException(AuthMessage.CodeExpires);
        if (otp.code !== code) throw new UnauthorizedException(AuthMessage.WrongCode);
        const accessToken = this.tokenService.createAccessToken({ userId });
        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user) {
            throw new NotFoundException(NotFoundMessage.NotFoundUser)
        }
        if (otp.method === AuthMethodEnum.Email) {
            this.userRepository.update({ id: userId }, {
                verify_email: true
            })
        }
        if (otp.method === AuthMethodEnum.Mobile) {
            this.userRepository.update({ id: userId }, {
                verify_mobile: true
            })
        }
        return {
            message: PublicMessages.LoggedIn,
            accessToken
        }
    }

    async saveOtp(userId: number, method: AuthMethodEnum, cookieName: CookieName) {
        const code = randomInt(10000, 99999).toString();
        const expiresIn = new Date(Date.now() + (1000 * 60 * 2));
        let otp = await this.otpRepository.findOneBy({ userId })
        let isOtpExist: boolean = false
        const token = this.request.cookies?.[cookieName]
        if (otp) {
            if (token && new Date < otp.expiresIn) {
                throw new BadRequestException(BadRequestMessage.CodeNotExpires)
            }
            isOtpExist = true
            otp.code = code
            otp.expiresIn = expiresIn
            otp.method = method
        } else {
            otp = this.otpRepository.create({
                code,
                expiresIn,
                userId,
                method
            })
        }
        otp = await this.otpRepository.save(otp)
        if (!isOtpExist) {
            await this.userRepository.update({ id: userId }, { otpId: otp.id })
        }
        return otp;
    }

    async checkUser(method: AuthMethodEnum, username: string) {
        switch (method) {
            case AuthMethodEnum.Email:
                return await this.userRepository.findOneBy({ email: username })
            case AuthMethodEnum.Mobile:
                return await this.userRepository.findOneBy({ mobile: username })
            case AuthMethodEnum.Username:
                return await this.userRepository.findOneBy({ username: username })
            default:
                throw new UnauthorizedException()
        }
    }
    usernameValidator(method: AuthMethodEnum | ChangeMethodEnum, username: string) {
        switch (method) {
            case AuthMethodEnum.Email:
                if (isEmail(username)) return username
                throw new BadRequestException("email format incorrect")
            case AuthMethodEnum.Mobile:
                if (isMobilePhone(username, "fa-IR")) return username
                throw new BadRequestException("mobile number format incorrect")
            case AuthMethodEnum.Username:
                let regEx: RegExp = /^[a-zA-Z0-9.]{3,25}$/
                if (regEx.test(username) && !contains(username, "\\")) return username
                throw new BadRequestException("username format incorrect")
            default:
                throw new UnauthorizedException("username validator")
        }
    }

    async validateAccessToken(token: string) {
        const { userId } = this.tokenService.verifyAccessToken(token)
        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user) throw new UnauthorizedException(AuthMessage.LogInAgain)
        return user
    }
    async googleLogin(googleData: GoogleUser) {
        const { email, firstName, lastName, photo } = googleData
        console.log(email);
        let user = await this.userRepository.findOneBy({ email })
        console.log("email");
        let token: string;
        let profile: ProfileEntity;
        if (user) {
            return { token: this.tokenService.createToken({ userId: user.id }) }
        }
        user = this.userRepository.create({
            email: email,
            verify_email: true
        })
        user = await this.userRepository.save(user)
        profile = this.profileRepository.create({
            nik_name: `${firstName} ${lastName}`,
            userId: user.id
        })
        profile = await this.profileRepository.save(profile)

        user.profileId = profile.id
        user.username = `${email.split("@")[0]}_${user.id}`
        user = await this.userRepository.save(user)
        token = this.tokenService.createAccessToken({ userId: user.id })
        return {
            token
        }
    }
}

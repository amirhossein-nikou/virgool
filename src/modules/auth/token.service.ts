import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthMessage, BadRequestMessage } from "src/common/enums/message.enum";
import { PayloadAccessTokenType, PayloadEmailTokenType, PayloadMobileTokenType, PayloadTokenType } from "./authType/payload";

@Injectable()
export class TokenService{
    constructor(
        private jwtService: JwtService
    ){}

    createToken(payload: PayloadTokenType){
        const token = this.jwtService.sign(payload,{
            secret: process.env.TOKEN_SECRET,
            expiresIn: 60*2
        })
        return token
    }
    verifyToken(token:string): PayloadTokenType{
        try {
            return this.jwtService.verify(token,{
                secret: process.env.TOKEN_SECRET,
            })
        } catch (error) {
            throw new UnauthorizedException(AuthMessage.TokenNotFound)
            
        }
    }
    createAccessToken(payload: PayloadAccessTokenType){
        const token = this.jwtService.sign(payload,{
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: "1y"
        })
        return token
    }
    verifyAccessToken(token:string): PayloadAccessTokenType{
        try {
            return this.jwtService.verify(token,{
                secret: process.env.ACCESS_TOKEN_SECRET,
            })
        } catch (error) {
            throw new UnauthorizedException(AuthMessage.LogInAgain)
            
        }
    }
    //Email token
    createEmailToken(payload: PayloadEmailTokenType){
        const token = this.jwtService.sign(payload,{
            secret: process.env.EMAIL_TOKEN_SECRET,
            expiresIn: 60*2
        })
        return token
    }
    verifyEmailToken(token:string): PayloadEmailTokenType{
        try {
            return this.jwtService.verify(token,{
                secret: process.env.EMAIL_TOKEN_SECRET,
            })
        } catch (error) {
            throw new BadRequestException(BadRequestMessage.SomethingWrong)
            
        }
    }
    //mobile token 
    createMobileToken(payload: PayloadMobileTokenType){
        const token = this.jwtService.sign(payload,{
            secret: process.env.MOBILE_TOKEN_SECRET,
            expiresIn: 60*2
        })
        return token
    }
    verifyMobileToken(token:string): PayloadMobileTokenType{
        try {
            return this.jwtService.verify(token,{
                secret: process.env.MOBILE_TOKEN_SECRET,
            })
        } catch (error) {
            throw new BadRequestException(BadRequestMessage.SomethingWrong)
            
        }
    }
}
import { Injectable, NestMiddleware } from "@nestjs/common";
import { isJWT } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "src/modules/auth/auth.service";
@Injectable()
export class addUserToRequestWOV implements NestMiddleware {
    constructor(private authService: AuthService) { }
    async use(req: Request, res: Response, next:NextFunction) {        
        const token = this.getToken(req)
        if(!token) return next()
        try {
            let user = await this.authService.validateAccessToken(token);
            if(user) req.user = user
        } catch (error) {
            console.log(error);
        }
        next()
    }
    
    protected getToken(request: Request) {
        const { authorization } = request.headers;
        if (!authorization || authorization?.trim() === "") {
            return null
        }
        const [bearer, token] = authorization.split(" ");
        if (bearer?.toLowerCase() !== "bearer" || !token || !isJWT(token)) {
            return null
        }
        return token
    }

}
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { isJWT } from "class-validator";
import { Request } from "express";
import { AuthMessage, ForbiddenMessage } from "src/common/enums/message.enum";
import { AuthService } from "../auth.service";
import { Reflector } from "@nestjs/core";
import { SKIP_AUTH } from "src/common/decorators/skip-auth.decorator";
import { UserStatus } from "src/modules/user/enum/status.enum";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private reflector: Reflector) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isSkippedAuthorization: boolean = this.reflector.get<boolean>(SKIP_AUTH, context.getHandler())
        if(isSkippedAuthorization) return true
        const request = context.switchToHttp().getRequest<Request>()
        const token = this.getToken(request)
        request.user = await this.authService.validateAccessToken(token)
        if(request?.user?.status === UserStatus.Block){
            throw new ForbiddenException(ForbiddenMessage.BlockedUser)
        }
        return !!token
    }

    protected getToken(request: Request) {
        const { authorization } = request.headers;
        if (!authorization || authorization?.trim() === "") {
            throw new UnauthorizedException(AuthMessage.LogIn)
        }
        const [bearer, token] = authorization.split(" ");
        if (bearer?.toLowerCase() !== "bearer" || !token || !isJWT(token)) {
            throw new UnauthorizedException(AuthMessage.LogIn)
        }
        return token
    }
}
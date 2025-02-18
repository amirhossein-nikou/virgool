import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { ROLE } from "src/common/decorators/role.decorator";
import { RolesEnum } from "src/common/enums/roles.enum";
@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest<Request>();
        const requiredRoles: RolesEnum = this.reflector.getAllAndOverride(ROLE,
            [context.getHandler(), context.getClass()]
        )
        const user = request?.user
        if (!requiredRoles || requiredRoles.length <= 0) return true
        const userRole = user?.role ?? RolesEnum.User
        if(user.role === RolesEnum.Admin) return true;
        if(requiredRoles.includes(userRole)) return true;
        throw new ForbiddenException()
    }

}
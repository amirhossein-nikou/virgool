import { SetMetadata } from "@nestjs/common"
import { RolesEnum } from "../enums/roles.enum"

export const ROLE = "ROLE"
export const CanAccess = (...roles:RolesEnum[]) => SetMetadata(ROLE, roles)
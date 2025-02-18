import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { GoogleUser } from "./authType/googleUser.type";

@Controller("/auth/google")
@ApiTags("google-auth")
@UseGuards(AuthGuard('google'))
export class GoogleAuthController {
    constructor(private readonly authService: AuthService) { }
    @Get()
    googleLogin(@Req() req) { }
    @Get("/redirect")
    googleRedirect(@Req() req) {
        const userData: GoogleUser = req.user
        return this.authService.googleLogin(userData)
    }
}
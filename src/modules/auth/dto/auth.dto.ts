import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsNumberString, IsString, Length } from "class-validator";
import { AuthMethodEnum } from "../authEnums/auth-method.enum";
import { AuthTypeEnum } from "../authEnums/auth-type.enum";

export class AuthDto {
    @ApiProperty()
    @IsString()
    @Length(3, 100)
    username: string;
    @ApiProperty({ enum: AuthMethodEnum })
    @IsEnum(AuthMethodEnum)
    method: AuthMethodEnum;
    @ApiProperty({ enum: AuthTypeEnum })
    @IsEnum(AuthTypeEnum)
    type: string;
}
export class CheckOtpDto {
    @ApiProperty()
    @IsString()
    @Length(5,5)
    code: string;
}
export class BlockDto {
    @ApiProperty()
    @IsNumberString()
    userId: number;
}
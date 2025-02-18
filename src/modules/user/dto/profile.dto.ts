import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsString, Length } from "class-validator"
import { ChangeMethodEnum } from "../enum/change.enum"
import { Genders } from "../enum/gender.enum"


export class ProfileDto {
    @ApiPropertyOptional()
    @Length(3, 100)
    @IsOptional()
    nik_name: string
    @ApiPropertyOptional({ nullable: true })
    @Length(10, 200)
    @IsOptional()
    bio: string
    @ApiPropertyOptional({ nullable: true, format: "binary" })
    profile_image: string
    @ApiPropertyOptional({ nullable: true, format: "binary" })
    bg_image: string
    @ApiPropertyOptional({ nullable: true, enum: Genders })
    gender: string
    @ApiPropertyOptional({ nullable: true, example: "2024-05-16T15:40:51.122Z" })
    birthday: Date
    @ApiPropertyOptional({ nullable: true })
    x_profile: string
    @ApiPropertyOptional({ nullable: true })
    linkedIn_profile: string
}

export class ChangeDto {
    @ApiProperty()
    @IsString()
    username: string
    @ApiProperty({ enum: ChangeMethodEnum })
    @IsEnum(ChangeMethodEnum)
    method: ChangeMethodEnum;
}
export class ChangeUsernameDto{
    @ApiProperty()
    @IsString()
    @Length(3,50)
    username: string
}


/* function Property(): (target: ProfileDto, propertyKey: "nik_name") => void {
    throw new Error("Function not implemented.");
} */

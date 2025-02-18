import { applyDecorators } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export function IsStringSwagger(){
    return applyDecorators(
        ApiProperty(),
        IsString(),
        IsNotEmpty()
    )
}
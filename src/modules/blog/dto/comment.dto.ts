import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";

export class CommentDto{
    @ApiProperty()
    @IsString()
    text: string
    @ApiProperty()
    @IsNumberString()
    blogId: number
    @ApiPropertyOptional()
    @IsNumberString()
    @IsOptional()
    parentId: number
}
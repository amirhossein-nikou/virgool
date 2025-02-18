import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class FilterBlogDto{
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    categoryTitle: string
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    search: string
}
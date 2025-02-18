import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Length } from "class-validator";
import { IsStringSwagger } from "src/common/decorators/validation.decorator";

export class CreateBlogDto{
    @IsStringSwagger()
    @Length(10,150)
    title: string
    @IsStringSwagger()
    @Length(10,300)
    description: string
    @IsStringSwagger()
    content: string
    @ApiPropertyOptional()
    image: string
    @ApiPropertyOptional()
    slug: string
    @IsStringSwagger()
    time_for_study: string
    @ApiPropertyOptional({type: String, isArray: true})
    categories: string[] | string
}
export class UpdateBlogDto extends PartialType(CreateBlogDto){}
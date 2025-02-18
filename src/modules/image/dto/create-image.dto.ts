import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { IsStringSwagger } from "src/common/decorators/validation.decorator";

export class ImageDto {
    @ApiPropertyOptional()
    alt: string
    @ApiProperty()
    name: string
    @ApiProperty({format:"binary"})
    image: string
}

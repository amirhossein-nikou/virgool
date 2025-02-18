import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export function FilterBlogDec() {
    return applyDecorators(
        ApiQuery({ name: "categoryTitle", required: false }),
        ApiQuery({ name: "search", required: false }),
    )
}
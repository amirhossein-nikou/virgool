import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CommentDto } from '../dto/comment.dto';
import { CommentService } from '../services/comment.service';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('blog')
@ApiTags("Blog")
@UseGuards(AuthGuard)
@ApiBearerAuth("Authorization")
export class BlogCommentController {
    constructor(private readonly commentService: CommentService) { }

    @Post("create-comment")
    @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
    createComment(@Body() commentDto: CommentDto) {
        return this.commentService.createComment(commentDto)
    }
    @Get("/show-all-comments")
    @PaginationDec()
    @SkipAuth()
    getAllBlogs(@Query() paginationDto: PaginationDto) {
        return this.commentService.getAllComments(paginationDto)
    }
    @Put("/accept/:id")
    @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
    acceptComment(@Param("id",ParseIntPipe) id:number){
        return this.commentService.acceptComment(id);
    }
    @Put("/reject/:id")
    @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
    rejectComment(@Param("id",ParseIntPipe) id:number){
        return this.commentService.rejectComment(id);
    }
}

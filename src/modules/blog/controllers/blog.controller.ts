import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto, UpdateBlogDto } from '../dto/blog.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { FilterBlogDec } from 'src/common/decorators/filter-blog.decorator';
import { FilterBlogDto } from '../dto/filter-blog.dto';

@Controller('blog')
@ApiTags("Blog")
@UseGuards(AuthGuard)
@ApiBearerAuth("Authorization")
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @Post("create-blog")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  createBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.createBlog(createBlogDto)
  }
  @Get("my-blogs")
  getUserBlog() {
    return this.blogService.getUserBlog()
  }
  @Get("/show-all")
  @PaginationDec()
  @SkipAuth()
  @FilterBlogDec()
  getAllBlogs(@Query() paginationDto: PaginationDto, @Query() filterBlogDto: FilterBlogDto) {
    return this.blogService.getAllBlogs(paginationDto, filterBlogDto)
  }
  @Get("/slug/:slug")
  @PaginationDec()
  @SkipAuth()
  findBlogBySlug(@Param('slug') slug: string, @Query() paginationDto: PaginationDto) {
    return this.blogService.findBlogBySlug(slug, paginationDto)
  }
  @Get("/like/:id")
  likeToggle(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.likeToggle(id)
  }
  @Get("/bookmark/:id")
  bookmarkToggle(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.bookmarkToggle(id)
  }
  @Delete("/:id")
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.deleteBlog(id)
  }
  @Put("/Update-blog/:id")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  updateBlog(@Param("id", ParseIntPipe) id: number, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.updateBlog(id, updateBlogDto)
  }
}

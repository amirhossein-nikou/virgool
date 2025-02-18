import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CategoryService } from '../category/category.service';
import { CategoryEntity } from '../category/entities/category.entity';
import { UserEntity } from '../user/entities/user.entity';
import { BlogController } from './controllers/blog.controller';
import { BlogCommentController } from './controllers/comment.controller';
import { BlogCategoryEntity } from './entities/blog-category.entity';
import { BlogEntity } from './entities/blog.entity';
import { BlogBookmarkEntity } from './entities/bookmark.entity';
import { BlogCommentEntity } from './entities/comment.entity';
import { BlogLikeEntity } from './entities/like.entity';
import { BlogService } from './services/blog.service';
import { CommentService } from './services/comment.service';
import { addUserToRequestWOV } from 'src/common/middleware/addUserToRequestWOV.middleware';

@Module({
  imports: [AuthModule,
    TypeOrmModule.forFeature([BlogEntity,
       UserEntity, BlogLikeEntity, BlogBookmarkEntity, BlogCommentEntity
       ,BlogCategoryEntity,CategoryEntity])],
  controllers: [BlogController,BlogCommentController],
  providers: [BlogService, TypeOrmModule,CategoryService,CommentService],
})
export class BlogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(addUserToRequestWOV).forRoutes("blog/slug/:slug")
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { BlogModule } from 'src/modules/blog/blog.module';
import { CategoryModule } from 'src/modules/category/category.module';
import { TypeOrmConfig } from '../config/typeorm.config';
import { CostumeConfigModule } from '../modules/config/config.module';
import { UserModule } from '../modules/user/user.module';
import { ImageModule } from 'src/modules/image/image.module';

@Module({
  imports: [CostumeConfigModule,
    /* TypeOrmModule.forRootAsync({
      useClass: TypeormDbConfig,
      inject: [TypeOrmModule]
    }) */
    TypeOrmModule.forRoot(TypeOrmConfig()),
    UserModule, AuthModule, CategoryModule, BlogModule , ImageModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { multerFile, multerStorageDisc } from 'src/common/utils/multer.utils';
import { ImageDto } from './dto/create-image.dto';
import { ImageService } from './image.service';
import { UploadImage } from 'src/common/interceptors/upload.interceptor';

@Controller('image')
@ApiTags("Image")
@AuthDecorator()
export class ImageController {
  constructor(private readonly imageService: ImageService) { }

  @Post()
  @UseInterceptors(UploadImage("image"))
  @ApiConsumes(SwaggerConsumes.MultiPartData)
  create(@Body() imageDto: ImageDto, @UploadedFile() image: multerFile) {
    return this.imageService.create(imageDto, image);
  }

  @Get()
  findAll() {
    return this.imageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(+id);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imageService.remove(+id);
  }
}

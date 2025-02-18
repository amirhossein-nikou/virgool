import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ImageDto } from './dto/create-image.dto';
import { multerFile } from 'src/common/utils/multer.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from './entities/image.entity';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import path from 'path';
import { NotFoundMessage, PublicMessages } from 'src/common/enums/message.enum';
import { EntityName } from 'src/common/enums/entity.enum';

@Injectable({ scope: Scope.REQUEST })
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity) private imageRepository: Repository<ImageEntity>,
    @Inject(REQUEST) private request: Request
  ) { }
  async create(imageDto: ImageDto, image: multerFile) {
    const userId = this.request?.user?.id
    const { alt, name } = imageDto
    let location = image.path?.slice(7)
    await this.imageRepository.insert({
      alt: alt || name,
      location,
      userId,
    })
    return {
      message: PublicMessages.Create
    }
  }

  findAll() {
    const userId = this.request?.user?.id
    return this.imageRepository.findBy({ userId })
  }

  async findOne(id: number) {
    const userId = this.request?.user?.id
    const image = await this.imageRepository.createQueryBuilder(EntityName.Image)
      .where("image.userId = :userId AND image.id = :id", { userId, id })
      .getOne()
    if (!image) throw new NotFoundException(NotFoundMessage.NotFoundImage)
    return image
  }


  async remove(id: number) {
    const image = await this.findOne(id)
    this.imageRepository.remove(image)
    return { message: PublicMessages.Delete }
  }
}

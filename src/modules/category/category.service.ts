import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { BadRequestMessage, ConflictExceptionMessage, NotFoundMessage, PublicMessages } from 'src/common/enums/message.enum';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity) private categoryRepository: Repository<CategoryEntity>
  ) { }
  async createCategory(createCategoryDto: CreateCategoryDto) {
    let { title, priority } = createCategoryDto;
    title = await this.checkExistTitle(title);
    const category = this.categoryRepository.create({
      title,
      priority
    })
    await this.categoryRepository.save(category)
    return category;
  }
  async insertCategory(title: string) {
    const category = this.categoryRepository.create({
      title,
      priority: null
    })
    await this.categoryRepository.save(category)
    return category;
  }

  async findAll(paginationDto: PaginationDto) {
    console.log(paginationDto);
    const { limit, page, skip } = paginationSolver(paginationDto)
    const [category, count] = await this.categoryRepository.findAndCount({
      where: {},
      skip,
      take: limit
    });
    return {
      pagination: paginationGenerator(limit, page, count),
      category
    }
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) throw new NotFoundException(NotFoundMessage.NotFoundCategory)
    return category
  }

  async findOneByTitle(title: string) {
    const category = await this.categoryRepository.findOneBy({ title })
    return category
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    let { priority, title } = updateCategoryDto;
    if (!title) throw new BadRequestException(BadRequestMessage.ValueIsNull);
    title = await this.checkExistTitle(title)
    const category = await this.categoryRepository.update(id, {
      priority,
      title
    })
    return {
      message: PublicMessages.Update
    }
  }

  async remove(id: number) {
    const category = await this.findOne(id)
    this.categoryRepository.remove(category)
    return { message: PublicMessages.Delete };
  }

  async checkExistTitle(title: string) {
    title = title?.trim().toLocaleLowerCase();
    const category = await this.categoryRepository.findOneBy({ title })
    if (category) throw new ConflictException(ConflictExceptionMessage.ExistsTitle)
    return title
  }
}

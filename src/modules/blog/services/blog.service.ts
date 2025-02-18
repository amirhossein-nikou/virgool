import { BadRequestException, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { isArray } from 'class-validator';
import { Request } from 'express';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { EntityName } from 'src/common/enums/entity.enum';
import { AuthMessage, BadRequestMessage, NotFoundMessage, PublicMessages } from 'src/common/enums/message.enum';
import { createSlug, randomValue } from 'src/common/utils/functions.utils';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { DataSource, Repository } from 'typeorm';
import { CategoryService } from '../../category/category.service';
import { CreateBlogDto, UpdateBlogDto } from '../dto/blog.dto';
import { FilterBlogDto } from '../dto/filter-blog.dto';
import { BlogCategoryEntity } from '../entities/blog-category.entity';
import { BlogEntity } from '../entities/blog.entity';
import { BlogBookmarkEntity } from '../entities/bookmark.entity';
import { BlogLikeEntity } from '../entities/like.entity';
import { CommentService } from './comment.service';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
    constructor(
        @InjectRepository(BlogEntity) private blogRepository: Repository<BlogEntity>,
        @InjectRepository(BlogCategoryEntity) private blogCategoryRepository: Repository<BlogCategoryEntity>,
        @InjectRepository(BlogLikeEntity) private blogLikeRepository: Repository<BlogLikeEntity>,
        @InjectRepository(BlogBookmarkEntity) private blogBookmarkRepository: Repository<BlogBookmarkEntity>,
        @Inject(REQUEST) private request: Request,
        private categoryService: CategoryService,
        private commentService: CommentService,
        private dataSource: DataSource
    ) { }

    async createBlog(createBlogDto: CreateBlogDto) {
        const user = this.request?.user
        let { slug, title, content, description, image, time_for_study, categories } = createBlogDto;
        slug = await this.makeSlug(slug, title)
        categories = this.checkCategoryFormat(categories)
        if (!user) throw new UnauthorizedException(AuthMessage.LogIn)
        const blog = this.blogRepository.create({
            slug,
            title,
            content,
            description,
            image,
            time_for_study,
            authorId: user.id,

        })
        await this.blogRepository.save(blog)
        for (const categoryTitle of categories) {
            let category = await this.categoryService.findOneByTitle(categoryTitle)
            if (!category) {
                category = await this.categoryService.insertCategory(categoryTitle)
            }
            await this.blogCategoryRepository.insert({
                blogId: blog.id,
                categoryId: category.id,
            })
        }
        return {
            message: PublicMessages.Create
        }
    }

    async getUserBlog() {
        const { id } = this.request?.user
        const blog = await this.blogRepository.find({
            where: { authorId: id },
            order: { id: "DESC" }
        })
        return blog
    }

    async getAllBlogs(paginationDto: PaginationDto, filterBlogDto: FilterBlogDto) {
        const { limit, page, skip } = paginationSolver(paginationDto);
        let { categoryTitle, search } = filterBlogDto
        let where = ''
        if (categoryTitle) {
            categoryTitle = categoryTitle.toLocaleLowerCase()
            if (where.length > 0) where += ' AND '
            where += 'category.title ILIKE :categoryTitle'

            /* where["categories"] = {
                category: {
                    title: categoryTitle
                }
            } */
        }
        if (search) {
            if (where.length > 0) where += ' AND '
            search = `%${search}%`
            where += 'CONCAT(blog.title,blog.description,blog.content) ILIKE :search'
        }
        const [blog, count] = await this.blogRepository.createQueryBuilder(EntityName.Blog)
            .leftJoin("blog.categories", "categories")
            .leftJoin("categories.category", "category")
            .leftJoin("blog.author", "author")
            .leftJoin("author.profile", "profile")
            .addSelect(['categories.id', 'category.title'
                , 'author.username', 'author.id', 'profile.nik_name'])
            .where(where, { categoryTitle, search })
            .loadRelationCountAndMap("blog.likes", "blog.likes")
            .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
            .loadRelationCountAndMap("blog.comments", "blog.comments", "comments", (qb) =>
                qb.where("comments.accepted = :accepted", { accepted: true })
            )
            .orderBy("blog.id", "DESC")
            .skip(skip)
            .take(limit)
            .getManyAndCount()
        /* const [blog, count] = await this.blogRepository.findAndCount({
            relations: {
                categories: {
                    category: true
                }
            },
            where,
            select:{
                categories:{
                    id: true,
                    category: {
                        title: true
                    }
                }
            },
            order: { id: "DESC" },
            skip,
            take: limit
        }) */
        return {
            Pagination: paginationGenerator(limit, page, count),
            blogs: blog
        }
    }
    async findBlogBySlug(slug: string, paginationDto: PaginationDto) {
        const userId = this.request?.user?.id
        const blog = await this.blogRepository.createQueryBuilder(EntityName.Blog)
            .leftJoin("blog.categories", "categories")
            .leftJoin("categories.category", "category")
            .leftJoin("blog.author", "author")
            .leftJoin("author.profile", "profile")
            .addSelect(['categories.id', 'category.title'
                , 'author.username', 'author.id', 'profile.nik_name'])
            .where({ slug })
            .loadRelationCountAndMap("blog.likes", "blog.likes")
            .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
            .getOne()
        if (!blog) throw new NotFoundException(NotFoundMessage.NotFoundBlog)
        const commentData = await this.commentService.getBlogComments(blog.id, paginationDto)
        const isLiked = await this.blogLikeRepository.createQueryBuilder(EntityName.BlogLike)
            .addSelect(["blog_like.userId", "blog_like.blogId"])
            .where("blog_like.userId = :userId AND blog_like.blogId = :blogId", { userId, blogId: blog.id })
            .getOne()
        const isBookmarked = await this.blogBookmarkRepository.createQueryBuilder(EntityName.BlogBookmark)
            .addSelect(["blog_bookmark.userId", "blog_bookmark.blogId"])
            .where("blog_bookmark.userId = :userId AND blog_bookmark.blogId = :blogId", { userId, blogId: blog.id })
            .getOne()
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        const suggestedBlog = await queryRunner.query(`
            WITH suggested_blogs AS(
                SELECT 
                    blog.id,
                    blog.title,
                    blog.slug,
                    blog.description,
                    blog.time_for_study,
                    blog.image,
                json_build_object(
                    'username', u.username,
                    'author_name', p.nik_name,
                    'image', p.profile_image
                )AS author,
                array_agg(DISTINCT cat.title) AS categories,
                (
                    SELECT COUNT(*) FROM blog_like
                    WHERE blog_like."blogId" = blog.id
                )AS likes,
                (
                    SELECT COUNT(*) FROM blog_bookmark
                    WHERE blog_bookmark."blogId" = blog.id
                )AS bookmarks,
                (
                    SELECT COUNT(*) FROM blog_comment
                    WHERE blog_comment."blogId" = blog.id
                )AS comments
                FROM blog
                LEFT JOIN public.user u ON blog."authorId" = u.id
                LEFT JOIN profile p ON p."userId" = u.id
                LEFT JOIN blog_category bc ON bc."blogId" = blog.id
                LEFT JOIN category cat ON bc."categoryId" = cat.id
                GROUP BY blog.id, u.username, p.nik_name, p.profile_image
                ORDER BY RANDOM()
                LIMIT 3
            )
            SELECT * FROM suggested_blogs
        `)
        return {
            blog,
            isBookmarked: !!isBookmarked,
            isLiked: !!isLiked,
            commentData,
            suggestedBlog
        }
    }
    async checkSlugExist(slug: string): Promise<boolean> {
        const blog = await this.blogRepository.findOneBy({ slug })
        return !!blog
    }
    async makeSlug(slug?: string, title?: string): Promise<string> {
        let slugData: string;
        if (!slug && !title) throw new BadRequestException(BadRequestMessage.ValueIsNull)
        if (!slug || slug.trim() === "") slugData = title;
        if (!title || title.trim() === "") slugData = slug;
        if (slug && title) slugData = slug
        slug = createSlug(slugData);
        const isSlugExist = await this.checkSlugExist(slug)
        if (isSlugExist) slug += `-${randomValue()}`
        return slug
    }

    checkCategoryFormat(categories: string | string[]): string[] {
        if (!isArray(categories) && typeof categories === "string") {
            categories = categories.split(',')
        } else if (!isArray(categories)) {
            throw new BadRequestException(BadRequestMessage.InvalidCategoryFormat)
        }
        return categories;
    }
    async getBlogById(id: number) {
        const blog = await this.blogRepository.findOneBy({ id })
        if (!blog) throw new NotFoundException(NotFoundMessage.NotFoundBlog)
        return blog
    }
    async deleteBlog(id: number) {
        const blog = await this.getBlogById(id);
        await this.blogRepository.delete({ id })
        return {
            message: PublicMessages.Delete
        }
    }
    async updateBlog(id: number, updateBlogDto: UpdateBlogDto) {
        let { slug, title, content, description, image, time_for_study, categories } = updateBlogDto;
        const blog = await this.getBlogById(id)
        slug = await this.makeSlug(slug, title)
        categories = this.checkCategoryFormat(categories)
        if (slug) blog.slug = slug;
        if (title) blog.title = title;
        if (content) blog.content = content;
        if (description) blog.description = description;
        if (image) blog.image = image;
        if (time_for_study) blog.time_for_study = time_for_study;
        if (categories) {
            await this.blogCategoryRepository.delete({ blogId: blog.id })
            for (const categoryTitle of categories) {
                let category = await this.categoryService.findOneByTitle(categoryTitle)
                if (!category) {
                    category = await this.categoryService.insertCategory(categoryTitle)
                }
                await this.blogCategoryRepository.insert({
                    blogId: blog.id,
                    categoryId: category.id,
                })
            }
        }
        await this.blogRepository.save(blog);
        return {
            message: PublicMessages.Update
        }
    }
    async likeToggle(blogId: number) {
        const { id: userId } = this.request?.user
        await this.getBlogById(blogId)
        const isLiked = await this.blogLikeRepository.findOneBy({ userId, blogId })
        let message = ""
        if (isLiked) {
            this.blogLikeRepository.delete({ blogId, userId })
            message = PublicMessages.DisLike
        } else {
            this.blogLikeRepository.insert({
                blogId,
                userId
            })
            message = PublicMessages.Like
        }
        return { message }
    }
    async bookmarkToggle(blogId: number) {
        const { id: userId } = this.request?.user
        await this.getBlogById(blogId)
        const isBookmarked = await this.blogBookmarkRepository.findOneBy({ userId, blogId })
        let message = ""
        if (isBookmarked) {
            this.blogBookmarkRepository.delete({ blogId, userId })
            message = PublicMessages.UnBookmark
        } else {
            this.blogBookmarkRepository.insert({
                blogId,
                userId
            })
            message = PublicMessages.Bookmark
        }
        return { message }
    }

}

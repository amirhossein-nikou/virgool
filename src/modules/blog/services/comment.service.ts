import { BadRequestException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { IsNull, Repository } from 'typeorm';
import { BlogCommentEntity } from '../entities/comment.entity';
import { CommentDto } from '../dto/comment.dto';
import { BadRequestMessage, NotFoundMessage, PublicMessages } from 'src/common/enums/message.enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';

@Injectable({ scope: Scope.REQUEST })
export class CommentService {
    constructor(
        @InjectRepository(BlogCommentEntity) private commentRepository: Repository<BlogCommentEntity>,
        @Inject(REQUEST) private request: Request,
    ) { }

    async createComment(commentDto: CommentDto) {
        const { id: userId } = this.request?.user
        const { blogId, parentId, text } = commentDto;
        let parent = null
        if (parentId && !isNaN(parentId)) {
            parent = this.commentRepository.findOneBy({ id: parentId })
        }
        this.commentRepository.insert({
            text,
            parentId: parent ? parentId : null,
            blogId,
            accepted: true,
            userId
        })
        return {
            message: PublicMessages.Comment
        }
    }
    async getAllComments(paginationDto: PaginationDto) {
        const { limit, page, skip } = paginationSolver(paginationDto)
        const [comment, count] = await this.commentRepository.findAndCount({
            where: {},
            relations: {
                blog: true,
                user: { profile: true }
            },
            select: {
                blog: { title: true },
                user: {
                    profile: { nik_name: true },
                    username: true
                }
            },
            skip,
            take: limit
        })
        return {
            pagination: paginationGenerator(limit, page, count),
            comments: comment
        }
    }
    async getBlogComments(blogId: number, paginationDto: PaginationDto) {
        const { limit, page, skip } = paginationSolver(paginationDto)
        const [comment, count] = await this.commentRepository.findAndCount({
            where: {
                blogId,
                parent: IsNull()
            },
            relations: {
                blog: true,
                user: { profile: true },
                children: {
                    user: { profile: true },
                    children: {
                        user: { profile: true }
                    }
                }
            },
            select: {
                blog: { title: true },
                user: {
                    profile: { nik_name: true },
                    username: true
                },
                children: {
                    id: true,
                    parentId: true,
                    userId: true,
                    blogId: true,
                    text: true,
                    created_at: true,
                    user: {
                        profile: { nik_name: true },
                        username: true
                    },
                    children: {
                        id: true,
                        parentId: true,
                        userId: true,
                        blogId: true,
                        text: true,
                        created_at: true,
                        user: {
                            profile: { nik_name: true },
                            username: true
                        },
                    }
                }
            },
            skip,
            take: limit
        })
        return {
            pagination: paginationGenerator(limit, page, count),
            comments: comment
        }
    }
    async checkExistCommentById(id: number) {
        const comment = await this.commentRepository.findOneBy({ id })
        if (!comment) throw new NotFoundException(NotFoundMessage.NotFoundComment);
        return comment;

    }
    async acceptComment(id: number) {
        const comment = await this.checkExistCommentById(id);
        if (comment.accepted) {
            throw new BadRequestException(BadRequestMessage.AlreadyAccepted)
        }
        comment.accepted = true
        this.commentRepository.save(comment);
        return {
            message: PublicMessages.AcceptComment
        }
    }
    async rejectComment(id: number) {
        const comment = await this.checkExistCommentById(id);
        if (!comment.accepted) {
            throw new BadRequestException(BadRequestMessage.AlreadyRejected)
        }
        comment.accepted = false
        this.commentRepository.save(comment);
        return {
            message: PublicMessages.RejectComment
        }
    }
}

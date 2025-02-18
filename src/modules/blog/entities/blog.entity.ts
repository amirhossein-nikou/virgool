import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, UpdateDateColumn } from "typeorm";
import { StatusEnum } from "../enums/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BlogLikeEntity } from "./like.entity";
import { BlogBookmarkEntity } from "./bookmark.entity";
import { BlogCommentEntity } from "./comment.entity";
import { BlogCategoryEntity } from "./blog-category.entity";

@Entity(EntityName.Blog)
export class BlogEntity extends BaseEntity {
    @Column()
    title: string
    @Column()
    description: string
    @Column()
    content: string
    @Column({ nullable: true })
    image: string
    @Column({ default: StatusEnum.Draft })
    status: StatusEnum
    @Column()
    slug: string
    @Column()
    time_for_study: string
    @Column()
    authorId: number 
    @ManyToOne(() => UserEntity, user => user.blog, { onDelete: "CASCADE" })
    author: UserEntity
    @OneToMany(() => BlogLikeEntity, likes => likes.blog)
    likes: BlogLikeEntity[]
    @OneToMany(() => BlogBookmarkEntity, bookmarks => bookmarks.blog)
    bookmarks: BlogBookmarkEntity[]
    @OneToMany(() => BlogCommentEntity, comments => comments.blog)
    comments: BlogCommentEntity[]
    @OneToMany(() => BlogCategoryEntity, category => category.blog)
    categories: BlogCategoryEntity[]
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date

}
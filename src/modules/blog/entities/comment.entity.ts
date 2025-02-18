import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity(EntityName.BlogComment)
export class BlogCommentEntity extends BaseEntity {
    @Column()
    text: string
    @Column({ default: false })
    accepted: boolean
    @Column()
    userId: number
    @Column()
    blogId: number
    @Column({nullable: true})
    parentId: number
    //relations
    @ManyToOne(() => UserEntity, user => user.blog_comments, { onDelete: "CASCADE" })
    user: UserEntity
    @ManyToOne(() => BlogEntity, blog => blog.comments)
    blog: BlogEntity
    
    @ManyToOne(() => BlogCommentEntity, parent => parent.children)
    parent: BlogCommentEntity
    @OneToMany(() => BlogCommentEntity, comment => comment.parent)
    @JoinColumn({name: "parent"})
    children: BlogCommentEntity[]

    @CreateDateColumn()
    created_at: Date
}
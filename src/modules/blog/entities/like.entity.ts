import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity(EntityName.BlogLike)
export class BlogLikeEntity extends BaseEntity{
    @Column()
    userId: number
    @Column()
    blogId: number
    @ManyToOne(() => UserEntity, user => user.blogLikes ,{onDelete:"CASCADE"})
    user: UserEntity
    @ManyToOne(() => BlogEntity, blog => blog.likes,{onDelete:"CASCADE"})
    blog: BlogEntity
}
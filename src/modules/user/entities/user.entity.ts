import { BlogCommentEntity } from "src/modules/blog/entities/comment.entity";
import { BlogEntity } from "src/modules/blog/entities/blog.entity";
import { BlogBookmarkEntity } from "src/modules/blog/entities/bookmark.entity";
import { BlogLikeEntity } from "src/modules/blog/entities/like.entity";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, UpdateDateColumn } from "typeorm";
import { OtpEntity } from "./otp.entity";
import { ProfileEntity } from "./profile.entity";
import { ImageEntity } from "src/modules/image/entities/image.entity";
import { RolesEnum } from "src/common/enums/roles.enum";
import { FollowEntity } from "./follow.entity";
import { UserStatus } from "../enum/status.enum";

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
    @Column({ unique: true, nullable: true })
    username: string
    @Column({ unique: true, nullable: true })
    email: string
    @Column({ nullable: true })
    new_email: string
    @Column({ nullable: true })
    mobile: string
    @Column({ nullable: true })
    new_mobile: string
    @Column({ nullable: true, default: false })
    verify_mobile: boolean
    @Column({ nullable: true, default: false })
    verify_email: boolean
    @Column({ nullable: true })
    password: string
    @Column({ nullable: true, type: "numeric", default: 0 })
    balance: number
    @Column({ default: RolesEnum.User })
    role: RolesEnum
    @Column({ nullable: true })
    otpId: number
    @OneToOne(() => OtpEntity, otp => otp.user, { nullable: true })
    @JoinColumn()
    otp: OtpEntity
    @Column({ nullable: true })
    profileId: number
    @Column({ nullable: true })
    status: UserStatus
    @OneToOne(() => ProfileEntity, profile => profile.user)
    @JoinColumn()
    profile: ProfileEntity
    @OneToMany(() => BlogEntity, blog => blog.author)
    blog: BlogEntity[]
    @OneToMany(() => BlogLikeEntity, blogLike => blogLike.user)
    blogLikes: BlogLikeEntity[]
    @OneToMany(() => ImageEntity, image => image.user)
    images: ImageEntity[]
    @OneToMany(() => BlogBookmarkEntity, blogBookmarks => blogBookmarks.user)
    blogBookmarks: BlogBookmarkEntity[]
    @OneToMany(() => BlogCommentEntity, blog_comments => blog_comments.user)
    blog_comments: BlogCommentEntity[]
    @OneToMany(() => FollowEntity, follow => follow.following)
    followers: FollowEntity[]
    @OneToMany(() => FollowEntity, follow => follow.follower)
    followings: FollowEntity[]
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    update_at: Date

}

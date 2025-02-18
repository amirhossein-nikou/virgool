import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityName.Profile)
export class ProfileEntity extends BaseEntity {
    @Column()
    nik_name: string
    @Column({ nullable: true })
    bio: string
    @Column({ nullable: true })
    profile_image: string
    @Column({ nullable: true })
    bg_image: string
    @Column({ nullable: true })
    gender: string
    @Column({ nullable: true })
    birthday: Date
    @Column({ nullable: true })
    x_profile: string
    @Column({ nullable: true })
    linkedIn_profile: string

    @Column({ nullable: true })
    userId: number
    @OneToOne(() => UserEntity, user => user.profile, { onDelete: "CASCADE" })
    user: UserEntity

}
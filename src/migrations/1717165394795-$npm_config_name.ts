import { get } from "http";
import { Interface } from "readline";
import { EntityName } from "src/common/enums/entity.enum";
import { ForeignKeyEnum } from "src/common/enums/foreign-key.enum";
import { RolesEnum } from "src/common/enums/roles.enum";
import { Genders } from "src/modules/user/enum/gender.enum";
import { UserStatus } from "src/modules/user/enum/status.enum";
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class $npmConfigName1717165394795 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        //create tables
        await queryRunner.createTable(this.userTable(), true)
        await queryRunner.createTable(this.profileTable(), true)
        await queryRunner.createTable(this.blogTable(), true)
        await queryRunner.createTable(this.imageTable(), true);
        await queryRunner.createTable(this.categoryTable(), true);
        await queryRunner.createTable(this.likeOrBookmarkTable(EntityName.BlogLike), true);
        await queryRunner.createTable(this.likeOrBookmarkTable(EntityName.BlogBookmark), true);
        await queryRunner.createTable(this.commentTable(), true);
        await queryRunner.createTable(this.BlogCategoryTable(), true);
        await queryRunner.createTable(this.commentTable(), true);

        const balance = await queryRunner.hasColumn(EntityName.User, "balance")
        //@ts-ignore
        if (!balance) await queryRunner.addColumn(EntityName.User, { name: "balance", type: "numeric", default: 0, isNullable: true })

        // const username = await queryRunner.hasColumn(EntityName.User, "username")
        // if (username) {
        //     //@ts-ignore
        //     await queryRunner.changeColumn(EntityName.User, "username", new TableColumn(
        //         { name: "username", type: "varchar(50)", isNullable: false, isUnique: true }
        //     ))
        // } 
        //await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "mobile" TO "phone"`) //this query change column name
        const {
            ProfileFk, BlogBookmarkFk, BlogCategoryFk, BlogFk, BlogLikeFk,
            CategoryFk, CommentBlogFk, CommentParentFk, CommentUserFk, ImageFk,
            UserBookmarkFk, UserFk, UserLikeFk
        } = await this.getFkObject(queryRunner)
        if (!ProfileFk) {
            await queryRunner.createForeignKey(EntityName.Profile,
                new TableForeignKey({
                    columnNames: ['userId'],
                    referencedColumnNames: ['id'],
                    referencedTableName: EntityName.User,
                    onDelete: "CASCADE"
                })
            )
        }
        if (!UserFk) {
            await queryRunner.createForeignKey(EntityName.User,
                new TableForeignKey({
                    columnNames: ['profileId'],
                    referencedColumnNames: ['id'],
                    referencedTableName: EntityName.Profile
                })
            )
        }
        if (!BlogFk) {
            await queryRunner.createForeignKey(EntityName.Blog, new TableForeignKey({
                columnNames: ["authorId"],
                referencedColumnNames: ['id'],
                referencedTableName: EntityName.User,
                onDelete: "CASCADE"
            }))
        }
        if (!ImageFk) {
            await queryRunner.createForeignKey(EntityName.Image, new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: EntityName.User,
                onDelete: "CASCADE"
            }))
        }
        if (!UserLikeFk && !BlogLikeFk) {
            await queryRunner.createForeignKeys(EntityName.BlogLike, [
                new TableForeignKey({
                    columnNames: ["userId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: EntityName.User,
                    onDelete: "CASCADE"
                }),
                new TableForeignKey({
                    columnNames: ["blogId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: EntityName.Blog,
                    onDelete: "CASCADE"
                })
            ])
        }
        if (!BlogBookmarkFk && !UserBookmarkFk) {
            await queryRunner.createForeignKeys(EntityName.BlogBookmark, [
                new TableForeignKey({
                    columnNames: ["userId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: EntityName.User,
                    onDelete: "CASCADE"
                }),
                new TableForeignKey({
                    columnNames: ["blogId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: EntityName.Blog,
                    onDelete: "CASCADE"
                })
            ])
        }
        if (!BlogCategoryFk && !CategoryFk) {
            await queryRunner.createForeignKeys(EntityName.BlogCategory, [
                new TableForeignKey({
                    columnNames: ["blogId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: EntityName.Blog,
                    onDelete: "CASCADE"
                }),
                new TableForeignKey({
                    columnNames: ["categoryId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: EntityName.Category,
                    onDelete: "CASCADE"
                })
            ])
        }
        if (!CommentBlogFk && !CommentParentFk && !CommentUserFk) {
            await queryRunner.createForeignKeys(EntityName.BlogComment, [
                new TableForeignKey({
                    columnNames: ["blogId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: EntityName.Blog,
                    onDelete: "CASCADE"
                }),
                new TableForeignKey({
                    columnNames: ["userId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: EntityName.User,
                    onDelete: "CASCADE"
                }),
                new TableForeignKey({
                    columnNames: ["parentId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: EntityName.BlogComment,
                    onDelete: "CASCADE"
                })
            ])
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const {
            ProfileFk, BlogBookmarkFk, BlogCategoryFk, BlogFk, BlogLikeFk,
            CategoryFk, CommentBlogFk, CommentParentFk, CommentUserFk, ImageFk,
            UserBookmarkFk, UserFk, UserLikeFk
        } = await this.getFkObject(queryRunner)
        //const userTable = queryRunner.hasTable(EntityName.User) // check exists with if(userTable)->22
        //await queryRunner.dropColumn(EntityName.User,"balance")
        // const user = await queryRunner.getTable(EntityName.User);
        // if (user) {
        //     const profileFk = user?.foreignKeys.find(fk => fk.columnNames.indexOf("profileId") !== -1)
        //     if (profileFk) {
        //         await queryRunner.dropForeignKey(EntityName.User, profileFk)
        //     }
        // }
        await queryRunner.dropForeignKey(EntityName.User,UserFk)
        //user
        // const profile = await queryRunner.getTable(EntityName.Profile);
        // if (profile) {
        //     const userFk = profile?.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1)
        //     if (userFk) {
        //         await queryRunner.dropForeignKey(EntityName.Profile, userFk)
        //     }
        // }
        await queryRunner.dropForeignKey(EntityName.Profile,ProfileFk)
        await queryRunner.dropForeignKey(EntityName.Blog, BlogFk)
        await queryRunner.dropForeignKey(EntityName.Image, ImageFk)
        await queryRunner.dropForeignKeys(EntityName.BlogLike, [UserLikeFk, BlogLikeFk])
        await queryRunner.dropForeignKeys(EntityName.BlogBookmark, [UserBookmarkFk, BlogBookmarkFk])
        await queryRunner.dropForeignKeys(EntityName.BlogCategory, [BlogCategoryFk,CategoryFk])
        await queryRunner.dropForeignKeys(EntityName.BlogComment, [
            CommentParentFk, CommentUserFk, CommentBlogFk
        ])


        //await queryRunner.dropForeignKey(EntityName.Image,await this.getFk(queryRunner,EntityName.Image,"userId"))
        await queryRunner.dropTable(EntityName.Blog, true)
        await queryRunner.dropTable(EntityName.Image, true)
        await queryRunner.dropTable(EntityName.BlogComment, true)
        await queryRunner.dropTable(EntityName.BlogLike, true)
        await queryRunner.dropTable(EntityName.BlogBookmark, true)
        await queryRunner.dropTable(EntityName.Category, true)
        await queryRunner.dropTable(EntityName.BlogCategory, true)
        await queryRunner.dropTable(EntityName.User, true)
        await queryRunner.dropTable(EntityName.Profile, true)
    }


    //utils
    private async getFk(queryRunner: QueryRunner, entity: EntityName, indexOf: string): Promise<TableForeignKey> {
        const table = await queryRunner.getTable(entity);
        if (table) {
            const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf(indexOf) !== -1)
            return foreignKey
        }
    }
    private userTable(): Table {
        return new Table({
            name: EntityName.User,
            columns: [
                { name: "id", isPrimary: true, type: "serial", isNullable: false },
                { name: "username", type: "varchar(50)", isNullable: true, isUnique: true },
                { name: "email", type: "character varying(100)", isNullable: true, isUnique: true },
                { name: "phone", type: "character varying(12)", isNullable: true, isUnique: true },
                { name: "profileId", type: "int", isNullable: true, isUnique: true },
                { name: "status", type: "enum", isNullable: true, enum: [UserStatus.Block, UserStatus.Report] },
                { name: "role", type: "enum", enum: [RolesEnum.Admin, RolesEnum.User], isNullable: true },
                { name: "new_email", type: "varchar(100)", isNullable: true },
                { name: "new_phone", type: "varchar(12)", isNullable: true },
                { name: "verify_email", type: "boolean", isNullable: true, default: false },
                { name: "verify_phone", type: "boolean", isNullable: true, default: false },
                { name: "created_at", type: "timestamp", default: "now()" }
            ]
        })
    }
    private profileTable(): Table {
        return new Table({
            name: EntityName.Profile,
            columns: [
                { name: "id", type: "int", isNullable: false, isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "nik_name", type: "varchar(50)" },
                { name: "bio", type: "varchar(255)", isNullable: true },
                { name: "profile_image", type: "varchar", isNullable: true },
                { name: "bg_image", type: "varchar", isNullable: true },
                { name: "gender", type: "enum", enum: [Genders.Female, Genders.Male, Genders.Others], isNullable: true },
                { name: "birthday", type: "timestamp", isNullable: true },
                { name: "x_profile", type: "varchar", isNullable: true },
                { name: "linkedin_profile", type: "varchar", isNullable: true },
                { name: "userId", type: "int", isNullable: true, isUnique: true },
            ]
        })
    }
    private imageTable(): Table {
        return new Table({
            name: EntityName.Image,
            columns: [
                { name: "id", isPrimary: true, type: "serial", isNullable: false },
                { name: "location", type: "varchar", isNullable: false },
                { name: "alt", type: "varchar", isNullable: false },
                { name: "userId", type: "int", isNullable: false },
                { name: "created_at", type: "timestamp", isNullable: false, default: "now()" },
            ],
        })
    }
    private blogTable(): Table {
        return new Table({
            name: EntityName.Blog,
            columns: [
                { name: "id", isPrimary: true, type: "serial", isNullable: false },
                { name: "title", type: "varchar(150)", isNullable: false },
                { name: "description", type: "varchar(300)", isNullable: false },
                { name: "content", type: "text", isNullable: false },
                { name: "slug", type: "varchar", isNullable: false },
                { name: "image", type: "varchar", isNullable: true },
                { name: "time_for_study", type: "varchar(15)", isNullable: false },
                { name: "authorId", type: "int", isNullable: false },
            ]
        })
    }
    private likeOrBookmarkTable(entity: EntityName): Table {
        return new Table({
            name: entity,
            columns: [
                { name: "id", isPrimary: true, type: "serial", isNullable: false },
                { name: "userId", type: "int", isNullable: false },
                { name: "blogId", type: "int", isNullable: false },
            ]
        })
    }
    private BlogCategoryTable(): Table {
        return new Table({
            name: EntityName.BlogCategory,
            columns: [
                { name: "id", isPrimary: true, type: "serial", isNullable: false },
                { name: "blogId", type: "int", isNullable: false },
                { name: "categoryId", type: "int", isNullable: false },
            ]
        })
    }
    private commentTable(): Table {
        return new Table({
            name: EntityName.BlogComment,
            columns: [
                { name: "id", isPrimary: true, type: "serial", isNullable: false },
                { name: "text", type: "varchar", isNullable: false },
                { name: "accepted", type: "boolean", isNullable: false, default: false },
                { name: "userId", type: "int", isNullable: false },
                { name: "blogId", type: "int", isNullable: false },
                { name: "parentId", type: "int", isNullable: true },
                { name: "created_at", type: "timestamp", default: "now()" }
            ]
        })
    }
    private categoryTable(): Table {
        return new Table({
            name: EntityName.Category,
            columns: [
                { name: "id", isPrimary: true, type: "serial", isNullable: false },
                { name: "title", type: "varchar", isNullable: false },
                { name: "priority", type: "int", isNullable: true },
            ]
        })
    }
    // private async getFkByName(queryRunner: QueryRunner, fkName: ForeignKeyEnum) {
    //     switch (fkName) {
    //         case ForeignKeyEnum.ProfileFk:
    //             return this.getFk(queryRunner, EntityName.Profile, "userId")
    //         case ForeignKeyEnum.UserFk:
    //             return this.getFk(queryRunner, EntityName.User, "profileId")
    //         case ForeignKeyEnum.BlogFk:
    //             return this.getFk(queryRunner, EntityName.Blog, "authorId")
    //         case ForeignKeyEnum.ImageFk:
    //             return this.getFk(queryRunner, EntityName.Image, "userId")
    //         //likes
    //         case ForeignKeyEnum.UserLikeFk:
    //             return this.getFk(queryRunner, EntityName.BlogLike, "userId")
    //         case ForeignKeyEnum.BlogLikeFk:
    //             return this.getFk(queryRunner, EntityName.BlogLike, "blogId")
    //         //bookmarks
    //         case ForeignKeyEnum.UserBookmarkFk:
    //             return this.getFk(queryRunner, EntityName.BlogBookmark, "userId")
    //         case ForeignKeyEnum.BlogBookmarkFk:
    //             return this.getFk(queryRunner, EntityName.BlogBookmark, "blogId")
    //         //categories
    //         case ForeignKeyEnum.BlogCategoryFk:
    //             return this.getFk(queryRunner, EntityName.BlogCategory, "blogId")
    //         case ForeignKeyEnum.CategoryFk:
    //             return this.getFk(queryRunner, EntityName.BlogCategory, "categoryId")
    //         //comments
    //         case ForeignKeyEnum.CommentParentFk:
    //             return this.getFk(queryRunner, EntityName.BlogComment, "parentId")
    //         case ForeignKeyEnum.CommentUserFk:
    //             return this.getFk(queryRunner, EntityName.BlogComment, "userId")
    //         case ForeignKeyEnum.CommentBlogFk:
    //             return this.getFk(queryRunner, EntityName.BlogComment, "blogId")
    //     }
    // }
    private async getFkObject(queryRunner: QueryRunner) {
        return {
            ProfileFk: await this.getFk(queryRunner, EntityName.Profile, "userId"),
            UserFk: await this.getFk(queryRunner, EntityName.User, "profileId"),
            BlogFk: await this.getFk(queryRunner, EntityName.Blog, "authorId"),
            ImageFk: await this.getFk(queryRunner, EntityName.Image, "userId"),
            //likes
            UserLikeFk: await this.getFk(queryRunner, EntityName.BlogLike, "userId"),
            BlogLikeFk: await this.getFk(queryRunner, EntityName.BlogLike, "blogId"),
            //bookmarks
            UserBookmarkFk: await this.getFk(queryRunner, EntityName.BlogBookmark, "userId"),
            BlogBookmarkFk: await this.getFk(queryRunner, EntityName.BlogBookmark, "blogId"),
            //categories
            BlogCategoryFk: await this.getFk(queryRunner, EntityName.BlogCategory, "blogId"),
            CategoryFk: await this.getFk(queryRunner, EntityName.BlogCategory, "categoryId"),
            //comments
            CommentParentFk: await this.getFk(queryRunner, EntityName.BlogComment, "parentId"),
            CommentUserFk: await this.getFk(queryRunner, EntityName.BlogComment, "userId"),
            CommentBlogFk: await this.getFk(queryRunner, EntityName.BlogComment, "blogId"),
        }
    }
}

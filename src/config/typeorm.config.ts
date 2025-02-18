import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
/* @Injectable()
export class TypeormDbConfig implements TypeOrmOptionsFactory {
    //constructor(private configService: ConfigService) { }
    createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
        const { DB_PORT, DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USERNAME } = process.env
        return {
            type: "postgres",
            host: DB_HOST,//this.configService.get("Db.hostname"),
            database: DB_DATABASE,//this.configService.get("Db.database"),
            password: DB_PASSWORD,//this.configService.get("Db.password"),
            username: DB_USERNAME,//this.configService.get("Db.username"),
            port: DB_PORT, //this.configService.get("Db.port"),
            synchronize: true,
            autoLoadEntities: true
        }
    }

} */

export function TypeOrmConfig(): TypeOrmModuleOptions{
    const { DB_PORT, DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USERNAME } = process.env
        return {
            type: "postgres",
            host: DB_HOST,//this.configService.get("Db.hostname"),
            database: DB_DATABASE,//this.configService.get("Db.database"),
            password: DB_PASSWORD,//this.configService.get("Db.password"),
            username: DB_USERNAME,//this.configService.get("Db.username"),
            port: DB_PORT, //this.configService.get("Db.port"),
            synchronize: false,
            autoLoadEntities: true
        }
}
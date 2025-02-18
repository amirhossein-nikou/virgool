import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: join(process.cwd(),".env"),
            isGlobal: true
        })
    ]
})
export class CostumeConfigModule { }
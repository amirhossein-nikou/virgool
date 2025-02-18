import { config } from "dotenv";
import { DataSource } from "typeorm";
config()
const {DB_DATABASE,DB_HOST,DB_PASSWORD,DB_PORT,DB_USERNAME} = process.env

const dataSource = new DataSource({
    type:"postgres",
    password:DB_PASSWORD,
    username: DB_USERNAME,
    port:+DB_PORT,
    host:DB_HOST,
    database:DB_DATABASE,
    synchronize: false,
    entities:[
        "dist/**/**/**/*.entity{.ts,.js}",
        "dist/**/**/*.entity{.ts,.js}"
    ],
    migrations:[
        "dist/migrations/*{.js,.ts}"
    ],
    migrationsTableName: "virgool_migration_db"
})
export default dataSource
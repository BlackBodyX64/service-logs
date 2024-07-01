import "reflect-metadata"
import dotenv from 'dotenv'
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenv.config()

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE,
    entities: process.env.NODE_ENV === 'production' ? ['./dist/entities/*.js'] : ['./src/entities/*.ts'],
    migrations: process.env.NODE_ENV === 'production' ? ['./dist/migrations/*.js'] : ['./src/migrations/*.ts'],
    migrationsTableName: 'migrations',
    namingStrategy: new SnakeNamingStrategy(),
    logging: true,
    synchronize: false,
    extra: {
        decimalNumbers: true
    }
})
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { DataSource } from 'typeorm'
import ScheduleUtils from './utils/ScheduleUtils'
import routes from './routes'
import dbServer from './utils/DataSource'
declare global {
    var DB: DataSource
}

const server = express()
server.use(cors())
server.use(bodyParser.json({limit: '1mb'}))
server.use(routes)

dotenv.config()

const start = async () => {

    dbServer.initialize().then(async (db) => {
        console.log('Database initialized')
        globalThis.DB = db
        
        await ScheduleUtils.cronStart()
        server.listen(process.env.PORT, () => {
            console.log(`Server is running at https://localhost:${process.env.PORT}`);
        })
    })
}

start()
import { CronJob as cronJob } from 'cron'
import { updateLog } from '../controllers/LogController'

export default class Schedule {

    public static async cronStart () {
        new cronJob('0 * * * *', updateLog).start()
    }
}
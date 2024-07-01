import { CronJob as cronJob } from 'cron'
import { updateLog, autoPushToKlock } from '../controllers/LogController'

export default class Schedule {

    public static async cronStart () {
        new cronJob('15 * * * *', updateLog).start()
        new cronJob('45 * * * *', autoPushToKlock).start()
    }
}
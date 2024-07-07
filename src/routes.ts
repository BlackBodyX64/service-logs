import { Router, Request, Response } from 'express'
import * as LogController from './controllers/LogController'

const router = Router()

// router.all('*', (_: Request, res: Response) => {
//     return res.send(`You have no permission to access this content. Service version: 1.0.0`)
// })

router.post('/sync-log', LogController.syncUpdateLog)
router.post('/sync-force', LogController.autoPushToKlock)

export default router
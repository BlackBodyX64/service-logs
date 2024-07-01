import fs from "fs"
import { Request, Response } from "express"
import { PunchLog, StatusLog } from "../entities"
import { LogStatus } from "../enumerate/LogStatus"
import deviceUtils from "../utils/DeviceUtils"
import dateTimeUtils from "../utils/DateTimeUtils"
import { BodyResponse, ResponseStatus } from "../interface"
import { IsNull } from "typeorm"
import klockService, { KlockAlarm } from "../utils/KlockService"

export const updateLog = async (startStr: string | null = null, endStr: string | null = null) => {
    console.log('LogController.updateLog - entering function')
    try {
        const deviceList = JSON.parse(fs.readFileSync(`${process.env.FILE_DEVICE_LIST}`, 'utf-8'))

        const now = new Date(dateTimeUtils.getNowDatetime())
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

        // format date ex start: 2023-05-02T08:00:00+07:00, end: 2023-05-02T23:59:59+07:00
        const startDate = startStr ?? dateTimeUtils.getNowDateTimeStr(oneHourAgo)
        const endDate = endStr ?? dateTimeUtils.getNowDateTimeStr(now)
        console.log(`LogController.updateLog - retrieving log of date "${startDate}" | "${endDate}" from ${deviceList.length} devices`)

        const statusLogs = await globalThis.DB.getRepository(StatusLog).find({ where: { endDate: startDate } })
        const devices = []
        for (const device of deviceList) {
            let start = startDate
            const data = statusLogs.find(v => v.device === device.serialNumber)
            if (data && data.status === LogStatus.FAILED) {
                start = data.startDate
            }

            devices.push({
                serialNumber: device.serialNumber,
                ip: device.ip,
                username: device.username,
                password: device.password,
                location: `${device.deviceName}|${device.location}`,
                startDate: start,
                endDate: endDate
            })
        }

        const { updateStatusLog, updatePunchLogList } = await deviceUtils.getListUpdatePunchLog(devices)

        await globalThis.DB.manager.save(updateStatusLog)
        await globalThis.DB.manager.save(updatePunchLogList)

    } catch (error: any) {
        let stack = error.stack ? error.stack : error.message
        console.log('LogController.updateLog - Something went wrong')
        console.log(stack)
        return
    }

    console.log('LogController.updateLog - leaving function')
    return
}

export const syncUpdateLog = async (req: Request, res: Response) => {
    // format date ex start: 2023-05-02T08:00:00+07:00, end: 2023-05-02T23:59:59+07:00
    const response: BodyResponse = {
        status: ResponseStatus.OK
    }
    const { startDate, endDate } = req.body

    try {
        if (!startDate || !endDate) {
            console.log('LogController.syncUpdateLog - Invalid key value')
            response.status = ResponseStatus.ERROR
            response.msg = 'Invalid key value'
            return res.json(response)
        }

        await updateLog(startDate, endDate)
    } catch (error: any) {
        console.log('LogController.syncUpdateLog - error: ' + error.message)
        console.log(error.stack)

        response.status = ResponseStatus.ERROR
        response.msg = error.message
        return res.json(response)
    }

    return res.json(response)
}

export const autoPushToKlock = async () => {
    console.log('Start AutoPushToKlock');
    try {
        const deviceList: any[] = JSON.parse(fs.readFileSync(`${process.env.FILE_DEVICE_LIST}`, 'utf-8'))

        const punchLogs = await globalThis.DB.getRepository(PunchLog).find({ where: { submitted: IsNull() } })

        const succ: PunchLog[] = []
        for (const punchLog of punchLogs) {
            const serialNumber = punchLog.location.split('|')[0]
            // const device = deviceList.find(d => d.serialNumber == serialNumber)
            // if (!device) {
            //     console.log(`serialNumber: ${serialNumber} not found`);
            //     continue
            // }

            const imgBase64 = await deviceUtils.getImage(punchLog.pic)
            if (!imgBase64) {
                console.log('can not get image from device');
                continue
            }

            const data: KlockAlarm = {
                user: punchLog.employeeNo,
                pic: imgBase64,
                cameraName: "",
                time: `${punchLog.date} ${punchLog.time}`,
                temperature: punchLog.temp
            }

            const result = await klockService.pushToKlock(data)
            if (result == 'ok') {
                punchLog.submitted = new Date()
                succ.push(punchLog)
            }
        }

        await globalThis.DB.manager.save(succ)
    } catch (error) {
        console.log(error)
        return
    }
}
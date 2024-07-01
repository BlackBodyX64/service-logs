
import axios from 'axios'
import CryptoJS from 'crypto-js'
import DateTimeUtils from '../utils/DateTimeUtils'
import { v4 as uuidV4 } from 'uuid'
import { LogStatus } from '../enumerate/LogStatus'
import { PunchLog, StatusLog } from '../entities'

let responseList: any[] = []
let mapper: any = {}
const MAX_ITEM_PER_REQUEST = 30

const challenge = (method: string, url: string, data: any = null) => new Promise((resolve, reject) => {
    axios({ method, url, data, timeout: 5000 }).catch(error => {
        if (error && error.response && error.response.status === 401) {
            const authDetails = error.response.headers['www-authenticate'].split(', ').map((v: any) => {
                const splitIndex = v.indexOf('=')
                return [ v.substring(0, splitIndex), v.substring(splitIndex + 1, v.length) ]
            })

            resolve(authDetails)
        } else {
            reject(error)
        }
    })
})

const HikIsApiRequest = async (method: string, base: string, uri: string, username: string, password: string, data: any = null) => {
    const url = `${base}${uri}`
    const authDetails: any = await challenge(method, url, data)
    const qop = authDetails[0][1].replace(/"/g, '')
    const realm = authDetails[1][1].replace(/"/g, '')
    const nonce = authDetails[2][1].replace(/"/g, '')
    const nonceCount = '00000001'
    const cNonce = CryptoJS.lib.WordArray.random(8)
    const HA1 = CryptoJS.MD5(`${username}:${realm}:${password}`).toString()
    const HA2 = CryptoJS.MD5(`${method}:${uri}`).toString()
    const response = CryptoJS.MD5(`${HA1}:${nonce}:${nonceCount}:${cNonce}:${qop}:${HA2}`).toString()
    const authorization = `Digest username="${username}", realm="${realm}", ` +
        `nonce="${nonce}", uri="${uri}", response="${response}", ` +
        `qop="${qop}", nc=${nonceCount}, cnonce="${cNonce}"`

    return axios({ method, url, data, headers: { Authorization: authorization }, timeout: 10000})
}

const getDeviceLog = async (device: any, startDate: string, endDate: string, offset: number = 0) => {
    console.log(`DeviceUtils.getDeviceLog - device: ${device.serialNumber}, offset: ${offset} Padding`)

    const searchId = uuidV4()
    mapper[device.serialNumber].push({ page: offset / MAX_ITEM_PER_REQUEST, searchId })

    const uri = '/ISAPI/AccessControl/AcsEvent?format=json'
    const data = {
        AcsEventCond: {
            searchID: searchId,
            searchResultPosition: offset,
            maxResults: MAX_ITEM_PER_REQUEST,
            major: 5,
            minor: 75,
            startTime: startDate,
            endTime: endDate
        }
    }

    let res = null
    try {
        if (offset === 0) {
            res = await HikIsApiRequest('POST', `http://${device.ip}`, uri, device.username, device.password, data)
            if (device.serialNumber === 'F25181427') {
                console.log(JSON.stringify(res))
            }

            if (res && res.status === 200) {
                let total = res.data.AcsEvent.totalMatches
                let listOffset = MAX_ITEM_PER_REQUEST
                console.log(
                    `DeviceUtils.getDeviceLog - device: "${device.serialNumber}" | log count: ${total} | more loop: ${total > listOffset}`
                )
                while (total > listOffset) {
                    const res2 = await getDeviceLog(device, startDate, endDate, listOffset)
                    listOffset += MAX_ITEM_PER_REQUEST
                    responseList.push(res2)
                }
                responseList.push(res)
            }
        } else {
            res = HikIsApiRequest('POST', `http://${device.ip}`, uri, device.username, device.password, data)
        }
    } catch (error: any) {
        console.log(`DeviceUtils.getDeviceLog - device: ${device.serialNumber} offset: ${offset}, error: ${error}`)
        return null
    }

    console.log(`DeviceUtils.getDeviceLog - device: ${device.serialNumber}, offset: ${offset} Success`)
    return res

}

const transFromData = (devices: any, logDevices: any) => {
    console.log('DeviceUtils.transFromData - entering function')
    const updateStatusLog: StatusLog[] = []
    const updatePunchLogList: PunchLog[] = []

    const now = new Date(DateTimeUtils.getNowDatetime())
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    for (const device of devices) {
        const logList = logDevices[device.serialNumber]
        const status = (logList.length === 1 && logList[0] === 'failed')? LogStatus.FAILED: LogStatus.SUCCESS

        let startDate = device.startDate

        // validate new date and set start time
        // when new date set time 00:00:00 and new date
        const isNewDate = validateNewDate(oneHourAgo)
        if (isNewDate) {
            startDate = DateTimeUtils.getNowDateTimeStr(oneHourAgo)
        }

        const statusLog = new StatusLog()
        statusLog.device = device.serialNumber
        statusLog.endDate = device.endDate

        if (status === LogStatus.FAILED) {
            statusLog.startDate = startDate
            statusLog.status = status
            statusLog.fixedCount = '0'
            updateStatusLog.push(statusLog)
            continue
        }

        const punchLogList = setPunchLogDefault(device.location, statusLog, logList)
        statusLog.startDate = device.startDate
        statusLog.status = status
        statusLog.fixedCount = logList.length

        updateStatusLog.push(statusLog)
        updatePunchLogList.push(...punchLogList)
    }

    console.log('DeviceUtils.transFromData - leaving function')

    return { updateStatusLog, updatePunchLogList }
}

const validateNewDate = (date: Date) => {
    let isNewDate = false
    const hour = date.getHours()
    const minute = date.getMinutes()

    if (hour === 7 && minute === 0) {
        isNewDate = true
    }

    return isNewDate
}

const setPunchLogDefault = (location:string, statusLog: any = null, logList: any) => {
    const updatePunchLog: PunchLog[] = []
    for (const log of logList) {
        let temp = 0
        if (log.currTemperature) {
            temp = log.currTemperature
        }

        const { date, time } = DateTimeUtils.convertDateTimeStr(log.time)
        const punchLog = new PunchLog()
        if (statusLog) {
            punchLog.statusLog = statusLog
        }
        punchLog.employeeNo = log.employeeNoString
        punchLog.date = date
        punchLog.time = time
        punchLog.temp = `${temp}`
        punchLog.location = location
        punchLog.pic = log.pictureURL
        updatePunchLog.push(punchLog)
    }

    return updatePunchLog
}

const getListUpdatePunchLog = async (devices: any) => {
    const waitingList = []
    responseList = []
    mapper = {}

    try {
        for (const device of devices) {
            mapper[device.serialNumber] = []
            const res = getDeviceLog(device, device.startDate, device.endDate)
            waitingList.push(res)
        }

        console.log(`DeviceUtils.getListUpdatePunchLog - waiting for log retrieving . . .`)
        await Promise.all(waitingList)
        console.log(`DeviceUtils.getListUpdatePunchLog - mapper: ${Object.keys(mapper).length}`)
        console.log(`DeviceUtils.getListUpdatePunchLog - responseList: ${Object.keys(responseList).length}`)
    } catch (error: any) {
        console.log(`DeviceUtils.getListUpdatePunchLog - error: ${error}`)
        console.log(error.stack)
    }

    const data: any = {}
    for (const sn of Object.keys(mapper)) {
        const sortedList: any = {}

        for (const searchObj of mapper[sn]) {
            const result = responseList.find(v => v.data.AcsEvent.searchID === searchObj.searchId)
            if (result && result.data) {
                sortedList[searchObj.page] = result.data.AcsEvent.InfoList ?? []
            } else {
                sortedList[searchObj.page] = ['failed']
            }
        }

        data[sn] = <any[]> Object.values(sortedList).reduce((acc: any, v) => {
            return acc.concat(v)
        }, [])

        console.log(`DeviceUtils.getListUpdatePunchLog - sn: ${sn} data : ${data[sn].length}`)
    }

    return transFromData(devices, data)
}

const getImage = async () => {

    const response = await HikIsApiRequest('get', 'http://192.168.0.44', '/LOCALS/pic/acsLinkCap/202407_00/01_110855_30075_0.jpeg@WEB000000001986', 'admin', 'Admin@123', null)

    let base64Image = `data:${response.headers['content-type']};base64,` + Buffer.from(response.data).toString('base64');

    return base64Image
}

export default {
    getListUpdatePunchLog,
    setPunchLogDefault,
    getImage
}
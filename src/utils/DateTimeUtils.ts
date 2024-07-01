import { NullableDate, NullableNumber } from "../interface"

const localNow = (datetime: NullableDate = null): Date => {
    const now = datetime ? new Date(datetime.getTime()) : new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now
}

const getNowDatetime = (offset: NullableNumber = null): string => {
    const now = localNow()
    if (offset) {
        now.setDate(now.getDate() + offset)
    }

    return now.toISOString()
}

const getNowDateTimeStr = (date: Date): string => {
    const formattedDate = `${date.toISOString().slice(0, 19)}+07:00`
    return formattedDate
}

const getNowDate = (offset: NullableNumber | null = null): string => {
    return getNowDatetime(offset).substring(0, 10)
}

const datetimeToString = (datetime: NullableDate = null): string => {
    const str = localNow(datetime).toISOString()
    return `${str.substring(0, 10)} ${str.substring(11, 19)}`
}

const convertDateTimeStr = (datetimeStr: string): any => {
    const datetime = new Date(Date.parse(datetimeStr))

    return {
        date: `${datetime.getFullYear()}-${conventNumberToStr(datetime.getMonth() + 1)}-${conventNumberToStr(datetime.getDate())}`,
        time: `${conventNumberToStr(datetime.getHours())}:${conventNumberToStr(datetime.getMinutes())}:${conventNumberToStr(datetime.getSeconds())}`
    }
}

const conventNumberToStr = (number: number) => {
    return number < 10? `0${number}`: `${number}`
}

export default {
    localNow,
    getNowDatetime,
    getNowDate,
    datetimeToString,
    convertDateTimeStr,
    getNowDateTimeStr
}
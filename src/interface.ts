export type NullableDate = Date | null
export type NullableNumber = number | null
export type NullableString = string | null
export type LogMeta = Record<string, any> | Object | null

export enum ResponseStatus {
    OK = 'ok',
    ERROR = 'error',
    ERRORS = 'errors',
}

export interface BodyResponse {
    status: ResponseStatus
    msg?: string
    data?: any
}
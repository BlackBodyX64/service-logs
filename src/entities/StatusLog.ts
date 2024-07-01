import {
    Column,
    Entity,
    OneToMany
} from 'typeorm'
import BaseEntity from './BaseEntity'
import { LogStatus } from "../enumerate/LogStatus"
import PunchLog from './PunchLog'

@Entity()
export default class StatusLog extends BaseEntity<StatusLog> {

    @Column({ nullable: true, default: null })
    device: string

    @Column({ nullable: true, default: null })
    startDate: string

    @Column({ nullable: true, default: null })
    endDate: string

    @Column({
        type: 'enum',
        enum: LogStatus })
    status: LogStatus

    @Column({ nullable: true, default: null })
    fixedCount: string

    @OneToMany(() => PunchLog, (punchLog) => punchLog.statusLog)
    punchLogs: Promise<PunchLog[]>
}
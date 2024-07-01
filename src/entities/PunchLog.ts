import {
    Column,
    Entity,
    ManyToOne
} from 'typeorm'
import BaseEntity from './BaseEntity'
import StatusLog from './StatusLog'

@Entity()
export default class PunchLog extends BaseEntity<PunchLog> {

    @Column({ nullable: true, default: null })
    employeeNo: string

    @Column({ nullable: true, default: null })
    date: string

    @Column({ nullable: true, default: null })
    time: string

    @Column({ nullable: true, default: null })
    temp: string

    @Column({ nullable: true, default: null })
    location: string

    @Column({ type: 'text', nullable: true, default: null })
    pic: string

    @Column({ nullable: true, default: null })
    submitted: Date

    @ManyToOne(() => StatusLog, (statusLog) => statusLog.punchLogs)
    statusLog: StatusLog
}
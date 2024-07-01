import {
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm'

export default class BaseEntity<T> {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number

    @Column({ type: 'timestamptz' })
    @CreateDateColumn()
    createdDate: Date = new Date()

    @Column({ type: 'timestamptz' })
    @UpdateDateColumn()
    updatedDate: Date = new Date()
}
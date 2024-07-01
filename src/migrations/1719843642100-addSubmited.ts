import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubmited1719843642100 implements MigrationInterface {
    name = 'AddSubmited1719843642100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "punch_log" ADD "submitted" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "punch_log" DROP COLUMN "submitted"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPic1719828724047 implements MigrationInterface {
    name = 'AddPic1719828724047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "punch_log" ADD "pic" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "punch_log" DROP COLUMN "pic"`);
    }

}

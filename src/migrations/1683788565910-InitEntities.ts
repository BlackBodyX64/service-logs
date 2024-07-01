import { MigrationInterface, QueryRunner } from "typeorm";

export class InitEntities1683788565910 implements MigrationInterface {
    name = 'InitEntities1683788565910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."status_log_status_enum" AS ENUM('SUCCESS', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "status_log" ("id" BIGSERIAL NOT NULL, "created_date" TIMESTAMP NOT NULL DEFAULT now(), "updated_date" TIMESTAMP NOT NULL DEFAULT now(), "device" character varying, "start_date" character varying, "end_date" character varying, "status" "public"."status_log_status_enum" NOT NULL, "fixed_count" character varying, CONSTRAINT "PK_47ac65ae41fa92422ea43f903bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "punch_log" ("id" BIGSERIAL NOT NULL, "created_date" TIMESTAMP NOT NULL DEFAULT now(), "updated_date" TIMESTAMP NOT NULL DEFAULT now(), "employee_no" character varying, "date" character varying, "time" character varying, "temp" character varying, "location" character varying, "status_log_id" bigint, CONSTRAINT "PK_7fe245f11a1b5b8a1fd6a0b1fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "punch_log" ADD CONSTRAINT "FK_61e9fdbe535750810d5a0bc514c" FOREIGN KEY ("status_log_id") REFERENCES "status_log"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "punch_log" DROP CONSTRAINT "FK_61e9fdbe535750810d5a0bc514c"`);
        await queryRunner.query(`DROP TABLE "punch_log"`);
        await queryRunner.query(`DROP TABLE "status_log"`);
        await queryRunner.query(`DROP TYPE "public"."status_log_status_enum"`);
    }

}

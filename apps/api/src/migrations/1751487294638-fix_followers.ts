import { MigrationInterface, QueryRunner } from "typeorm";

export class FixFollowers1751487294638 implements MigrationInterface {
    name = 'FixFollowers1751487294638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_following_users" DROP CONSTRAINT "FK_776553d9d8f79e3be1e51d941b7"`);
        await queryRunner.query(`ALTER TABLE "users_following_users" DROP CONSTRAINT "FK_36135ff8c7243571f54b4e16cca"`);
        await queryRunner.query(`ALTER TABLE "users_following_users" ADD CONSTRAINT "FK_36135ff8c7243571f54b4e16cca" FOREIGN KEY ("followed_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_following_users" ADD CONSTRAINT "FK_776553d9d8f79e3be1e51d941b7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_following_users" DROP CONSTRAINT "FK_776553d9d8f79e3be1e51d941b7"`);
        await queryRunner.query(`ALTER TABLE "users_following_users" DROP CONSTRAINT "FK_36135ff8c7243571f54b4e16cca"`);
        await queryRunner.query(`ALTER TABLE "users_following_users" ADD CONSTRAINT "FK_36135ff8c7243571f54b4e16cca" FOREIGN KEY ("followed_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_following_users" ADD CONSTRAINT "FK_776553d9d8f79e3be1e51d941b7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}

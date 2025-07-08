import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFollowers1751487025113 implements MigrationInterface {
    name = 'AddFollowers1751487025113'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_following_users" ("user_id" integer NOT NULL, "followed_by_id" integer NOT NULL, CONSTRAINT "PK_18381b6867cbb6acead05cbcddd" PRIMARY KEY ("user_id", "followed_by_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_776553d9d8f79e3be1e51d941b" ON "users_following_users" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_36135ff8c7243571f54b4e16cc" ON "users_following_users" ("followed_by_id") `);
        await queryRunner.query(`ALTER TABLE "users_following_users" ADD CONSTRAINT "FK_776553d9d8f79e3be1e51d941b7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_following_users" ADD CONSTRAINT "FK_36135ff8c7243571f54b4e16cca" FOREIGN KEY ("followed_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_following_users" DROP CONSTRAINT "FK_36135ff8c7243571f54b4e16cca"`);
        await queryRunner.query(`ALTER TABLE "users_following_users" DROP CONSTRAINT "FK_776553d9d8f79e3be1e51d941b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_36135ff8c7243571f54b4e16cc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_776553d9d8f79e3be1e51d941b"`);
        await queryRunner.query(`DROP TABLE "users_following_users"`);
    }

}

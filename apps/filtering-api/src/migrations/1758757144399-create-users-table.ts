import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1758757144399 implements MigrationInterface {
    name = 'CreateUsersTable1758757144399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(320) NOT NULL, "username" character varying(50) NOT NULL, "last_name" character varying(128), "first_name" character varying(128), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_following_users" ("followed_by_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_18381b6867cbb6acead05cbcddd" PRIMARY KEY ("followed_by_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_36135ff8c7243571f54b4e16cc" ON "users_following_users" ("followed_by_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_776553d9d8f79e3be1e51d941b" ON "users_following_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "users_following_users" ADD CONSTRAINT "FK_36135ff8c7243571f54b4e16cca" FOREIGN KEY ("followed_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_following_users" ADD CONSTRAINT "FK_776553d9d8f79e3be1e51d941b7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_following_users" DROP CONSTRAINT "FK_776553d9d8f79e3be1e51d941b7"`);
        await queryRunner.query(`ALTER TABLE "users_following_users" DROP CONSTRAINT "FK_36135ff8c7243571f54b4e16cca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_776553d9d8f79e3be1e51d941b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_36135ff8c7243571f54b4e16cc"`);
        await queryRunner.query(`DROP TABLE "users_following_users"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}

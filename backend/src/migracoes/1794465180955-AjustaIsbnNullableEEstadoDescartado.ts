import { MigrationInterface, QueryRunner } from "typeorm";

export class AjustaIsbnNullableEEstadoDescartado1794465180955 implements MigrationInterface {
    name = 'AjustaIsbnNullableEEstadoDescartado1794465180955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obras" ALTER COLUMN "isbn" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."exemplares_estado_conservacao_enum" ADD VALUE 'DESCARTADO'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."exemplares_estado_conservacao_enum_old" AS ENUM('NOVO', 'BOM', 'DESGASTADO', 'DANIFICADO')`);
        await queryRunner.query(`ALTER TABLE "exemplares" ALTER COLUMN "estado_conservacao" TYPE "public"."exemplares_estado_conservacao_enum_old" USING "estado_conservacao"::"text"::"public"."exemplares_estado_conservacao_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."exemplares_estado_conservacao_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."exemplares_estado_conservacao_enum_old" RENAME TO "exemplares_estado_conservacao_enum"`);
        await queryRunner.query(`ALTER TABLE "obras" ALTER COLUMN "isbn" SET NOT NULL`);
    }

}

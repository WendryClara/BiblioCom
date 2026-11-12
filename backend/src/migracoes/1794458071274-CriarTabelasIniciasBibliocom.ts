import { MigrationInterface, QueryRunner } from "typeorm";

export class CriarTabelasIniciasBibliocom1794458071274 implements MigrationInterface {
    name = 'CriarTabelasIniciasBibliocom1794458071274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."usuarios_perfil_enum" AS ENUM('LEITOR', 'BIBLIOTECARIO', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(150) NOT NULL, "email" character varying(150) NOT NULL, "matricula" character varying(30) NOT NULL, "perfil" "public"."usuarios_perfil_enum" NOT NULL DEFAULT 'LEITOR', "ativo" boolean NOT NULL DEFAULT true, "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "UQ_315c5fe46111074751535e53145" UNIQUE ("matricula"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categorias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(100) NOT NULL, "descricao" text, CONSTRAINT "UQ_de8a2d8979f7820616e31dc1e15" UNIQUE ("nome"), CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "autores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(150) NOT NULL, "nacionalidade" character varying(80), CONSTRAINT "PK_8973029e8bb26f72a4738afc834" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "obras" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying(200) NOT NULL, "isbn" character varying(20) NOT NULL, "ano_publicacao" integer NOT NULL, "editora" character varying(120), "categoria_id" uuid NOT NULL, CONSTRAINT "UQ_d92ad7b78c62a136c1da77a8783" UNIQUE ("isbn"), CONSTRAINT "PK_1645460dfba8e8c144ecd8436da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_076c1f018c4b0cf484956d860a" ON "obras"  ("titulo", "editora", "ano_publicacao") `);
        await queryRunner.query(`CREATE TYPE "public"."exemplares_estado_conservacao_enum" AS ENUM('NOVO', 'BOM', 'DESGASTADO', 'DANIFICADO')`);
        await queryRunner.query(`CREATE TYPE "public"."exemplares_status_enum" AS ENUM('DISPONIVEL', 'EMPRESTADO', 'MANUTENCAO', 'BAIXADO')`);
        await queryRunner.query(`CREATE TABLE "exemplares" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "codigo_tombo" character varying(50) NOT NULL, "estado_conservacao" "public"."exemplares_estado_conservacao_enum" NOT NULL DEFAULT 'BOM', "status" "public"."exemplares_status_enum" NOT NULL DEFAULT 'DISPONIVEL', "obra_id" uuid NOT NULL, CONSTRAINT "UQ_7ae87016f981b0e14fc41ab6e7c" UNIQUE ("codigo_tombo"), CONSTRAINT "PK_f4dee0cd8e094ef06eb62bd285b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."emprestimos_status_enum" AS ENUM('ATIVO', 'DEVOLVIDO', 'ATRASADO')`);
        await queryRunner.query(`CREATE TABLE "emprestimos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data_retirada" TIMESTAMP WITH TIME ZONE NOT NULL, "data_prevista_devolucao" TIMESTAMP WITH TIME ZONE NOT NULL, "data_devolucao" TIMESTAMP WITH TIME ZONE, "valor_multa" numeric(10,2) NOT NULL DEFAULT '0', "status" "public"."emprestimos_status_enum" NOT NULL DEFAULT 'ATIVO', "usuario_id" uuid NOT NULL, "exemplar_id" uuid NOT NULL, CONSTRAINT "PK_560d61bedea3b4e5926b39766b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_38d4f5485afc49f92b0b4114b7" ON "emprestimos"  ("usuario_id", "exemplar_id", "status") `);
        await queryRunner.query(`CREATE TABLE "obras_autores" ("obra_id" uuid NOT NULL, "autor_id" uuid NOT NULL, CONSTRAINT "PK_a5a6830500055cb4874baf55378" PRIMARY KEY ("obra_id", "autor_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c5065e005a6977cf0692fc99c9" ON "obras_autores"  ("obra_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_82ff3628a9e79c074a38aafaa9" ON "obras_autores"  ("autor_id") `);
        await queryRunner.query(`ALTER TABLE "obras" ADD CONSTRAINT "FK_f96f26071c977ec365b2f2daf98" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exemplares" ADD CONSTRAINT "FK_e55f827da764493c529227079de" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emprestimos" ADD CONSTRAINT "FK_a5dad21409edde2a7fd6ea669e6" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emprestimos" ADD CONSTRAINT "FK_72c917af32e98de2d46c38dd12f" FOREIGN KEY ("exemplar_id") REFERENCES "exemplares"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "obras_autores" ADD CONSTRAINT "FK_c5065e005a6977cf0692fc99c95" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "obras_autores" ADD CONSTRAINT "FK_82ff3628a9e79c074a38aafaa9d" FOREIGN KEY ("autor_id") REFERENCES "autores"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "obras_autores" DROP CONSTRAINT "FK_82ff3628a9e79c074a38aafaa9d"`);
        await queryRunner.query(`ALTER TABLE "obras_autores" DROP CONSTRAINT "FK_c5065e005a6977cf0692fc99c95"`);
        await queryRunner.query(`ALTER TABLE "emprestimos" DROP CONSTRAINT "FK_72c917af32e98de2d46c38dd12f"`);
        await queryRunner.query(`ALTER TABLE "emprestimos" DROP CONSTRAINT "FK_a5dad21409edde2a7fd6ea669e6"`);
        await queryRunner.query(`ALTER TABLE "exemplares" DROP CONSTRAINT "FK_e55f827da764493c529227079de"`);
        await queryRunner.query(`ALTER TABLE "obras" DROP CONSTRAINT "FK_f96f26071c977ec365b2f2daf98"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_82ff3628a9e79c074a38aafaa9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5065e005a6977cf0692fc99c9"`);
        await queryRunner.query(`DROP TABLE "obras_autores"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_38d4f5485afc49f92b0b4114b7"`);
        await queryRunner.query(`DROP TABLE "emprestimos"`);
        await queryRunner.query(`DROP TYPE "public"."emprestimos_status_enum"`);
        await queryRunner.query(`DROP TABLE "exemplares"`);
        await queryRunner.query(`DROP TYPE "public"."exemplares_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."exemplares_estado_conservacao_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_076c1f018c4b0cf484956d860a"`);
        await queryRunner.query(`DROP TABLE "obras"`);
        await queryRunner.query(`DROP TABLE "autores"`);
        await queryRunner.query(`DROP TABLE "categorias"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TYPE "public"."usuarios_perfil_enum"`);
    }

}

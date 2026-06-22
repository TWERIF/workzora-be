import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSearchProjectsTable1781440309159 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "search_projects" (
                "id" uuid NOT NULL,
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "search_vector" tsvector GENERATED ALWAYS AS (
                    setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce("description", '')), 'B')
                ) STORED,
                CONSTRAINT "PK_search_projects_id" PRIMARY KEY ("id")
            );
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_search_projects_vector" ON "search_projects" USING GIN ("search_vector");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_search_projects_vector";
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS "search_projects";
        `);
    }
}
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSearchPostsTable1782736214898 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "search_posts" (
                "id" uuid NOT NULL,
                "title" character varying NOT NULL,
                "teaser" text NOT NULL,
                "tag" character varying NOT NULL,
                "search_vector" tsvector GENERATED ALWAYS AS (
                    setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce("teaser", '')), 'B') ||
                    setweight(to_tsvector('simple', coalesce("tag", '')), 'C')
                ) STORED,
                CONSTRAINT "PK_search_posts_id" PRIMARY KEY ("id")
            );
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_search_posts_vector"
            ON "search_posts"
            USING GIN ("search_vector");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_search_posts_vector";
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS "search_posts";
        `);
    }

}
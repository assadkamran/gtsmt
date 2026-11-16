import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Site search: one denormalised row per searchable page, kept current by collection hooks.
 * Full-text search (stemmed) plus pg_trgm for typo-tolerant titles and part numbers.
 * Written by hand because Payload only manages the tables it knows about.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    CREATE TABLE IF NOT EXISTS "search_index" (
      "id" serial PRIMARY KEY NOT NULL,
      "kind" varchar NOT NULL,
      "ref_id" integer NOT NULL,
      "url" varchar NOT NULL,
      "title" varchar NOT NULL,
      "title_norm" varchar NOT NULL,
      "subtitle" varchar,
      "excerpt" varchar,
      "image_url" varchar,
      "part_numbers" varchar,
      "part_norm" varchar,
      "body" text,
      "tsv" tsvector,
      "brand_id" integer,
      "category_id" integer,
      "meta" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "search_index_kind_ref_unique" UNIQUE ("kind", "ref_id")
    );

    CREATE INDEX IF NOT EXISTS "search_index_tsv_idx" ON "search_index" USING gin ("tsv");
    CREATE INDEX IF NOT EXISTS "search_index_title_trgm_idx" ON "search_index" USING gin ("title_norm" gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "search_index_part_trgm_idx" ON "search_index" USING gin ("part_norm" gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS "search_index_kind_idx" ON "search_index" ("kind");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "search_index";`)
}

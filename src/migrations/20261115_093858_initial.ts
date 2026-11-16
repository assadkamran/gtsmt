import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'sales');
  CREATE TYPE "public"."enum_machine_models_machine_type" AS ENUM('pick-and-place', 'printer', 'reflow', 'inspection', 'other');
  CREATE TYPE "public"."enum_spec_attributes_type" AS ENUM('choice', 'number', 'yesno', 'text');
  CREATE TYPE "public"."enum_categories_division" AS ENUM('equipment', 'parts', 'peripherals');
  CREATE TYPE "public"."enum_categories_line_station" AS ENUM('loader', 'printer', 'spi', 'placer', 'reflow', 'aoi', 'unloader');
  CREATE TYPE "public"."enum_products_part_origin" AS ENUM('new-machine', 'genuine-oem', 'oem-surplus', 'compatible-aftermarket', 'used-refurbished');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_part_origin" AS ENUM('new-machine', 'genuine-oem', 'oem-surplus', 'compatible-aftermarket', 'used-refurbished');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_product_documents_type" AS ENUM('datasheet', 'manual', 'brochure', 'certificate');
  CREATE TYPE "public"."enum_solutions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__solutions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__solutions_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_industries_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__industries_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__industries_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_articles_topic" AS ENUM('production-lines', 'feeders-parts', 'inspection', 'factory-planning', 'maintenance');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_topic" AS ENUM('production-lines', 'feeders-parts', 'inspection', 'factory-planning', 'maintenance');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_enquiries_type" AS ENUM('line', 'equipment', 'part', 'peripherals', 'contact');
  CREATE TYPE "public"."enum_enquiries_status" AS ENUM('new', 'in-progress', 'quoted', 'closed', 'spam');
  CREATE TYPE "public"."enum_enquiries_email_status" AS ENUM('sent', 'failed', 'skipped', 'not-sent');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"is_own_photo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "manufacturers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"logo_id" integer,
  	"website" varchar,
  	"show_as_brand_hub" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "manufacturers_locales" (
  	"notes" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "machine_models" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"manufacturer_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"machine_type" "enum_machine_models_machine_type",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "machine_models_locales" (
  	"notes" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "spec_attributes_choices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "spec_attributes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"type" "enum_spec_attributes_type" DEFAULT 'choice' NOT NULL,
  	"unit" varchar,
  	"filterable" boolean DEFAULT false,
  	"comparable" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "spec_attributes_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"division" "enum_categories_division" NOT NULL,
  	"parent_id" integer,
  	"image_id" integer,
  	"sort_order" numeric DEFAULT 100,
  	"allow_compare" boolean DEFAULT true,
  	"line_station" "enum_categories_line_station",
  	"reviewed" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"name" varchar NOT NULL,
  	"summary" varchar,
  	"description" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"spec_attributes_id" integer
  );
  
  CREATE TABLE "products_alt_part_numbers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "products_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"attribute_id" integer,
  	"value" varchar,
  	"value_number" numeric
  );
  
  CREATE TABLE "products_compatibility" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"machine_model_id" integer,
  	"verified" boolean DEFAULT false,
  	"source" varchar
  );
  
  CREATE TABLE "products_compatibility_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"featured" boolean DEFAULT false,
  	"quote_only" boolean DEFAULT true,
  	"part_number" varchar,
  	"category_id" integer,
  	"manufacturer_id" integer,
  	"part_origin" "enum_products_part_origin",
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_locales" (
  	"title" varchar,
  	"short_intro" varchar,
  	"description" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"product_documents_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "_products_v_version_alt_part_numbers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"attribute_id" integer,
  	"value" varchar,
  	"value_number" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_compatibility" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"machine_model_id" integer,
  	"verified" boolean DEFAULT false,
  	"source" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_compatibility_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_quote_only" boolean DEFAULT true,
  	"version_part_number" varchar,
  	"version_category_id" integer,
  	"version_manufacturer_id" integer,
  	"version_part_origin" "enum__products_v_version_part_origin",
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__products_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_locales" (
  	"version_title" varchar,
  	"version_short_intro" varchar,
  	"version_description" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"product_documents_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "product_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_product_documents_type" DEFAULT 'datasheet' NOT NULL,
  	"language" varchar DEFAULT 'English',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "product_documents_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "solutions_line_sequence" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"optional" boolean DEFAULT false
  );
  
  CREATE TABLE "solutions_line_sequence_locales" (
  	"station" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "solutions_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "solutions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"reviewed" boolean DEFAULT false,
  	"hero_image_id" integer,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_solutions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "solutions_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_solutions_v_version_line_sequence" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"optional" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_version_line_sequence_locales" (
  	"station" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_solutions_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_reviewed" boolean DEFAULT false,
  	"version_hero_image_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__solutions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__solutions_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_solutions_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "industries_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "industries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"reviewed" boolean DEFAULT false,
  	"image_id" integer,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_industries_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "industries_locales" (
  	"title" varchar,
  	"intro" varchar,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "industries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"solutions_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_industries_v_version_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_industries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_reviewed" boolean DEFAULT false,
  	"version_image_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__industries_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__industries_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_industries_v_locales" (
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_industries_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"solutions_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "articles_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"topic" "enum_articles_topic",
  	"image_id" integer,
  	"author" varchar,
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_articles_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_topic" "enum__articles_v_version_topic",
  	"version_image_id" integer,
  	"version_author" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__articles_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "enquiries_spam_reasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reason" varchar
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"type" "enum_enquiries_type" NOT NULL,
  	"status" "enum_enquiries_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"contact_name" varchar NOT NULL,
  	"contact_company" varchar,
  	"contact_job_title" varchar,
  	"contact_email" varchar NOT NULL,
  	"contact_phone" varchar,
  	"contact_country" varchar,
  	"readable_summary" varchar,
  	"message" varchar,
  	"payload" jsonb,
  	"consent_privacy_accepted" boolean,
  	"consent_accepted_at" timestamp(3) with time zone,
  	"source_page" varchar,
  	"source_referrer" varchar,
  	"source_utm" jsonb,
  	"source_ip_hash" varchar,
  	"source_elapsed_ms" numeric,
  	"email_status" "enum_enquiries_email_status",
  	"email_error" varchar,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enquiries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"enquiry_files_id" integer
  );
  
  CREATE TABLE "enquiry_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar
  );
  
  CREATE TABLE "search_misses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"query" varchar NOT NULL,
  	"hits" numeric DEFAULT 1 NOT NULL,
  	"last_seen_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"manufacturers_id" integer,
  	"machine_models_id" integer,
  	"spec_attributes_id" integer,
  	"categories_id" integer,
  	"products_id" integer,
  	"product_documents_id" integer,
  	"solutions_id" integer,
  	"industries_id" integer,
  	"articles_id" integer,
  	"enquiries_id" integer,
  	"enquiry_files_id" integer,
  	"search_misses_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_certifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"issuer" varchar,
  	"evidence_id" integer
  );
  
  CREATE TABLE "site_settings_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"detail" varchar
  );
  
  CREATE TABLE "site_settings_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customer" varchar NOT NULL,
  	"summary" varchar,
  	"permission_confirmed" boolean DEFAULT false
  );
  
  CREATE TABLE "site_settings_image_slots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot" varchar NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_enquiry_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legal_name" varchar,
  	"logo_id" integer,
  	"logo_light_id" integer,
  	"address" varchar,
  	"email" varchar,
  	"sales_email" varchar,
  	"phone" varchar,
  	"whatsapp" varchar,
  	"business_hours" varchar,
  	"year_founded" numeric,
  	"allow_enquiry_photos" boolean DEFAULT true,
  	"auto_reply_enabled" boolean DEFAULT false,
  	"auto_reply_subject" varchar,
  	"auto_reply_body" varchar,
  	"enquiry_retention_months" numeric,
  	"linkedin" varchar,
  	"youtube" varchar,
  	"analytics_id" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"tagline" varchar,
  	"shipping_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "manufacturers" ADD CONSTRAINT "manufacturers_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "manufacturers" ADD CONSTRAINT "manufacturers_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "manufacturers_locales" ADD CONSTRAINT "manufacturers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."manufacturers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machine_models" ADD CONSTRAINT "machine_models_manufacturer_id_manufacturers_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_models_locales" ADD CONSTRAINT "machine_models_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machine_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spec_attributes_choices" ADD CONSTRAINT "spec_attributes_choices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."spec_attributes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spec_attributes_locales" ADD CONSTRAINT "spec_attributes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."spec_attributes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_spec_attributes_fk" FOREIGN KEY ("spec_attributes_id") REFERENCES "public"."spec_attributes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_alt_part_numbers" ADD CONSTRAINT "products_alt_part_numbers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_features" ADD CONSTRAINT "products_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_applications" ADD CONSTRAINT "products_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specs" ADD CONSTRAINT "products_specs_attribute_id_spec_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."spec_attributes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_specs" ADD CONSTRAINT "products_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_compatibility" ADD CONSTRAINT "products_compatibility_machine_model_id_machine_models_id_fk" FOREIGN KEY ("machine_model_id") REFERENCES "public"."machine_models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_compatibility" ADD CONSTRAINT "products_compatibility_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_compatibility_locales" ADD CONSTRAINT "products_compatibility_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_compatibility"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_manufacturer_id_manufacturers_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_product_documents_fk" FOREIGN KEY ("product_documents_id") REFERENCES "public"."product_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_alt_part_numbers" ADD CONSTRAINT "_products_v_version_alt_part_numbers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_features" ADD CONSTRAINT "_products_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_applications" ADD CONSTRAINT "_products_v_version_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_specs" ADD CONSTRAINT "_products_v_version_specs_attribute_id_spec_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."spec_attributes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_specs" ADD CONSTRAINT "_products_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_compatibility" ADD CONSTRAINT "_products_v_version_compatibility_machine_model_id_machine_models_id_fk" FOREIGN KEY ("machine_model_id") REFERENCES "public"."machine_models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_compatibility" ADD CONSTRAINT "_products_v_version_compatibility_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_compatibility_locales" ADD CONSTRAINT "_products_v_version_compatibility_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_compatibility"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_manufacturer_id_manufacturers_id_fk" FOREIGN KEY ("version_manufacturer_id") REFERENCES "public"."manufacturers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_product_documents_fk" FOREIGN KEY ("product_documents_id") REFERENCES "public"."product_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_documents_locales" ADD CONSTRAINT "product_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_line_sequence" ADD CONSTRAINT "solutions_line_sequence_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_line_sequence" ADD CONSTRAINT "solutions_line_sequence_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_line_sequence_locales" ADD CONSTRAINT "solutions_line_sequence_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions_line_sequence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_faqs" ADD CONSTRAINT "solutions_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions" ADD CONSTRAINT "solutions_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions" ADD CONSTRAINT "solutions_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_locales" ADD CONSTRAINT "solutions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_line_sequence" ADD CONSTRAINT "_solutions_v_version_line_sequence_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_line_sequence" ADD CONSTRAINT "_solutions_v_version_line_sequence_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_line_sequence_locales" ADD CONSTRAINT "_solutions_v_version_line_sequence_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v_version_line_sequence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_faqs" ADD CONSTRAINT "_solutions_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v" ADD CONSTRAINT "_solutions_v_parent_id_solutions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v" ADD CONSTRAINT "_solutions_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v" ADD CONSTRAINT "_solutions_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_locales" ADD CONSTRAINT "_solutions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_requirements" ADD CONSTRAINT "industries_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries" ADD CONSTRAINT "industries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "industries" ADD CONSTRAINT "industries_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "industries_locales" ADD CONSTRAINT "industries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_rels" ADD CONSTRAINT "industries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_rels" ADD CONSTRAINT "industries_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_rels" ADD CONSTRAINT "industries_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_industries_v_version_requirements" ADD CONSTRAINT "_industries_v_version_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_industries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_industries_v" ADD CONSTRAINT "_industries_v_parent_id_industries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_industries_v" ADD CONSTRAINT "_industries_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_industries_v" ADD CONSTRAINT "_industries_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_industries_v_locales" ADD CONSTRAINT "_industries_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_industries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_industries_v_rels" ADD CONSTRAINT "_industries_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_industries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_industries_v_rels" ADD CONSTRAINT "_industries_v_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_industries_v_rels" ADD CONSTRAINT "_industries_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_faqs" ADD CONSTRAINT "articles_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_faqs" ADD CONSTRAINT "_articles_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_locales" ADD CONSTRAINT "_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries_spam_reasons" ADD CONSTRAINT "enquiries_spam_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries_rels" ADD CONSTRAINT "enquiries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries_rels" ADD CONSTRAINT "enquiries_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries_rels" ADD CONSTRAINT "enquiries_rels_enquiry_files_fk" FOREIGN KEY ("enquiry_files_id") REFERENCES "public"."enquiry_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_manufacturers_fk" FOREIGN KEY ("manufacturers_id") REFERENCES "public"."manufacturers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_machine_models_fk" FOREIGN KEY ("machine_models_id") REFERENCES "public"."machine_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_spec_attributes_fk" FOREIGN KEY ("spec_attributes_id") REFERENCES "public"."spec_attributes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_documents_fk" FOREIGN KEY ("product_documents_id") REFERENCES "public"."product_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiry_files_fk" FOREIGN KEY ("enquiry_files_id") REFERENCES "public"."enquiry_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_misses_fk" FOREIGN KEY ("search_misses_id") REFERENCES "public"."search_misses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_certifications" ADD CONSTRAINT "site_settings_certifications_evidence_id_media_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_certifications" ADD CONSTRAINT "site_settings_certifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locations" ADD CONSTRAINT "site_settings_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_references" ADD CONSTRAINT "site_settings_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_image_slots" ADD CONSTRAINT "site_settings_image_slots_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_image_slots" ADD CONSTRAINT "site_settings_image_slots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_enquiry_recipients" ADD CONSTRAINT "site_settings_enquiry_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_light_id_media_id_fk" FOREIGN KEY ("logo_light_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "manufacturers_slug_idx" ON "manufacturers" USING btree ("slug");
  CREATE INDEX "manufacturers_logo_idx" ON "manufacturers" USING btree ("logo_id");
  CREATE INDEX "manufacturers_seo_seo_image_idx" ON "manufacturers" USING btree ("seo_image_id");
  CREATE INDEX "manufacturers_updated_at_idx" ON "manufacturers" USING btree ("updated_at");
  CREATE INDEX "manufacturers_created_at_idx" ON "manufacturers" USING btree ("created_at");
  CREATE UNIQUE INDEX "manufacturers_locales_locale_parent_id_unique" ON "manufacturers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "manufacturers_locales_parent_id_idx" ON "manufacturers_locales" USING btree ("_parent_id");
  CREATE INDEX "machine_models_manufacturer_idx" ON "machine_models" USING btree ("manufacturer_id");
  CREATE INDEX "machine_models_slug_idx" ON "machine_models" USING btree ("slug");
  CREATE INDEX "machine_models_updated_at_idx" ON "machine_models" USING btree ("updated_at");
  CREATE INDEX "machine_models_created_at_idx" ON "machine_models" USING btree ("created_at");
  CREATE UNIQUE INDEX "machine_models_locales_locale_parent_id_unique" ON "machine_models_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "machine_models_locales_parent_id_idx" ON "machine_models_locales" USING btree ("_parent_id");
  CREATE INDEX "spec_attributes_choices_order_idx" ON "spec_attributes_choices" USING btree ("_order");
  CREATE INDEX "spec_attributes_choices_parent_id_idx" ON "spec_attributes_choices" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "spec_attributes_key_idx" ON "spec_attributes" USING btree ("key");
  CREATE INDEX "spec_attributes_updated_at_idx" ON "spec_attributes" USING btree ("updated_at");
  CREATE INDEX "spec_attributes_created_at_idx" ON "spec_attributes" USING btree ("created_at");
  CREATE UNIQUE INDEX "spec_attributes_locales_locale_parent_id_unique" ON "spec_attributes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "spec_attributes_locales_parent_id_idx" ON "spec_attributes_locales" USING btree ("_parent_id");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_division_idx" ON "categories" USING btree ("division");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE INDEX "categories_seo_seo_image_idx" ON "categories" USING btree ("seo_image_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_locales_parent_id_idx" ON "categories_locales" USING btree ("_parent_id");
  CREATE INDEX "categories_rels_order_idx" ON "categories_rels" USING btree ("order");
  CREATE INDEX "categories_rels_parent_idx" ON "categories_rels" USING btree ("parent_id");
  CREATE INDEX "categories_rels_path_idx" ON "categories_rels" USING btree ("path");
  CREATE INDEX "categories_rels_spec_attributes_id_idx" ON "categories_rels" USING btree ("spec_attributes_id");
  CREATE INDEX "products_alt_part_numbers_order_idx" ON "products_alt_part_numbers" USING btree ("_order");
  CREATE INDEX "products_alt_part_numbers_parent_id_idx" ON "products_alt_part_numbers" USING btree ("_parent_id");
  CREATE INDEX "products_features_order_idx" ON "products_features" USING btree ("_order");
  CREATE INDEX "products_features_parent_id_idx" ON "products_features" USING btree ("_parent_id");
  CREATE INDEX "products_features_locale_idx" ON "products_features" USING btree ("_locale");
  CREATE INDEX "products_applications_order_idx" ON "products_applications" USING btree ("_order");
  CREATE INDEX "products_applications_parent_id_idx" ON "products_applications" USING btree ("_parent_id");
  CREATE INDEX "products_applications_locale_idx" ON "products_applications" USING btree ("_locale");
  CREATE INDEX "products_specs_order_idx" ON "products_specs" USING btree ("_order");
  CREATE INDEX "products_specs_parent_id_idx" ON "products_specs" USING btree ("_parent_id");
  CREATE INDEX "products_specs_attribute_idx" ON "products_specs" USING btree ("attribute_id");
  CREATE INDEX "products_compatibility_order_idx" ON "products_compatibility" USING btree ("_order");
  CREATE INDEX "products_compatibility_parent_id_idx" ON "products_compatibility" USING btree ("_parent_id");
  CREATE INDEX "products_compatibility_machine_model_idx" ON "products_compatibility" USING btree ("machine_model_id");
  CREATE UNIQUE INDEX "products_compatibility_locales_locale_parent_id_unique" ON "products_compatibility_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_compatibility_locales_parent_id_idx" ON "products_compatibility_locales" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_part_number_idx" ON "products" USING btree ("part_number");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE INDEX "products_manufacturer_idx" ON "products" USING btree ("manufacturer_id");
  CREATE INDEX "products_part_origin_idx" ON "products" USING btree ("part_origin");
  CREATE INDEX "products_seo_seo_image_idx" ON "products" USING btree ("seo_image_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_locales_parent_id_idx" ON "products_locales" USING btree ("_parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_product_documents_id_idx" ON "products_rels" USING btree ("product_documents_id");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_version_alt_part_numbers_order_idx" ON "_products_v_version_alt_part_numbers" USING btree ("_order");
  CREATE INDEX "_products_v_version_alt_part_numbers_parent_id_idx" ON "_products_v_version_alt_part_numbers" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_features_order_idx" ON "_products_v_version_features" USING btree ("_order");
  CREATE INDEX "_products_v_version_features_parent_id_idx" ON "_products_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_features_locale_idx" ON "_products_v_version_features" USING btree ("_locale");
  CREATE INDEX "_products_v_version_applications_order_idx" ON "_products_v_version_applications" USING btree ("_order");
  CREATE INDEX "_products_v_version_applications_parent_id_idx" ON "_products_v_version_applications" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_applications_locale_idx" ON "_products_v_version_applications" USING btree ("_locale");
  CREATE INDEX "_products_v_version_specs_order_idx" ON "_products_v_version_specs" USING btree ("_order");
  CREATE INDEX "_products_v_version_specs_parent_id_idx" ON "_products_v_version_specs" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_specs_attribute_idx" ON "_products_v_version_specs" USING btree ("attribute_id");
  CREATE INDEX "_products_v_version_compatibility_order_idx" ON "_products_v_version_compatibility" USING btree ("_order");
  CREATE INDEX "_products_v_version_compatibility_parent_id_idx" ON "_products_v_version_compatibility" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_compatibility_machine_model_idx" ON "_products_v_version_compatibility" USING btree ("machine_model_id");
  CREATE UNIQUE INDEX "_products_v_version_compatibility_locales_locale_parent_id_u" ON "_products_v_version_compatibility_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_compatibility_locales_parent_id_idx" ON "_products_v_version_compatibility_locales" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_part_number_idx" ON "_products_v" USING btree ("version_part_number");
  CREATE INDEX "_products_v_version_version_category_idx" ON "_products_v" USING btree ("version_category_id");
  CREATE INDEX "_products_v_version_version_manufacturer_idx" ON "_products_v" USING btree ("version_manufacturer_id");
  CREATE INDEX "_products_v_version_version_part_origin_idx" ON "_products_v" USING btree ("version_part_origin");
  CREATE INDEX "_products_v_version_seo_version_seo_image_idx" ON "_products_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
  CREATE INDEX "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_locales_parent_id_idx" ON "_products_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_product_documents_id_idx" ON "_products_v_rels" USING btree ("product_documents_id");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
  CREATE INDEX "product_documents_updated_at_idx" ON "product_documents" USING btree ("updated_at");
  CREATE INDEX "product_documents_created_at_idx" ON "product_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "product_documents_filename_idx" ON "product_documents" USING btree ("filename");
  CREATE UNIQUE INDEX "product_documents_locales_locale_parent_id_unique" ON "product_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "product_documents_locales_parent_id_idx" ON "product_documents_locales" USING btree ("_parent_id");
  CREATE INDEX "solutions_line_sequence_order_idx" ON "solutions_line_sequence" USING btree ("_order");
  CREATE INDEX "solutions_line_sequence_parent_id_idx" ON "solutions_line_sequence" USING btree ("_parent_id");
  CREATE INDEX "solutions_line_sequence_category_idx" ON "solutions_line_sequence" USING btree ("category_id");
  CREATE UNIQUE INDEX "solutions_line_sequence_locales_locale_parent_id_unique" ON "solutions_line_sequence_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "solutions_line_sequence_locales_parent_id_idx" ON "solutions_line_sequence_locales" USING btree ("_parent_id");
  CREATE INDEX "solutions_faqs_order_idx" ON "solutions_faqs" USING btree ("_order");
  CREATE INDEX "solutions_faqs_parent_id_idx" ON "solutions_faqs" USING btree ("_parent_id");
  CREATE INDEX "solutions_faqs_locale_idx" ON "solutions_faqs" USING btree ("_locale");
  CREATE UNIQUE INDEX "solutions_slug_idx" ON "solutions" USING btree ("slug");
  CREATE INDEX "solutions_hero_image_idx" ON "solutions" USING btree ("hero_image_id");
  CREATE INDEX "solutions_seo_seo_image_idx" ON "solutions" USING btree ("seo_image_id");
  CREATE INDEX "solutions_updated_at_idx" ON "solutions" USING btree ("updated_at");
  CREATE INDEX "solutions_created_at_idx" ON "solutions" USING btree ("created_at");
  CREATE INDEX "solutions__status_idx" ON "solutions" USING btree ("_status");
  CREATE UNIQUE INDEX "solutions_locales_locale_parent_id_unique" ON "solutions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "solutions_locales_parent_id_idx" ON "solutions_locales" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_line_sequence_order_idx" ON "_solutions_v_version_line_sequence" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_line_sequence_parent_id_idx" ON "_solutions_v_version_line_sequence" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_line_sequence_category_idx" ON "_solutions_v_version_line_sequence" USING btree ("category_id");
  CREATE UNIQUE INDEX "_solutions_v_version_line_sequence_locales_locale_parent_id_" ON "_solutions_v_version_line_sequence_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_solutions_v_version_line_sequence_locales_parent_id_idx" ON "_solutions_v_version_line_sequence_locales" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_faqs_order_idx" ON "_solutions_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_faqs_parent_id_idx" ON "_solutions_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_faqs_locale_idx" ON "_solutions_v_version_faqs" USING btree ("_locale");
  CREATE INDEX "_solutions_v_parent_idx" ON "_solutions_v" USING btree ("parent_id");
  CREATE INDEX "_solutions_v_version_version_slug_idx" ON "_solutions_v" USING btree ("version_slug");
  CREATE INDEX "_solutions_v_version_version_hero_image_idx" ON "_solutions_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_solutions_v_version_seo_version_seo_image_idx" ON "_solutions_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_solutions_v_version_version_updated_at_idx" ON "_solutions_v" USING btree ("version_updated_at");
  CREATE INDEX "_solutions_v_version_version_created_at_idx" ON "_solutions_v" USING btree ("version_created_at");
  CREATE INDEX "_solutions_v_version_version__status_idx" ON "_solutions_v" USING btree ("version__status");
  CREATE INDEX "_solutions_v_created_at_idx" ON "_solutions_v" USING btree ("created_at");
  CREATE INDEX "_solutions_v_updated_at_idx" ON "_solutions_v" USING btree ("updated_at");
  CREATE INDEX "_solutions_v_snapshot_idx" ON "_solutions_v" USING btree ("snapshot");
  CREATE INDEX "_solutions_v_published_locale_idx" ON "_solutions_v" USING btree ("published_locale");
  CREATE INDEX "_solutions_v_latest_idx" ON "_solutions_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_solutions_v_locales_locale_parent_id_unique" ON "_solutions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_solutions_v_locales_parent_id_idx" ON "_solutions_v_locales" USING btree ("_parent_id");
  CREATE INDEX "industries_requirements_order_idx" ON "industries_requirements" USING btree ("_order");
  CREATE INDEX "industries_requirements_parent_id_idx" ON "industries_requirements" USING btree ("_parent_id");
  CREATE INDEX "industries_requirements_locale_idx" ON "industries_requirements" USING btree ("_locale");
  CREATE UNIQUE INDEX "industries_slug_idx" ON "industries" USING btree ("slug");
  CREATE INDEX "industries_image_idx" ON "industries" USING btree ("image_id");
  CREATE INDEX "industries_seo_seo_image_idx" ON "industries" USING btree ("seo_image_id");
  CREATE INDEX "industries_updated_at_idx" ON "industries" USING btree ("updated_at");
  CREATE INDEX "industries_created_at_idx" ON "industries" USING btree ("created_at");
  CREATE INDEX "industries__status_idx" ON "industries" USING btree ("_status");
  CREATE UNIQUE INDEX "industries_locales_locale_parent_id_unique" ON "industries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "industries_locales_parent_id_idx" ON "industries_locales" USING btree ("_parent_id");
  CREATE INDEX "industries_rels_order_idx" ON "industries_rels" USING btree ("order");
  CREATE INDEX "industries_rels_parent_idx" ON "industries_rels" USING btree ("parent_id");
  CREATE INDEX "industries_rels_path_idx" ON "industries_rels" USING btree ("path");
  CREATE INDEX "industries_rels_solutions_id_idx" ON "industries_rels" USING btree ("solutions_id");
  CREATE INDEX "industries_rels_categories_id_idx" ON "industries_rels" USING btree ("categories_id");
  CREATE INDEX "_industries_v_version_requirements_order_idx" ON "_industries_v_version_requirements" USING btree ("_order");
  CREATE INDEX "_industries_v_version_requirements_parent_id_idx" ON "_industries_v_version_requirements" USING btree ("_parent_id");
  CREATE INDEX "_industries_v_version_requirements_locale_idx" ON "_industries_v_version_requirements" USING btree ("_locale");
  CREATE INDEX "_industries_v_parent_idx" ON "_industries_v" USING btree ("parent_id");
  CREATE INDEX "_industries_v_version_version_slug_idx" ON "_industries_v" USING btree ("version_slug");
  CREATE INDEX "_industries_v_version_version_image_idx" ON "_industries_v" USING btree ("version_image_id");
  CREATE INDEX "_industries_v_version_seo_version_seo_image_idx" ON "_industries_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_industries_v_version_version_updated_at_idx" ON "_industries_v" USING btree ("version_updated_at");
  CREATE INDEX "_industries_v_version_version_created_at_idx" ON "_industries_v" USING btree ("version_created_at");
  CREATE INDEX "_industries_v_version_version__status_idx" ON "_industries_v" USING btree ("version__status");
  CREATE INDEX "_industries_v_created_at_idx" ON "_industries_v" USING btree ("created_at");
  CREATE INDEX "_industries_v_updated_at_idx" ON "_industries_v" USING btree ("updated_at");
  CREATE INDEX "_industries_v_snapshot_idx" ON "_industries_v" USING btree ("snapshot");
  CREATE INDEX "_industries_v_published_locale_idx" ON "_industries_v" USING btree ("published_locale");
  CREATE INDEX "_industries_v_latest_idx" ON "_industries_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_industries_v_locales_locale_parent_id_unique" ON "_industries_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_industries_v_locales_parent_id_idx" ON "_industries_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_industries_v_rels_order_idx" ON "_industries_v_rels" USING btree ("order");
  CREATE INDEX "_industries_v_rels_parent_idx" ON "_industries_v_rels" USING btree ("parent_id");
  CREATE INDEX "_industries_v_rels_path_idx" ON "_industries_v_rels" USING btree ("path");
  CREATE INDEX "_industries_v_rels_solutions_id_idx" ON "_industries_v_rels" USING btree ("solutions_id");
  CREATE INDEX "_industries_v_rels_categories_id_idx" ON "_industries_v_rels" USING btree ("categories_id");
  CREATE INDEX "articles_faqs_order_idx" ON "articles_faqs" USING btree ("_order");
  CREATE INDEX "articles_faqs_parent_id_idx" ON "articles_faqs" USING btree ("_parent_id");
  CREATE INDEX "articles_faqs_locale_idx" ON "articles_faqs" USING btree ("_locale");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_image_idx" ON "articles" USING btree ("image_id");
  CREATE INDEX "articles_seo_seo_image_idx" ON "articles" USING btree ("seo_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_locales_parent_id_idx" ON "articles_locales" USING btree ("_parent_id");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_products_id_idx" ON "articles_rels" USING btree ("products_id");
  CREATE INDEX "_articles_v_version_faqs_order_idx" ON "_articles_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_articles_v_version_faqs_parent_id_idx" ON "_articles_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_faqs_locale_idx" ON "_articles_v_version_faqs" USING btree ("_locale");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_image_idx" ON "_articles_v" USING btree ("version_image_id");
  CREATE INDEX "_articles_v_version_seo_version_seo_image_idx" ON "_articles_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_snapshot_idx" ON "_articles_v" USING btree ("snapshot");
  CREATE INDEX "_articles_v_published_locale_idx" ON "_articles_v" USING btree ("published_locale");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_articles_v_locales_locale_parent_id_unique" ON "_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_locales_parent_id_idx" ON "_articles_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_products_id_idx" ON "_articles_v_rels" USING btree ("products_id");
  CREATE INDEX "enquiries_spam_reasons_order_idx" ON "enquiries_spam_reasons" USING btree ("_order");
  CREATE INDEX "enquiries_spam_reasons_parent_id_idx" ON "enquiries_spam_reasons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "enquiries_reference_idx" ON "enquiries" USING btree ("reference");
  CREATE INDEX "enquiries_type_idx" ON "enquiries" USING btree ("type");
  CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status");
  CREATE INDEX "enquiries_assigned_to_idx" ON "enquiries" USING btree ("assigned_to_id");
  CREATE INDEX "enquiries_source_source_ip_hash_idx" ON "enquiries" USING btree ("source_ip_hash");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE INDEX "enquiries_rels_order_idx" ON "enquiries_rels" USING btree ("order");
  CREATE INDEX "enquiries_rels_parent_idx" ON "enquiries_rels" USING btree ("parent_id");
  CREATE INDEX "enquiries_rels_path_idx" ON "enquiries_rels" USING btree ("path");
  CREATE INDEX "enquiries_rels_products_id_idx" ON "enquiries_rels" USING btree ("products_id");
  CREATE INDEX "enquiries_rels_enquiry_files_id_idx" ON "enquiries_rels" USING btree ("enquiry_files_id");
  CREATE INDEX "enquiry_files_updated_at_idx" ON "enquiry_files" USING btree ("updated_at");
  CREATE INDEX "enquiry_files_created_at_idx" ON "enquiry_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "enquiry_files_filename_idx" ON "enquiry_files" USING btree ("filename");
  CREATE INDEX "enquiry_files_sizes_thumb_sizes_thumb_filename_idx" ON "enquiry_files" USING btree ("sizes_thumb_filename");
  CREATE UNIQUE INDEX "search_misses_query_idx" ON "search_misses" USING btree ("query");
  CREATE INDEX "search_misses_updated_at_idx" ON "search_misses" USING btree ("updated_at");
  CREATE INDEX "search_misses_created_at_idx" ON "search_misses" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_manufacturers_id_idx" ON "payload_locked_documents_rels" USING btree ("manufacturers_id");
  CREATE INDEX "payload_locked_documents_rels_machine_models_id_idx" ON "payload_locked_documents_rels" USING btree ("machine_models_id");
  CREATE INDEX "payload_locked_documents_rels_spec_attributes_id_idx" ON "payload_locked_documents_rels" USING btree ("spec_attributes_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_product_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("product_documents_id");
  CREATE INDEX "payload_locked_documents_rels_solutions_id_idx" ON "payload_locked_documents_rels" USING btree ("solutions_id");
  CREATE INDEX "payload_locked_documents_rels_industries_id_idx" ON "payload_locked_documents_rels" USING btree ("industries_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_enquiry_files_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiry_files_id");
  CREATE INDEX "payload_locked_documents_rels_search_misses_id_idx" ON "payload_locked_documents_rels" USING btree ("search_misses_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_certifications_order_idx" ON "site_settings_certifications" USING btree ("_order");
  CREATE INDEX "site_settings_certifications_parent_id_idx" ON "site_settings_certifications" USING btree ("_parent_id");
  CREATE INDEX "site_settings_certifications_evidence_idx" ON "site_settings_certifications" USING btree ("evidence_id");
  CREATE INDEX "site_settings_locations_order_idx" ON "site_settings_locations" USING btree ("_order");
  CREATE INDEX "site_settings_locations_parent_id_idx" ON "site_settings_locations" USING btree ("_parent_id");
  CREATE INDEX "site_settings_references_order_idx" ON "site_settings_references" USING btree ("_order");
  CREATE INDEX "site_settings_references_parent_id_idx" ON "site_settings_references" USING btree ("_parent_id");
  CREATE INDEX "site_settings_image_slots_order_idx" ON "site_settings_image_slots" USING btree ("_order");
  CREATE INDEX "site_settings_image_slots_parent_id_idx" ON "site_settings_image_slots" USING btree ("_parent_id");
  CREATE INDEX "site_settings_image_slots_image_idx" ON "site_settings_image_slots" USING btree ("image_id");
  CREATE INDEX "site_settings_enquiry_recipients_order_idx" ON "site_settings_enquiry_recipients" USING btree ("_order");
  CREATE INDEX "site_settings_enquiry_recipients_parent_id_idx" ON "site_settings_enquiry_recipients" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_light_idx" ON "site_settings" USING btree ("logo_light_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "manufacturers" CASCADE;
  DROP TABLE "manufacturers_locales" CASCADE;
  DROP TABLE "machine_models" CASCADE;
  DROP TABLE "machine_models_locales" CASCADE;
  DROP TABLE "spec_attributes_choices" CASCADE;
  DROP TABLE "spec_attributes" CASCADE;
  DROP TABLE "spec_attributes_locales" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "categories_rels" CASCADE;
  DROP TABLE "products_alt_part_numbers" CASCADE;
  DROP TABLE "products_features" CASCADE;
  DROP TABLE "products_applications" CASCADE;
  DROP TABLE "products_specs" CASCADE;
  DROP TABLE "products_compatibility" CASCADE;
  DROP TABLE "products_compatibility_locales" CASCADE;
  DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_alt_part_numbers" CASCADE;
  DROP TABLE "_products_v_version_features" CASCADE;
  DROP TABLE "_products_v_version_applications" CASCADE;
  DROP TABLE "_products_v_version_specs" CASCADE;
  DROP TABLE "_products_v_version_compatibility" CASCADE;
  DROP TABLE "_products_v_version_compatibility_locales" CASCADE;
  DROP TABLE "_products_v_version_gallery" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_locales" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "product_documents" CASCADE;
  DROP TABLE "product_documents_locales" CASCADE;
  DROP TABLE "solutions_line_sequence" CASCADE;
  DROP TABLE "solutions_line_sequence_locales" CASCADE;
  DROP TABLE "solutions_faqs" CASCADE;
  DROP TABLE "solutions" CASCADE;
  DROP TABLE "solutions_locales" CASCADE;
  DROP TABLE "_solutions_v_version_line_sequence" CASCADE;
  DROP TABLE "_solutions_v_version_line_sequence_locales" CASCADE;
  DROP TABLE "_solutions_v_version_faqs" CASCADE;
  DROP TABLE "_solutions_v" CASCADE;
  DROP TABLE "_solutions_v_locales" CASCADE;
  DROP TABLE "industries_requirements" CASCADE;
  DROP TABLE "industries" CASCADE;
  DROP TABLE "industries_locales" CASCADE;
  DROP TABLE "industries_rels" CASCADE;
  DROP TABLE "_industries_v_version_requirements" CASCADE;
  DROP TABLE "_industries_v" CASCADE;
  DROP TABLE "_industries_v_locales" CASCADE;
  DROP TABLE "_industries_v_rels" CASCADE;
  DROP TABLE "articles_faqs" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v_version_faqs" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_locales" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "enquiries_spam_reasons" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "enquiries_rels" CASCADE;
  DROP TABLE "enquiry_files" CASCADE;
  DROP TABLE "search_misses" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_certifications" CASCADE;
  DROP TABLE "site_settings_locations" CASCADE;
  DROP TABLE "site_settings_references" CASCADE;
  DROP TABLE "site_settings_image_slots" CASCADE;
  DROP TABLE "site_settings_enquiry_recipients" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_machine_models_machine_type";
  DROP TYPE "public"."enum_spec_attributes_type";
  DROP TYPE "public"."enum_categories_division";
  DROP TYPE "public"."enum_categories_line_station";
  DROP TYPE "public"."enum_products_part_origin";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_part_origin";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum__products_v_published_locale";
  DROP TYPE "public"."enum_product_documents_type";
  DROP TYPE "public"."enum_solutions_status";
  DROP TYPE "public"."enum__solutions_v_version_status";
  DROP TYPE "public"."enum__solutions_v_published_locale";
  DROP TYPE "public"."enum_industries_status";
  DROP TYPE "public"."enum__industries_v_version_status";
  DROP TYPE "public"."enum__industries_v_published_locale";
  DROP TYPE "public"."enum_articles_topic";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_topic";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum__articles_v_published_locale";
  DROP TYPE "public"."enum_enquiries_type";
  DROP TYPE "public"."enum_enquiries_status";
  DROP TYPE "public"."enum_enquiries_email_status";`)
}

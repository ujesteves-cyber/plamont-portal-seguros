CREATE TYPE "public"."insurance_type" AS ENUM('Frota', 'Seguro de Vida', 'Seguro Judicial', 'Seguro Trabalhista', 'Seguro de Obras', 'Seguro Contratual');--> statement-breakpoint
CREATE TYPE "public"."tender_status" AS ENUM('Rascunho', 'Aberto', 'Encerrado', 'Finalizado');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('diretor', 'analista', 'corretor');--> statement-breakpoint
CREATE TYPE "public"."vehicle_category" AS ENUM('Leves', 'Utilitários', 'Pesados - Transporte', 'Pesados - Operação', 'Equipamentos Especiais', 'Reboques/Acoplados');--> statement-breakpoint
CREATE TABLE "comparisons" (
	"id" serial PRIMARY KEY NOT NULL,
	"tender_id" integer NOT NULL,
	"comparison_data" jsonb NOT NULL,
	"summary" text,
	"generated_at" timestamp DEFAULT now(),
	CONSTRAINT "comparisons_tender_id_unique" UNIQUE("tender_id")
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"tender_id" integer NOT NULL,
	"insurer_id" integer NOT NULL,
	"pdf_url" text NOT NULL,
	"pdf_file_name" varchar(255),
	"total_premium" varchar(50),
	"deductible" varchar(100),
	"coverage_type" varchar(100),
	"validity" varchar(50),
	"is_winner" boolean DEFAULT false,
	"ai_analysis" jsonb,
	"submitted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tender_vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"tender_id" integer NOT NULL,
	"vehicle_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenders" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"insurance_type" "insurance_type" NOT NULL,
	"status" "tender_status" DEFAULT 'Rascunho' NOT NULL,
	"coverage_required" text,
	"edital_pdf_url" text,
	"edital_pdf_file_name" varchar(255),
	"attachments" jsonb,
	"deadline" timestamp NOT NULL,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"role" "user_role" DEFAULT 'corretor' NOT NULL,
	"cnpj" varchar(20),
	"company_name" varchar(255),
	"phone" varchar(20),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"number_ref" varchar(20),
	"plate" varchar(20) NOT NULL,
	"vehicle_type" varchar(50) NOT NULL,
	"category" "vehicle_category" NOT NULL,
	"brand" varchar(50),
	"model" varchar(100),
	"company" varchar(50),
	"current_insurer" varchar(50),
	"current_policy" varchar(50),
	"current_coverage" varchar(50),
	"policy_expiry" timestamp,
	"status" varchar(20) DEFAULT 'A VENCER',
	"broker" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_insurer_id_users_id_fk" FOREIGN KEY ("insurer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_vehicles" ADD CONSTRAINT "tender_vehicles_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_vehicles" ADD CONSTRAINT "tender_vehicles_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
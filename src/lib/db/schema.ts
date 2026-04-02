import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const vehicleCategoryEnum = pgEnum("vehicle_category", [
  "Leves",
  "Utilitários",
  "Pesados - Transporte",
  "Pesados - Operação",
  "Equipamentos Especiais",
  "Reboques/Acoplados",
]);

export const tenderStatusEnum = pgEnum("tender_status", [
  "Rascunho",
  "Aberto",
  "Encerrado",
  "Finalizado",
]);

export const insuranceTypeEnum = pgEnum("insurance_type", [
  "Frota",
  "Seguro de Vida",
  "Seguro Judicial",
  "Seguro Trabalhista",
  "Seguro de Obras",
  "Seguro Contratual",
]);

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "corretor",
  "seguradora",
]);

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  numberRef: varchar("number_ref", { length: 20 }),
  plate: varchar("plate", { length: 20 }).notNull(),
  vehicleType: varchar("vehicle_type", { length: 50 }).notNull(),
  category: vehicleCategoryEnum("category").notNull(),
  brand: varchar("brand", { length: 50 }),
  model: varchar("model", { length: 100 }),
  company: varchar("company", { length: 50 }),
  currentInsurer: varchar("current_insurer", { length: 50 }),
  currentPolicy: varchar("current_policy", { length: 50 }),
  currentCoverage: varchar("current_coverage", { length: 50 }),
  policyExpiry: timestamp("policy_expiry"),
  status: varchar("status", { length: 20 }).default("A VENCER"),
  broker: varchar("broker", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  role: userRoleEnum("role").notNull().default("seguradora"),
  cnpj: varchar("cnpj", { length: 20 }),
  companyName: varchar("company_name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  insuranceType: insuranceTypeEnum("insurance_type").notNull(),
  status: tenderStatusEnum("status").notNull().default("Rascunho"),
  coverageRequired: text("coverage_required"),
  deadline: timestamp("deadline").notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tenderVehicles = pgTable("tender_vehicles", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id")
    .references(() => tenders.id, { onDelete: "cascade" })
    .notNull(),
  vehicleId: integer("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id")
    .references(() => tenders.id, { onDelete: "cascade" })
    .notNull(),
  insurerId: integer("insurer_id")
    .references(() => users.id)
    .notNull(),
  pdfUrl: text("pdf_url").notNull(),
  pdfFileName: varchar("pdf_file_name", { length: 255 }),
  totalPremium: varchar("total_premium", { length: 50 }),
  deductible: varchar("deductible", { length: 100 }),
  coverageType: varchar("coverage_type", { length: 100 }),
  validity: varchar("validity", { length: 50 }),
  isWinner: boolean("is_winner").default(false),
  aiAnalysis: jsonb("ai_analysis"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const comparisons = pgTable("comparisons", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id")
    .references(() => tenders.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  comparisonData: jsonb("comparison_data").notNull(),
  summary: text("summary"),
  generatedAt: timestamp("generated_at").defaultNow(),
});

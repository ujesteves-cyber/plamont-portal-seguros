# Portal Plamont Seguros - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web platform where Plamont publishes insurance tenders, insurers submit PDF proposals, and AI automatically analyzes and compares them.

**Architecture:** Next.js 16 App Router with Server Actions for mutations, Neon Postgres for data, Clerk for auth (3 roles: admin, broker, insurer), Vercel Blob for PDF storage, AI Gateway for PDF analysis. Dark mode UI with shadcn/ui.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Clerk, Neon Postgres (Drizzle ORM), Vercel Blob, AI SDK v6 + AI Gateway, Vercel

---

## File Structure

```
plamont-portal-seguros/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (Clerk, fonts, theme)
│   │   ├── page.tsx                      # Landing / redirect
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (admin)/                      # Admin routes (Plamont)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx        # Dashboard overview
│   │   │   ├── frota/page.tsx            # Fleet management
│   │   │   ├── frota/importar/page.tsx   # Import spreadsheet
│   │   │   ├── editais/page.tsx          # List tenders
│   │   │   ├── editais/novo/page.tsx     # Create tender
│   │   │   ├── editais/[id]/page.tsx     # Tender detail + proposals
│   │   │   ├── editais/[id]/comparativo/page.tsx  # AI comparison
│   │   │   └── seguradoras/page.tsx      # Registered insurers
│   │   ├── (seguradora)/                 # Insurer routes
│   │   │   ├── layout.tsx
│   │   │   ├── painel/page.tsx           # Insurer dashboard
│   │   │   ├── editais/page.tsx          # Available tenders
│   │   │   ├── editais/[id]/page.tsx     # Tender detail
│   │   │   └── editais/[id]/proposta/page.tsx  # Submit proposal
│   │   ├── (corretor)/                   # Broker routes
│   │   │   ├── layout.tsx
│   │   │   └── painel/page.tsx           # Broker dashboard
│   │   └── api/
│   │       ├── chat/route.ts             # AI analysis endpoint
│   │       ├── upload/route.ts           # PDF upload endpoint
│   │       └── webhooks/clerk/route.ts   # Clerk webhook
│   ├── components/
│   │   ├── ui/                           # shadcn components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx               # Navigation sidebar
│   │   │   ├── header.tsx                # Top header with user
│   │   │   └── theme-toggle.tsx          # Dark/light toggle
│   │   ├── frota/
│   │   │   ├── frota-table.tsx           # Fleet data table
│   │   │   ├── frota-filters.tsx         # Category/company filters
│   │   │   └── import-dialog.tsx         # Import spreadsheet dialog
│   │   ├── editais/
│   │   │   ├── edital-form.tsx           # Create/edit tender form
│   │   │   ├── edital-card.tsx           # Tender card
│   │   │   ├── edital-status-badge.tsx   # Status badge
│   │   │   └── vehicle-selector.tsx      # Select vehicles for tender
│   │   └── propostas/
│   │       ├── proposta-upload.tsx        # PDF upload component
│   │       ├── proposta-card.tsx          # Proposal card
│   │       ├── comparativo-table.tsx      # AI comparison table
│   │       └── ai-summary.tsx            # AI summary panel
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                  # Drizzle client
│   │   │   ├── schema.ts                 # All table definitions
│   │   │   └── seed.ts                   # Seed from spreadsheet
│   │   ├── actions/
│   │   │   ├── frota.ts                  # Fleet CRUD actions
│   │   │   ├── editais.ts               # Tender CRUD actions
│   │   │   ├── propostas.ts             # Proposal actions
│   │   │   └── ai-analysis.ts           # AI analysis action
│   │   ├── ai/
│   │   │   ├── analyze-proposal.ts       # Extract data from PDF
│   │   │   └── compare-proposals.ts      # Compare multiple proposals
│   │   ├── constants.ts                  # Categories, vehicle types
│   │   └── utils.ts                      # Shared utilities
│   └── proxy.ts                          # Clerk middleware (Next.js 16)
├── drizzle/
│   └── migrations/                       # SQL migrations
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── .env.local                            # (gitignored, from vercel env pull)
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd "C:\Users\ujest\OneDrive\Downloads PC novo\Programação em Claude\plamont portal seguros"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

Answer prompts: Yes to all defaults. This creates the base Next.js 16 project.

- [ ] **Step 2: Install core dependencies**

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
npm install @clerk/nextjs
npm install @vercel/blob
npm install ai@^6.0.0 @ai-sdk/react@^3.0.0
npm install date-fns zod
npm install xlsx
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc color, CSS variables yes.

- [ ] **Step 4: Install AI Elements (required for AI text rendering)**

```bash
npx ai-elements@latest
```

This installs pre-built components for rendering AI-generated markdown (Message, MessageResponse, etc.) into `src/components/ai-elements/`.

- [ ] **Step 5: Add shadcn components**

```bash
npx shadcn@latest add button card input label select table badge dialog sheet tabs textarea separator dropdown-menu avatar tooltip command sidebar
```

- [ ] **Step 6: Configure next.config.ts**

Replace `next.config.ts` contents:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
};

export default nextConfig;
```

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 16 project with dependencies"
```

---

## Task 2: Database Schema

**Files:**
- Create: `src/lib/db/schema.ts`, `src/lib/db/index.ts`, `drizzle.config.ts`
- Create: `src/lib/constants.ts`

- [ ] **Step 1: Create constants file**

Create `src/lib/constants.ts`:

```typescript
export const VEHICLE_CATEGORIES = {
  LEVES: "Leves",
  UTILITARIOS: "Utilitários",
  PESADOS_TRANSPORTE: "Pesados - Transporte",
  PESADOS_OPERACAO: "Pesados - Operação",
  EQUIPAMENTOS_ESPECIAIS: "Equipamentos Especiais",
  REBOQUES_ACOPLADOS: "Reboques/Acoplados",
} as const;

export const VEHICLE_TYPE_TO_CATEGORY: Record<string, string> = {
  "VEICULO AUTOMOTOR": VEHICLE_CATEGORIES.LEVES,
  POLO: VEHICLE_CATEGORIES.LEVES,
  MOBI: VEHICLE_CATEGORIES.LEVES,
  STRADA: VEHICLE_CATEGORIES.LEVES,
  CAMINHONETE: VEHICLE_CATEGORIES.UTILITARIOS,
  L200: VEHICLE_CATEGORIES.UTILITARIOS,
  ONIBUS: VEHICLE_CATEGORIES.PESADOS_TRANSPORTE,
  MICRO: VEHICLE_CATEGORIES.PESADOS_TRANSPORTE,
  "CAVALO MECANICO": VEHICLE_CATEGORIES.PESADOS_TRANSPORTE,
  "CAMINHAO TANQUE": VEHICLE_CATEGORIES.PESADOS_TRANSPORTE,
  CAMINHAO: VEHICLE_CATEGORIES.PESADOS_TRANSPORTE,
  "CAMINHAO MUNCK": VEHICLE_CATEGORIES.PESADOS_OPERACAO,
  "CAMINHÃO MUNCK": VEHICLE_CATEGORIES.PESADOS_OPERACAO,
  MUNCK: VEHICLE_CATEGORIES.PESADOS_OPERACAO,
  GUINDASTE: VEHICLE_CATEGORIES.EQUIPAMENTOS_ESPECIAIS,
  "GRUA/GUINDASTE": VEHICLE_CATEGORIES.EQUIPAMENTOS_ESPECIAIS,
  EMPILHADEIRA: VEHICLE_CATEGORIES.EQUIPAMENTOS_ESPECIAIS,
  MAQUINAS: VEHICLE_CATEGORIES.EQUIPAMENTOS_ESPECIAIS,
  "UNIDADE MOVEL": VEHICLE_CATEGORIES.EQUIPAMENTOS_ESPECIAIS,
  "UM MOVEL": VEHICLE_CATEGORIES.EQUIPAMENTOS_ESPECIAIS,
  PRANCHA: VEHICLE_CATEGORIES.REBOQUES_ACOPLADOS,
  "REBOQUE TANQUE": VEHICLE_CATEGORIES.REBOQUES_ACOPLADOS,
  "REBOQUE PRANCHA": VEHICLE_CATEGORIES.REBOQUES_ACOPLADOS,
  "CARRETA REBOQUE": VEHICLE_CATEGORIES.REBOQUES_ACOPLADOS,
  POLIGUINDASTE: VEHICLE_CATEGORIES.REBOQUES_ACOPLADOS,
};

export const INSURANCE_TYPES = {
  FROTA: "Frota",
  VIDA: "Seguro de Vida",
  JUDICIAL: "Seguro Judicial",
  TRABALHISTA: "Seguro Trabalhista",
  OBRAS: "Seguro de Obras",
  CONTRATO: "Seguro Contratual",
} as const;

export const COVERAGE_TYPES = ["Total", "Terceiro", "Básico-Terc-Prox AG"] as const;

export const TENDER_STATUS = {
  RASCUNHO: "Rascunho",
  ABERTO: "Aberto",
  ENCERRADO: "Encerrado",
  FINALIZADO: "Finalizado",
} as const;

export const GROUP_COMPANIES = [
  "PLAMONT ENG.",
  "R&I",
  "PLALOG",
  "RID SERVIÇOS",
  "RID METAL",
  "HIROMI",
  "DLV",
  "SAFRA LEASING",
  "LUMI",
] as const;
```

- [ ] **Step 2: Create database schema**

Create `src/lib/db/schema.ts`:

```typescript
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

// Fleet vehicles/equipment
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

// Users (synced from Clerk via webhook)
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

// Insurance tenders (editais)
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

// Vehicles linked to a tender
export const tenderVehicles = pgTable("tender_vehicles", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id")
    .references(() => tenders.id, { onDelete: "cascade" })
    .notNull(),
  vehicleId: integer("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
});

// Proposals from insurers
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

// AI comparison results for a tender
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
```

- [ ] **Step 3: Create database client**

Create `src/lib/db/index.ts`:

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 4: Create drizzle config**

Create `drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add database schema and constants"
```

---

## Task 3: Authentication with Clerk

**Files:**
- Create: `src/proxy.ts`, `src/app/sign-in/[[...sign-in]]/page.tsx`, `src/app/sign-up/[[...sign-up]]/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create proxy.ts (Next.js 16 middleware)**

Create `src/proxy.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
```

- [ ] **Step 2: Create sign-in page**

Create `src/app/sign-in/[[...sign-in]]/page.tsx`:

```tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

- [ ] **Step 3: Create sign-up page**

Create `src/app/sign-up/[[...sign-up]]/page.tsx`:

```tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

- [ ] **Step 4: Update root layout with Clerk + dark mode**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Plamont Seguros",
  description: "Plataforma de cotação e negociação de seguros",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" className="dark">
        <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add Clerk authentication with sign-in/sign-up"
```

---

## Task 4: Layout and Navigation

**Files:**
- Create: `src/components/layout/sidebar.tsx`, `src/components/layout/header.tsx`
- Create: `src/app/(admin)/layout.tsx`, `src/app/(admin)/dashboard/page.tsx`
- Create: `src/app/(seguradora)/layout.tsx`, `src/app/(seguradora)/painel/page.tsx`
- Create: `src/app/(corretor)/layout.tsx`, `src/app/(corretor)/painel/page.tsx`

- [ ] **Step 1: Create sidebar component**

Create `src/components/layout/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  FileText,
  Building2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/frota", label: "Frota", icon: Truck },
  { href: "/editais", label: "Editais", icon: FileText },
  { href: "/seguradoras", label: "Seguradoras", icon: Building2 },
];

const insurerLinks = [
  { href: "/painel", label: "Painel", icon: LayoutDashboard },
  { href: "/editais", label: "Editais Abertos", icon: FileText },
];

export function AppSidebar({ role }: { role: "admin" | "corretor" | "seguradora" }) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : insurerLinks;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-6">
            Plamont Seguros
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(link.href)}
                  >
                    <Link href={link.href}>
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

- [ ] **Step 2: Create header component**

Create `src/components/layout/header.tsx`:

```tsx
import { UserButton } from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AppHeader({ title }: { title: string }) {
  return (
    <header className="flex h-14 items-center gap-4 border-b px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="ml-auto">
        <UserButton />
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create admin layout**

Create `src/app/(admin)/layout.tsx`:

```tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role="admin" />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
```

- [ ] **Step 4: Create admin dashboard page**

Create `src/app/(admin)/dashboard/page.tsx`:

```tsx
import { AppHeader } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, FileText, Building2, Clock } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      <AppHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veículos</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">273</div>
              <p className="text-xs text-muted-foreground">na frota</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Editais Abertos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">aguardando propostas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seguradoras</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">cadastradas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Vencer</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">próximos 30 dias</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Create insurer and broker layouts/dashboards (minimal)**

Create `src/app/(seguradora)/layout.tsx`:

```tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";

export default function SeguradoraLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role="seguradora" />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
```

Create `src/app/(seguradora)/painel/page.tsx`:

```tsx
import { AppHeader } from "@/components/layout/header";

export default function SeguradoraPainelPage() {
  return (
    <>
      <AppHeader title="Painel da Seguradora" />
      <div className="p-6">
        <p className="text-muted-foreground">Editais abertos aparecerão aqui.</p>
      </div>
    </>
  );
}
```

Create `src/app/(corretor)/layout.tsx`:

```tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";

export default function CorretorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role="corretor" />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
```

Create `src/app/(corretor)/painel/page.tsx`:

```tsx
import { AppHeader } from "@/components/layout/header";

export default function CorretorPainelPage() {
  return (
    <>
      <AppHeader title="Painel do Corretor" />
      <div className="p-6">
        <p className="text-muted-foreground">Seus editais e propostas aparecerão aqui.</p>
      </div>
    </>
  );
}
```

- [ ] **Step 6: Update root page to redirect based on role**

Replace `src/app/page.tsx`:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Default redirect to admin dashboard
  // In production, check user role in DB and redirect accordingly
  redirect("/dashboard");
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add layout, sidebar, header, and role-based dashboards"
```

---

## Task 5: Fleet Management (Frota)

**Files:**
- Create: `src/lib/actions/frota.ts`
- Create: `src/app/(admin)/frota/page.tsx`
- Create: `src/app/(admin)/frota/importar/page.tsx`
- Create: `src/components/frota/frota-table.tsx`, `src/components/frota/frota-filters.tsx`, `src/components/frota/import-dialog.tsx`
- Create: `src/lib/db/seed.ts`

- [ ] **Step 1: Create fleet server actions**

Create `src/lib/actions/frota.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { VEHICLE_TYPE_TO_CATEGORY } from "@/lib/constants";

export async function getVehicles(filters?: {
  category?: string;
  company?: string;
  search?: string;
}) {
  let conditions = [];

  if (filters?.category) {
    conditions.push(eq(vehicles.category, filters.category as any));
  }
  if (filters?.company) {
    conditions.push(eq(vehicles.company, filters.company));
  }
  if (filters?.search) {
    conditions.push(ilike(vehicles.plate, `%${filters.search}%`));
  }

  const result = await db
    .select()
    .from(vehicles)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(vehicles.category, vehicles.plate);

  return result;
}

export async function importVehiclesFromData(
  data: Array<{
    numberRef: string;
    plate: string;
    vehicleType: string;
    brand: string;
    model: string;
    company: string;
    insurer: string;
    policy: string;
    coverage: string;
    expiry: string | null;
    status: string;
    broker: string;
    notes: string;
  }>
) {
  const rows = data.map((row) => ({
    numberRef: row.numberRef,
    plate: row.plate,
    vehicleType: row.vehicleType,
    category: (VEHICLE_TYPE_TO_CATEGORY[row.vehicleType.toUpperCase()] ||
      "Equipamentos Especiais") as any,
    brand: row.brand,
    model: row.model,
    company: row.company,
    currentInsurer: row.insurer,
    currentPolicy: row.policy,
    currentCoverage: row.coverage,
    policyExpiry: row.expiry ? new Date(row.expiry) : null,
    status: row.status,
    broker: row.broker,
    notes: row.notes,
  }));

  await db.insert(vehicles).values(rows);
  return { count: rows.length };
}
```

- [ ] **Step 2: Create fleet table component**

Create `src/components/frota/frota-table.tsx`:

```tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Vehicle = {
  id: number;
  plate: string;
  vehicleType: string;
  category: string;
  brand: string | null;
  model: string | null;
  company: string | null;
  currentInsurer: string | null;
  currentCoverage: string | null;
  policyExpiry: Date | null;
  status: string | null;
};

export function FrotaTable({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Marca/Modelo</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Seguradora</TableHead>
            <TableHead>Cobertura</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="font-mono font-medium">{v.plate}</TableCell>
              <TableCell>{v.vehicleType}</TableCell>
              <TableCell>
                <Badge variant="outline">{v.category}</Badge>
              </TableCell>
              <TableCell>
                {v.brand} {v.model}
              </TableCell>
              <TableCell>{v.company}</TableCell>
              <TableCell>{v.currentInsurer || "—"}</TableCell>
              <TableCell>{v.currentCoverage || "—"}</TableCell>
              <TableCell>
                {v.policyExpiry
                  ? format(new Date(v.policyExpiry), "dd/MM/yyyy", { locale: ptBR })
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge variant={v.status === "VENDIDO" ? "secondary" : "default"}>
                  {v.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 3: Create fleet filters component**

Create `src/components/frota/frota-filters.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VEHICLE_CATEGORIES, GROUP_COMPANIES } from "@/lib/constants";

export function FrotaFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/frota?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Input
        placeholder="Buscar por placa..."
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => updateFilter("search", e.target.value)}
        className="w-[200px]"
      />
      <Select
        defaultValue={searchParams.get("category") || "all"}
        onValueChange={(v) => updateFilter("category", v)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {Object.values(VEHICLE_CATEGORIES).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get("company") || "all"}
        onValueChange={(v) => updateFilter("company", v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as empresas</SelectItem>
          {GROUP_COMPANIES.map((co) => (
            <SelectItem key={co} value={co}>
              {co}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 4: Create fleet page**

Create `src/app/(admin)/frota/page.tsx`:

```tsx
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/header";
import { FrotaTable } from "@/components/frota/frota-table";
import { FrotaFilters } from "@/components/frota/frota-filters";
import { Button } from "@/components/ui/button";
import { getVehicles } from "@/lib/actions/frota";
import Link from "next/link";
import { Upload } from "lucide-react";

export default async function FrotaPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; company?: string; search?: string }>;
}) {
  const params = await searchParams;
  const vehicles = await getVehicles(params);

  return (
    <>
      <AppHeader title="Frota" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Suspense>
            <FrotaFilters />
          </Suspense>
          <Button asChild>
            <Link href="/frota/importar">
              <Upload className="mr-2 h-4 w-4" />
              Importar Planilha
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {vehicles.length} veículo(s) encontrado(s)
        </p>
        <FrotaTable vehicles={vehicles} />
      </div>
    </>
  );
}
```

- [ ] **Step 5: Create import page (spreadsheet upload)**

Create `src/app/(admin)/frota/importar/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { importVehiclesFromData } from "@/lib/actions/frota";
import * as XLSX from "xlsx";

export default function ImportarPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(sheet);

      const mapped = rows.map((row: any) => ({
        numberRef: String(row["N°"] || ""),
        plate: String(row["PLACA"] || ""),
        vehicleType: String(row["TIPO DE VEÍCULO"] || ""),
        brand: String(row["MARCA"] || ""),
        model: String(row["MODELO"] || ""),
        company: String(row["EMPRESA"] || ""),
        insurer: String(row["SEGURADORA"] || ""),
        policy: String(row["Nº APOLICE"] || ""),
        coverage: String(row["COBERTURA"] || ""),
        expiry: row["VENCIMENTO"] ? String(row["VENCIMENTO"]) : null,
        status: String(row["SITUAÇÃO"] || "A VENCER"),
        broker: String(row["CORRETOR"] || ""),
        notes: String(row["OBS"] || ""),
      }));

      const { count } = await importVehiclesFromData(mapped);
      setResult(`${count} veículos importados com sucesso!`);
      setTimeout(() => router.push("/frota"), 2000);
    } catch (err) {
      setResult("Erro ao importar. Verifique o formato da planilha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader title="Importar Planilha" />
      <div className="p-6 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Importar Frota</CardTitle>
            <CardDescription>
              Envie a planilha .xlsx com os veículos. Colunas esperadas: PLACA,
              TIPO DE VEÍCULO, MARCA, MODELO, EMPRESA, SEGURADORA, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={loading}
            />
            {loading && <p className="text-sm text-muted-foreground">Processando...</p>}
            {result && <p className="text-sm font-medium">{result}</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add fleet management with import, filters, and table"
```

---

## Task 6: Tender Management (Editais)

**Files:**
- Create: `src/lib/actions/editais.ts`
- Create: `src/app/(admin)/editais/page.tsx`, `src/app/(admin)/editais/novo/page.tsx`, `src/app/(admin)/editais/[id]/page.tsx`
- Create: `src/components/editais/edital-form.tsx`, `src/components/editais/edital-card.tsx`, `src/components/editais/vehicle-selector.tsx`

- [ ] **Step 1: Create tender server actions**

Create `src/lib/actions/editais.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { tenders, tenderVehicles, vehicles, proposals, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTender(data: {
  title: string;
  description: string;
  insuranceType: string;
  coverageRequired: string;
  deadline: string;
  vehicleIds: number[];
}) {
  const [tender] = await db
    .insert(tenders)
    .values({
      title: data.title,
      description: data.description,
      insuranceType: data.insuranceType as any,
      coverageRequired: data.coverageRequired,
      deadline: new Date(data.deadline),
      status: "Rascunho",
    })
    .returning();

  if (data.vehicleIds.length > 0) {
    await db.insert(tenderVehicles).values(
      data.vehicleIds.map((vehicleId) => ({
        tenderId: tender.id,
        vehicleId,
      }))
    );
  }

  revalidatePath("/editais");
  return tender;
}

export async function getTenders() {
  return db.select().from(tenders).orderBy(desc(tenders.createdAt));
}

export async function getTenderById(id: number) {
  const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));
  if (!tender) return null;

  const linkedVehicles = await db
    .select({ vehicle: vehicles })
    .from(tenderVehicles)
    .innerJoin(vehicles, eq(tenderVehicles.vehicleId, vehicles.id))
    .where(eq(tenderVehicles.tenderId, id));

  const tenderProposals = await db
    .select({ proposal: proposals, insurer: users })
    .from(proposals)
    .innerJoin(users, eq(proposals.insurerId, users.id))
    .where(eq(proposals.tenderId, id));

  return {
    ...tender,
    vehicles: linkedVehicles.map((r) => r.vehicle),
    proposals: tenderProposals.map((r) => ({
      ...r.proposal,
      insurerName: r.insurer.companyName || r.insurer.name,
    })),
  };
}

export async function publishTender(id: number) {
  await db
    .update(tenders)
    .set({ status: "Aberto", updatedAt: new Date() })
    .where(eq(tenders.id, id));
  revalidatePath(`/editais/${id}`);
  revalidatePath("/editais");
}

export async function closeTender(id: number) {
  await db
    .update(tenders)
    .set({ status: "Encerrado", updatedAt: new Date() })
    .where(eq(tenders.id, id));
  revalidatePath(`/editais/${id}`);
  revalidatePath("/editais");
}
```

- [ ] **Step 2: Create tender form component**

Create `src/components/editais/edital-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INSURANCE_TYPES } from "@/lib/constants";
import { createTender } from "@/lib/actions/editais";

type Vehicle = { id: number; plate: string; vehicleType: string; category: string };

export function EditalForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [insuranceType, setInsuranceType] = useState("Frota");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    await createTender({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      insuranceType,
      coverageRequired: formData.get("coverageRequired") as string,
      deadline: formData.get("deadline") as string,
      vehicleIds: selectedVehicles,
    });

    router.push("/editais");
  }

  function toggleVehicle(id: number) {
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedVehicles(vehicles.map((v) => v.id));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Dados do Edital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required placeholder="Ex: Seguro Frota 2026" />
          </div>
          <div>
            <Label>Tipo de Seguro</Label>
            <Select value={insuranceType} onValueChange={setInsuranceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(INSURANCE_TYPES).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" rows={4} placeholder="Descreva os requisitos..." />
          </div>
          <div>
            <Label htmlFor="coverageRequired">Coberturas Exigidas</Label>
            <Textarea id="coverageRequired" name="coverageRequired" rows={3} placeholder="Ex: Cobertura total, terceiros, APP..." />
          </div>
          <div>
            <Label htmlFor="deadline">Prazo para Propostas</Label>
            <Input id="deadline" name="deadline" type="datetime-local" required />
          </div>
        </CardContent>
      </Card>

      {insuranceType === "Frota" && vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Veículos ({selectedVehicles.length} selecionados)
              <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                Selecionar Todos
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {vehicles.map((v) => (
                <label
                  key={v.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedVehicles.includes(v.id)}
                    onChange={() => toggleVehicle(v.id)}
                    className="rounded"
                  />
                  <span className="font-mono text-sm">{v.plate}</span>
                  <span className="text-sm text-muted-foreground">{v.vehicleType}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{v.category}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar Edital"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Create tender list and detail pages**

Create `src/components/editais/edital-card.tsx`:

```tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Tender = {
  id: number;
  title: string;
  insuranceType: string;
  status: string;
  deadline: Date;
  createdAt: Date | null;
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Rascunho: "secondary",
  Aberto: "default",
  Encerrado: "outline",
  Finalizado: "destructive",
};

export function EditalCard({ tender }: { tender: Tender }) {
  return (
    <Link href={`/editais/${tender.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-base">{tender.title}</CardTitle>
          <Badge variant={statusColors[tender.status] || "default"}>
            {tender.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{tender.insuranceType}</span>
            <span>Prazo: {format(new Date(tender.deadline), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

Create `src/app/(admin)/editais/page.tsx`:

```tsx
import { AppHeader } from "@/components/layout/header";
import { EditalCard } from "@/components/editais/edital-card";
import { Button } from "@/components/ui/button";
import { getTenders } from "@/lib/actions/editais";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function EditaisPage() {
  const tenders = await getTenders();

  return (
    <>
      <AppHeader title="Editais" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/editais/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Edital
            </Link>
          </Button>
        </div>
        {tenders.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            Nenhum edital criado. Clique em "Novo Edital" para começar.
          </p>
        ) : (
          <div className="grid gap-4">
            {tenders.map((t) => (
              <EditalCard key={t.id} tender={t} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
```

Create `src/app/(admin)/editais/novo/page.tsx`:

```tsx
import { AppHeader } from "@/components/layout/header";
import { EditalForm } from "@/components/editais/edital-form";
import { getVehicles } from "@/lib/actions/frota";

export default async function NovoEditalPage() {
  const vehicles = await getVehicles();

  return (
    <>
      <AppHeader title="Novo Edital" />
      <div className="p-6">
        <EditalForm vehicles={vehicles} />
      </div>
    </>
  );
}
```

- [ ] **Step 4: Create tender detail page**

Create `src/app/(admin)/editais/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/header";
import { getTenderById, publishTender, closeTender } from "@/lib/actions/editais";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export default async function EditalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tender = await getTenderById(Number(id));
  if (!tender) notFound();

  return (
    <>
      <AppHeader title={tender.title} />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {tender.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {tender.insuranceType} | Prazo:{" "}
            {format(new Date(tender.deadline), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </span>
          <div className="ml-auto flex gap-2">
            {tender.status === "Rascunho" && (
              <form action={async () => { "use server"; await publishTender(Number(id)); }}>
                <Button type="submit">Publicar Edital</Button>
              </form>
            )}
            {tender.status === "Aberto" && (
              <form action={async () => { "use server"; await closeTender(Number(id)); }}>
                <Button type="submit" variant="outline">Encerrar Recebimento</Button>
              </form>
            )}
            {tender.proposals.length > 0 && (
              <Button asChild variant="secondary">
                <Link href={`/editais/${id}/comparativo`}>Ver Comparativo IA</Link>
              </Button>
            )}
          </div>
        </div>

        {tender.description && (
          <Card>
            <CardHeader><CardTitle>Descrição</CardTitle></CardHeader>
            <CardContent><p>{tender.description}</p></CardContent>
          </Card>
        )}

        {tender.vehicles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Veículos ({tender.vehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead>Empresa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tender.vehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono">{v.plate}</TableCell>
                      <TableCell>{v.vehicleType}</TableCell>
                      <TableCell>{v.brand} {v.model}</TableCell>
                      <TableCell>{v.company}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Propostas ({tender.proposals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {tender.proposals.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma proposta recebida.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seguradora</TableHead>
                    <TableHead>Prêmio</TableHead>
                    <TableHead>Franquia</TableHead>
                    <TableHead>Cobertura</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead>Enviada em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tender.proposals.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.insurerName}</TableCell>
                      <TableCell>{p.totalPremium || "—"}</TableCell>
                      <TableCell>{p.deductible || "—"}</TableCell>
                      <TableCell>{p.coverageType || "—"}</TableCell>
                      <TableCell>
                        <a href={p.pdfUrl} target="_blank" rel="noopener" className="text-primary underline">
                          {p.pdfFileName || "Download"}
                        </a>
                      </TableCell>
                      <TableCell>
                        {p.submittedAt && format(new Date(p.submittedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add tender management (create, list, detail, publish)"
```

---

## Task 7: Proposal Submission (Insurer Side)

**Files:**
- Create: `src/lib/actions/propostas.ts`
- Create: `src/app/api/upload/route.ts`
- Create: `src/app/(seguradora)/editais/page.tsx`, `src/app/(seguradora)/editais/[id]/page.tsx`, `src/app/(seguradora)/editais/[id]/proposta/page.tsx`
- Create: `src/components/propostas/proposta-upload.tsx`

- [ ] **Step 1: Create upload API route**

Create `src/app/api/upload/route.ts`:

```typescript
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const blob = await put(`propostas/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url, fileName: file.name });
}
```

- [ ] **Step 2: Create proposal server actions**

Create `src/lib/actions/propostas.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitProposal(data: {
  tenderId: number;
  insurerId: number;
  pdfUrl: string;
  pdfFileName: string;
  totalPremium: string;
  deductible: string;
  coverageType: string;
  validity: string;
}) {
  const [proposal] = await db
    .insert(proposals)
    .values({
      tenderId: data.tenderId,
      insurerId: data.insurerId,
      pdfUrl: data.pdfUrl,
      pdfFileName: data.pdfFileName,
      totalPremium: data.totalPremium,
      deductible: data.deductible,
      coverageType: data.coverageType,
      validity: data.validity,
    })
    .returning();

  revalidatePath(`/editais/${data.tenderId}`);
  return proposal;
}

export async function selectWinner(proposalId: number, tenderId: number) {
  // Reset all proposals for this tender
  await db
    .update(proposals)
    .set({ isWinner: false })
    .where(eq(proposals.tenderId, tenderId));

  // Set winner
  await db
    .update(proposals)
    .set({ isWinner: true })
    .where(eq(proposals.id, proposalId));

  revalidatePath(`/editais/${tenderId}`);
}
```

- [ ] **Step 3: Create proposal upload component**

Create `src/components/propostas/proposta-upload.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitProposal } from "@/lib/actions/propostas";
import { Upload } from "lucide-react";

export function PropostaUpload({
  tenderId,
  insurerId,
}: {
  tenderId: number;
  insurerId: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const { url, fileName } = await res.json();
    setPdfUrl(url);
    setPdfFileName(fileName);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pdfUrl) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    await submitProposal({
      tenderId,
      insurerId,
      pdfUrl,
      pdfFileName,
      totalPremium: formData.get("totalPremium") as string,
      deductible: formData.get("deductible") as string,
      coverageType: formData.get("coverageType") as string,
      validity: formData.get("validity") as string,
    });

    router.push("/editais");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Arquivo PDF da Proposta</Label>
            <Input type="file" accept=".pdf" onChange={handleFileUpload} required />
            {pdfFileName && (
              <p className="text-sm text-muted-foreground mt-1">
                <Upload className="inline h-3 w-3 mr-1" />
                {pdfFileName} enviado
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="totalPremium">Prêmio Total (R$)</Label>
            <Input id="totalPremium" name="totalPremium" placeholder="Ex: 150.000,00" />
          </div>
          <div>
            <Label htmlFor="deductible">Franquia</Label>
            <Input id="deductible" name="deductible" placeholder="Ex: 10% do valor FIPE" />
          </div>
          <div>
            <Label htmlFor="coverageType">Tipo de Cobertura</Label>
            <Input id="coverageType" name="coverageType" placeholder="Ex: Total, Terceiros" />
          </div>
          <div>
            <Label htmlFor="validity">Vigência</Label>
            <Input id="validity" name="validity" placeholder="Ex: 12 meses" />
          </div>
        </CardContent>
      </Card>
      <Button type="submit" disabled={loading || !pdfUrl}>
        {loading ? "Enviando..." : "Enviar Proposta"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Create insurer tender pages**

Create `src/app/(seguradora)/editais/page.tsx`:

```tsx
import { AppHeader } from "@/components/layout/header";
import { EditalCard } from "@/components/editais/edital-card";
import { getTenders } from "@/lib/actions/editais";

export default async function SeguradoraEditaisPage() {
  const tenders = await getTenders();
  const openTenders = tenders.filter((t) => t.status === "Aberto");

  return (
    <>
      <AppHeader title="Editais Abertos" />
      <div className="p-6 space-y-4">
        {openTenders.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            Nenhum edital aberto no momento.
          </p>
        ) : (
          <div className="grid gap-4">
            {openTenders.map((t) => (
              <EditalCard key={t.id} tender={t} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
```

Create `src/app/(seguradora)/editais/[id]/proposta/page.tsx`:

```tsx
import { AppHeader } from "@/components/layout/header";
import { PropostaUpload } from "@/components/propostas/proposta-upload";

export default async function EnviarPropostaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // TODO: Get real insurer ID from Clerk auth + DB lookup
  const insurerId = 1;

  return (
    <>
      <AppHeader title="Enviar Proposta" />
      <div className="p-6">
        <PropostaUpload tenderId={Number(id)} insurerId={insurerId} />
      </div>
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add proposal submission with PDF upload"
```

---

## Task 8: AI Analysis and Comparison

**Files:**
- Create: `src/lib/ai/analyze-proposal.ts`, `src/lib/ai/compare-proposals.ts`
- Create: `src/lib/actions/ai-analysis.ts`
- Create: `src/app/(admin)/editais/[id]/comparativo/page.tsx`
- Create: `src/components/propostas/comparativo-table.tsx`, `src/components/propostas/ai-summary.tsx`
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: Create AI analysis functions**

Create `src/lib/ai/analyze-proposal.ts`:

```typescript
import { generateText, Output } from "ai";
import { z } from "zod";

const proposalSchema = z.object({
  insurerName: z.string().describe("Nome da seguradora"),
  totalPremium: z.string().describe("Valor total do prêmio"),
  monthlyPremium: z.string().optional().describe("Valor mensal se informado"),
  deductible: z.string().describe("Franquia"),
  coverages: z.array(z.string()).describe("Lista de coberturas incluídas"),
  exclusions: z.array(z.string()).describe("Lista de exclusões"),
  validity: z.string().describe("Vigência da apólice"),
  waitingPeriod: z.string().optional().describe("Período de carência"),
  specialConditions: z.array(z.string()).describe("Condições especiais"),
  strengths: z.array(z.string()).describe("Pontos fortes da proposta"),
  weaknesses: z.array(z.string()).describe("Pontos fracos/riscos"),
});

export type ProposalAnalysis = z.infer<typeof proposalSchema>;

export async function analyzeProposalPdf(pdfUrl: string): Promise<ProposalAnalysis> {
  const pdfResponse = await fetch(pdfUrl);
  const pdfBuffer = await pdfResponse.arrayBuffer();
  const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

  const { output } = await generateText({
    model: "anthropic/claude-sonnet-4.6",
    output: Output.object({ schema: proposalSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: pdfBase64,
            mediaType: "application/pdf",
          },
          {
            type: "text",
            text: `Analise esta proposta de seguro em PDF. Extraia todos os dados estruturados:
            nome da seguradora, prêmio total, franquia, coberturas incluídas, exclusões,
            vigência, carência, condições especiais, pontos fortes e pontos fracos.
            Responda em português brasileiro.`,
          },
        ],
      },
    ],
  });

  return output!;
}
```

Create `src/lib/ai/compare-proposals.ts`:

```typescript
import { generateText } from "ai";
import type { ProposalAnalysis } from "./analyze-proposal";

export async function compareProposals(
  analyses: Array<{ insurerName: string; analysis: ProposalAnalysis }>
): Promise<string> {
  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.6",
    prompt: `Você é um consultor de seguros experiente. Compare as seguintes propostas de seguro e gere um relatório comparativo executivo em português brasileiro.

PROPOSTAS:
${JSON.stringify(analyses, null, 2)}

Gere um relatório com:
1. **Tabela comparativa** com colunas: Seguradora | Prêmio | Franquia | Coberturas | Exclusões
2. **Destaque** a proposta mais barata, a com maior cobertura, e a com melhor custo-benefício
3. **Resumo executivo** de 3-5 pontos para cada proposta
4. **Recomendação** fundamentada

Use formatação markdown.`,
  });

  return text;
}
```

- [ ] **Step 2: Create AI analysis server action**

Create `src/lib/actions/ai-analysis.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { proposals, comparisons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { analyzeProposalPdf } from "@/lib/ai/analyze-proposal";
import { compareProposals } from "@/lib/ai/compare-proposals";
import { revalidatePath } from "next/cache";

export async function runAiAnalysis(tenderId: number) {
  // Get all proposals for this tender
  const tenderProposals = await db
    .select()
    .from(proposals)
    .where(eq(proposals.tenderId, tenderId));

  if (tenderProposals.length === 0) {
    throw new Error("Nenhuma proposta para analisar");
  }

  // Analyze each proposal PDF
  const analyses = [];
  for (const proposal of tenderProposals) {
    const analysis = await analyzeProposalPdf(proposal.pdfUrl);

    // Save individual analysis
    await db
      .update(proposals)
      .set({ aiAnalysis: analysis })
      .where(eq(proposals.id, proposal.id));

    analyses.push({
      insurerName: analysis.insurerName || proposal.pdfFileName || "Desconhecida",
      analysis,
    });
  }

  // Generate comparison
  const summary = await compareProposals(analyses);

  // Save comparison
  await db
    .insert(comparisons)
    .values({
      tenderId,
      comparisonData: analyses,
      summary,
    })
    .onConflictDoUpdate({
      target: comparisons.tenderId,
      set: { comparisonData: analyses, summary, generatedAt: new Date() },
    });

  revalidatePath(`/editais/${tenderId}/comparativo`);
  return { summary, analyses };
}

export async function getComparison(tenderId: number) {
  const [comparison] = await db
    .select()
    .from(comparisons)
    .where(eq(comparisons.tenderId, tenderId));

  return comparison;
}
```

- [ ] **Step 3: Create comparison page**

Create `src/app/(admin)/editais/[id]/comparativo/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/header";
import { getTenderById } from "@/lib/actions/editais";
import { getComparison, runAiAnalysis } from "@/lib/actions/ai-analysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import { MessageResponse } from "@/components/ai-elements/message";

export default async function ComparativoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tender = await getTenderById(Number(id));
  if (!tender) notFound();

  const comparison = await getComparison(Number(id));

  return (
    <>
      <AppHeader title={`Comparativo - ${tender.title}`} />
      <div className="p-6 space-y-6">
        {!comparison ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                {tender.proposals.length} proposta(s) recebida(s). Clique para
                analisar com IA.
              </p>
              <form
                action={async () => {
                  "use server";
                  await runAiAnalysis(Number(id));
                }}
              >
                <Button type="submit" size="lg">
                  <Brain className="mr-2 h-4 w-4" />
                  Analisar Propostas com IA
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Análise Comparativa
                  <Badge variant="outline" className="ml-2">
                    {(comparison.comparisonData as any[]).length} propostas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MessageResponse>
                  {comparison.summary || ""}
                </MessageResponse>
              </CardContent>
            </Card>

            {(comparison.comparisonData as any[]).map((item: any, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{item.insurerName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Prêmio:</span>{" "}
                      <span className="font-medium">{item.analysis.totalPremium}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Franquia:</span>{" "}
                      <span className="font-medium">{item.analysis.deductible}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vigência:</span>{" "}
                      <span className="font-medium">{item.analysis.validity}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Coberturas:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.analysis.coverages?.map((c: string, j: number) => (
                        <Badge key={j} variant="secondary">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  {item.analysis.strengths?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-500 mb-1">Pontos fortes:</p>
                      <ul className="text-sm list-disc list-inside">
                        {item.analysis.strengths.map((s: string, j: number) => (
                          <li key={j}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.analysis.weaknesses?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-500 mb-1">Pontos fracos:</p>
                      <ul className="text-sm list-disc list-inside">
                        {item.analysis.weaknesses.map((w: string, j: number) => (
                          <li key={j}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <form
              action={async () => {
                "use server";
                await runAiAnalysis(Number(id));
              }}
            >
              <Button type="submit" variant="outline">
                <Brain className="mr-2 h-4 w-4" />
                Reanalisar
              </Button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add AI proposal analysis and comparison"
```

---

## Task 9: Insurer Registration Page

**Files:**
- Create: `src/app/(seguradora)/seguradoras/page.tsx` (admin side)
- Create: `src/app/api/webhooks/clerk/route.ts`

- [ ] **Step 1: Create Clerk webhook to sync users**

Create `src/app/api/webhooks/clerk/route.ts`:

```typescript
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    const email = email_addresses?.[0]?.email_address || "";
    const name = [first_name, last_name].filter(Boolean).join(" ");
    const role = (public_metadata?.role as string) || "seguradora";

    await db
      .insert(users)
      .values({
        clerkId: id,
        email,
        name,
        role: role as any,
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: { email, name, role: role as any },
      });
  }

  return new Response("OK", { status: 200 });
}
```

- [ ] **Step 2: Create admin insurers list page**

Create `src/app/(admin)/seguradoras/page.tsx`:

```tsx
import { AppHeader } from "@/components/layout/header";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function SeguradorasPage() {
  const insurers = await db
    .select()
    .from(users)
    .where(eq(users.role, "seguradora"));

  return (
    <>
      <AppHeader title="Seguradoras Cadastradas" />
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          {insurers.length} seguradora(s) cadastrada(s). Novas seguradoras se
          cadastram via link público.
        </p>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insurers.map((ins) => (
                <TableRow key={ins.id}>
                  <TableCell className="font-medium">{ins.name || "—"}</TableCell>
                  <TableCell>{ins.email}</TableCell>
                  <TableCell className="font-mono">{ins.cnpj || "—"}</TableCell>
                  <TableCell>{ins.companyName || "—"}</TableCell>
                  <TableCell>
                    {ins.createdAt
                      ? new Date(ins.createdAt).toLocaleDateString("pt-BR")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {insurers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma seguradora cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Install svix and commit**

```bash
npm install svix
git add .
git commit -m "feat: add Clerk webhook sync and insurer registration"
```

---

## Task 10: Database Migration and Seed

**Files:**
- Modify: `package.json` (scripts)

- [ ] **Step 1: Add scripts to package.json**

Add to `package.json` scripts:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/lib/db/seed.ts"
  }
}
```

```bash
npm install -D tsx
```

- [ ] **Step 2: Generate and push schema**

```bash
npm run db:generate
npm run db:push
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add database migration scripts"
```

---

## Task 11: Vercel Setup and Deploy

- [ ] **Step 1: Install Vercel CLI**

```bash
npm i -g vercel
```

- [ ] **Step 2: Link project and configure**

```bash
cd "C:\Users\ujest\OneDrive\Downloads PC novo\Programação em Claude\plamont portal seguros"
vercel link
```

- [ ] **Step 3: Add Neon Postgres via Marketplace**

```bash
vercel integration add neon
```

- [ ] **Step 4: Enable AI Gateway**

Go to `https://vercel.com/{team}/{project}/settings` -> AI Gateway -> Enable

- [ ] **Step 5: Pull environment variables**

```bash
vercel env pull .env.local
```

This provisions `DATABASE_URL`, `VERCEL_OIDC_TOKEN`, and other env vars.

- [ ] **Step 6: Add Clerk env vars**

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add CLERK_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL    # value: /sign-in
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL    # value: /sign-up
```

- [ ] **Step 7: Deploy**

```bash
vercel deploy
```

- [ ] **Step 8: Commit final state**

```bash
git add .
git commit -m "chore: configure Vercel deployment"
```

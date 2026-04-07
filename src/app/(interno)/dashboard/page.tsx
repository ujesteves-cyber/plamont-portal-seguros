import { AppHeader } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { vehicles, tenders, users } from "@/lib/db/schema";
import { eq, and, gte, count, sql } from "drizzle-orm";
import {
  Truck,
  FileText,
  Building2,
  Clock,
  AlertTriangle,
  Shield,
  DollarSign,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Total vehicles
  const [vehicleCount] = await db
    .select({ total: count() })
    .from(vehicles);

  // Vehicles expiring in next 30 days
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const [expiringCount] = await db
    .select({ total: count() })
    .from(vehicles)
    .where(
      sql`${vehicles.policyExpiry} >= ${now.toISOString()}::timestamp AND ${vehicles.policyExpiry} <= ${thirtyDays.toISOString()}::timestamp`
    );

  // Already expired
  const [expiredCount] = await db
    .select({ total: count() })
    .from(vehicles)
    .where(
      sql`${vehicles.policyExpiry} IS NOT NULL AND ${vehicles.policyExpiry} < ${now.toISOString()}::timestamp`
    );

  // Open tenders
  const [openTendersCount] = await db
    .select({ total: count() })
    .from(tenders)
    .where(eq(tenders.status, "Aberto"));

  // Total tenders
  const [totalTendersCount] = await db
    .select({ total: count() })
    .from(tenders);

  // Registered corretoras
  const [corretorasCount] = await db
    .select({ total: count() })
    .from(users)
    .where(eq(users.role, "corretor"));

  // Vehicles by category
  const vehiclesByCategory = await db
    .select({
      category: vehicles.category,
      total: count(),
    })
    .from(vehicles)
    .groupBy(vehicles.category)
    .orderBy(sql`count(*) DESC`);

  // Vehicles by company
  const vehiclesByCompany = await db
    .select({
      company: vehicles.company,
      total: count(),
    })
    .from(vehicles)
    .groupBy(vehicles.company)
    .orderBy(sql`count(*) DESC`)
    .limit(8);

  // Vehicles by insurer
  const vehiclesByInsurer = await db
    .select({
      insurer: vehicles.currentInsurer,
      total: count(),
    })
    .from(vehicles)
    .where(sql`${vehicles.currentInsurer} IS NOT NULL AND ${vehicles.currentInsurer} != ''`)
    .groupBy(vehicles.currentInsurer)
    .orderBy(sql`count(*) DESC`)
    .limit(6);

  // Vehicles by status
  const vehiclesByStatus = await db
    .select({
      status: vehicles.status,
      total: count(),
    })
    .from(vehicles)
    .groupBy(vehicles.status)
    .orderBy(sql`count(*) DESC`);

  return (
    <>
      <AppHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veículos</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicleCount.total}</div>
              <p className="text-xs text-muted-foreground">na frota</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Editais</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openTendersCount.total}</div>
              <p className="text-xs text-muted-foreground">
                abertos de {totalTendersCount.total} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Corretoras</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{corretorasCount.total}</div>
              <p className="text-xs text-muted-foreground">cadastradas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Vencer</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringCount.total}</div>
              <p className="text-xs text-muted-foreground">próximos 30 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert: Expired */}
        {expiredCount.total > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-sm font-medium text-destructive">
                {expiredCount.total} apólice(s) vencida(s)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Existem veículos com apólices já vencidas que precisam de renovação urgente.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Analytics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* By Category */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {vehiclesByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.category}</span>
                  <Badge variant="outline">{item.total}</Badge>
                </div>
              ))}
              {vehiclesByCategory.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              )}
            </CardContent>
          </Card>

          {/* By Company */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Por Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {vehiclesByCompany.map((item) => (
                <div key={item.company || "sem"} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.company || "Sem empresa"}</span>
                  <Badge variant="outline">{item.total}</Badge>
                </div>
              ))}
              {vehiclesByCompany.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              )}
            </CardContent>
          </Card>

          {/* By Insurer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Por Seguradora
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {vehiclesByInsurer.map((item) => (
                <div key={item.insurer || "sem"} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.insurer || "Sem seguradora"}</span>
                  <Badge variant="outline">{item.total}</Badge>
                </div>
              ))}
              {vehiclesByInsurer.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem dados</p>
              )}
            </CardContent>
          </Card>

          {/* By Status */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Situação das Apólices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {vehiclesByStatus.map((item) => (
                  <div
                    key={item.status || "sem"}
                    className="flex items-center gap-2 rounded-lg border px-4 py-2"
                  >
                    <span className="text-sm font-medium">{item.status || "Sem status"}</span>
                    <Badge>{item.total}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

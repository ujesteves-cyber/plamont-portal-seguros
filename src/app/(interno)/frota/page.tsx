import { Suspense } from "react";
import { AppHeader } from "@/components/layout/header";
import { FrotaTable } from "@/components/frota/frota-table";
import { FrotaFilters } from "@/components/frota/frota-filters";
import { Button } from "@/components/ui/button";
import { getVehicles } from "@/lib/actions/frota";
import Link from "next/link";
import { Upload } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function FrotaPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    company?: string;
    search?: string;
  }>;
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
          <Button render={<Link href="/frota/importar" />}>
            <Upload className="mr-2 h-4 w-4" />
            Importar Planilha
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

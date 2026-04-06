import { AppHeader } from "@/components/layout/header";
import { EditalForm } from "@/components/editais/edital-form";
import { getVehicles } from "@/lib/actions/frota";

export const dynamic = 'force-dynamic';

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

import { AppHeader } from "@/components/layout/header";
import { EditalCard } from "@/components/editais/edital-card";
import { Button } from "@/components/ui/button";
import { getTenders } from "@/lib/actions/editais";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function EditaisPage() {
  const tenders = await getTenders();

  return (
    <>
      <AppHeader title="Editais" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button render={<Link href="/editais/novo" />}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Edital
          </Button>
        </div>
        {tenders.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            Nenhum edital criado. Clique em &quot;Novo Edital&quot; para
            comecar.
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

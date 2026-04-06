import { AppHeader } from "@/components/layout/header";
import { EditalCard } from "@/components/editais/edital-card";
import { getTenders } from "@/lib/actions/editais";

export default async function CorretorEditaisPage() {
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
              <EditalCard key={t.id} tender={t} basePath="/c/editais" />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import { AppHeader } from "@/components/layout/header";

export default function CorretorPainelPage() {
  return (
    <>
      <AppHeader title="Painel do Corretor" />
      <div className="p-6">
        <p className="text-muted-foreground">Seus editais e propostas aparecerao aqui.</p>
      </div>
    </>
  );
}

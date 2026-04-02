import { AppHeader } from "@/components/layout/header";

export default function SeguradoraPainelPage() {
  return (
    <>
      <AppHeader title="Painel da Seguradora" />
      <div className="p-6">
        <p className="text-muted-foreground">Editais abertos aparecerao aqui.</p>
      </div>
    </>
  );
}

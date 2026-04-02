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

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppHeader } from "@/components/layout/header";
import { PropostaUpload } from "@/components/propostas/proposta-upload";

export default async function EnviarPropostaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <>
      <AppHeader title="Enviar Proposta" />
      <div className="p-6">
        <PropostaUpload tenderId={Number(id)} insurerId={user.id} />
      </div>
    </>
  );
}

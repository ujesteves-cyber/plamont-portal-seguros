import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AppHeader } from "@/components/layout/header";
import { PropostaUpload } from "@/components/propostas/proposta-upload";

export default async function EnviarPropostaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId));

  if (!user) redirect("/sign-in");

  return (
    <>
      <AppHeader title="Enviar Proposta" />
      <div className="p-6">
        <PropostaUpload tenderId={Number(id)} insurerId={user.id} />
      </div>
    </>
  );
}

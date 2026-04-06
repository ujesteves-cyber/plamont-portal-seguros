import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AppHeader } from "@/components/layout/header";
import { getProposalsByInsurer } from "@/lib/actions/propostas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, Send } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MinhasPropostasPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId));

  if (!user) redirect("/sign-in");

  const results = await getProposalsByInsurer(user.id);

  return (
    <>
      <AppHeader title="Minhas Propostas" />
      <div className="p-6 space-y-4">
        {results.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Send className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Você ainda não enviou nenhuma proposta.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {results.map((r) => (
              <Card key={r.proposal.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {r.tenderTitle}
                  </CardTitle>
                  <div className="flex gap-2">
                    {r.proposal.isWinner && (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Vencedora
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {r.tenderStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Prêmio:</span>{" "}
                      <span className="font-medium">{r.proposal.totalPremium || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Franquia:</span>{" "}
                      <span className="font-medium">{r.proposal.deductible || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cobertura:</span>{" "}
                      <span className="font-medium">{r.proposal.coverageType || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vigência:</span>{" "}
                      <span className="font-medium">{r.proposal.validity || "—"}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enviada em{" "}
                    {r.proposal.submittedAt
                      ? new Date(r.proposal.submittedAt).toLocaleDateString("pt-BR")
                      : "—"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

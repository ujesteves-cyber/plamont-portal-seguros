import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppHeader } from "@/components/layout/header";
import { getTenderById } from "@/lib/actions/editais";
import { getComparison, runAiAnalysis } from "@/lib/actions/ai-analysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import { MessageResponse } from "@/components/ai-elements/message";

export default async function ComparativoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");
  if (sessionUser.role !== "diretor") redirect("/editais");

  const { id } = await params;
  const tender = await getTenderById(Number(id));
  if (!tender) notFound();

  const comparison = await getComparison(Number(id));

  return (
    <>
      <AppHeader title={`Comparativo - ${tender.title}`} />
      <div className="p-6 space-y-6">
        {!comparison ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                {tender.proposals.length} proposta(s) recebida(s). Clique para
                analisar com IA.
              </p>
              <form
                action={async () => {
                  "use server";
                  await runAiAnalysis(Number(id));
                }}
              >
                <Button type="submit" size="lg">
                  <Brain className="mr-2 h-4 w-4" />
                  Analisar Propostas com IA
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Análise Comparativa
                  <Badge variant="outline" className="ml-2">
                    {Array.isArray(comparison.comparisonData) ? comparison.comparisonData.length : 0} propostas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MessageResponse>
                  {comparison.summary || ""}
                </MessageResponse>
              </CardContent>
            </Card>

            {Array.isArray(comparison.comparisonData) && comparison.comparisonData.map((item: any, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{item.insurerName || "Proposta"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.analysis ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Prêmio:</span>{" "}
                          <span className="font-medium">{item.analysis.totalPremium || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Franquia:</span>{" "}
                          <span className="font-medium">{item.analysis.deductible || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Vigência:</span>{" "}
                          <span className="font-medium">{item.analysis.validity || "—"}</span>
                        </div>
                      </div>
                      {item.analysis.coverages?.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Coberturas:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.analysis.coverages.map((c: string, j: number) => (
                              <Badge key={j} variant="secondary">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.analysis.strengths?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-500 mb-1">Pontos fortes:</p>
                          <ul className="text-sm list-disc list-inside">
                            {item.analysis.strengths.map((s: string, j: number) => (
                              <li key={j}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.analysis.weaknesses?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-500 mb-1">Pontos fracos:</p>
                          <ul className="text-sm list-disc list-inside">
                            {item.analysis.weaknesses.map((w: string, j: number) => (
                              <li key={j}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Análise não disponível para esta proposta.</p>
                  )}
                </CardContent>
              </Card>
            ))}

            <form
              action={async () => {
                "use server";
                await runAiAnalysis(Number(id));
              }}
            >
              <Button type="submit" variant="outline">
                <Brain className="mr-2 h-4 w-4" />
                Reanalisar
              </Button>
            </form>
          </>
        )}
      </div>
    </>
  );
}

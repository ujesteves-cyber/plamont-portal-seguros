import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/header";
import {
  getTenderById,
  publishTender,
  closeTender,
} from "@/lib/actions/editais";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export default async function EditalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tender = await getTenderById(Number(id));
  if (!tender) notFound();

  return (
    <>
      <AppHeader title={tender.title} />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {tender.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {tender.insuranceType} | Prazo:{" "}
            {format(new Date(tender.deadline), "dd/MM/yyyy HH:mm", {
              locale: ptBR,
            })}
          </span>
          <div className="ml-auto flex gap-2">
            {tender.status === "Rascunho" && (
              <form
                action={async () => {
                  "use server";
                  await publishTender(Number(id));
                }}
              >
                <Button type="submit">Publicar Edital</Button>
              </form>
            )}
            {tender.status === "Aberto" && (
              <form
                action={async () => {
                  "use server";
                  await closeTender(Number(id));
                }}
              >
                <Button type="submit" variant="outline">
                  Encerrar Recebimento
                </Button>
              </form>
            )}
            {tender.proposals.length > 0 && (
              <Button
                render={<Link href={`/editais/${id}/comparativo`} />}
                variant="secondary"
              >
                Ver Comparativo IA
              </Button>
            )}
          </div>
        </div>

        {tender.description && (
          <Card>
            <CardHeader>
              <CardTitle>Descricao</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{tender.description}</p>
            </CardContent>
          </Card>
        )}

        {tender.vehicles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Veiculos ({tender.vehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead>Empresa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tender.vehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono">{v.plate}</TableCell>
                      <TableCell>{v.vehicleType}</TableCell>
                      <TableCell>
                        {v.brand} {v.model}
                      </TableCell>
                      <TableCell>{v.company}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Propostas ({tender.proposals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {tender.proposals.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhuma proposta recebida.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seguradora</TableHead>
                    <TableHead>Premio</TableHead>
                    <TableHead>Franquia</TableHead>
                    <TableHead>Cobertura</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead>Enviada em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tender.proposals.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.insurerName}
                      </TableCell>
                      <TableCell>{p.totalPremium || "—"}</TableCell>
                      <TableCell>{p.deductible || "—"}</TableCell>
                      <TableCell>{p.coverageType || "—"}</TableCell>
                      <TableCell>
                        <a
                          href={p.pdfUrl}
                          target="_blank"
                          rel="noopener"
                          className="text-primary underline"
                        >
                          {p.pdfFileName || "Download"}
                        </a>
                      </TableCell>
                      <TableCell>
                        {p.submittedAt &&
                          format(
                            new Date(p.submittedAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: ptBR }
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

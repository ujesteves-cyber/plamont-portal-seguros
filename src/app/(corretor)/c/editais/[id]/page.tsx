import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/header";
import { getTenderById } from "@/lib/actions/editais";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function CorretorEditalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tender = await getTenderById(Number(id));
  if (!tender) notFound();

  const attachments = (tender.attachments as { url: string; fileName: string }[] | null) ?? [];

  return (
    <>
      <AppHeader title={tender.title} />
      <div className="p-6 space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>{tender.title}</CardTitle>
              <Badge>{tender.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tipo de Seguro:</span>{" "}
                <span className="font-medium">{tender.insuranceType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Prazo:</span>{" "}
                <span className="font-medium">
                  {format(new Date(tender.deadline), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
            {tender.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Descrição:</p>
                <p className="text-sm">{tender.description}</p>
              </div>
            )}
            {tender.coverageRequired && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Coberturas Exigidas:</p>
                <p className="text-sm">{tender.coverageRequired}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos para Download
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tender.editalPdfUrl ? (
              <a
                href={tender.editalPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">PDF do Edital</p>
                  <p className="text-xs text-muted-foreground">{tender.editalPdfFileName}</p>
                </div>
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum PDF do edital disponível.</p>
            )}

            {attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Anexos:</p>
                {attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted transition-colors"
                  >
                    <Download className="h-4 w-4 text-primary" />
                    <span className="text-sm">{att.fileName}</span>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {tender.vehicles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Veículos ({tender.vehicles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                {tender.vehicles.map((v) => (
                  <div key={v.id} className="flex gap-4 py-1 border-b last:border-0">
                    <span className="font-mono font-medium">{v.plate}</span>
                    <span className="text-muted-foreground">{v.vehicleType}</span>
                    <span className="text-muted-foreground ml-auto">{v.category}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tender.status === "Aberto" && (
          <Link href={`/c/editais/${id}/proposta`}>
            <Button size="lg" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Enviar Proposta
            </Button>
          </Link>
        )}
      </div>
    </>
  );
}

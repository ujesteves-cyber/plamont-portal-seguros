import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Tender = {
  id: number;
  title: string;
  insuranceType: string;
  status: string;
  deadline: Date;
  createdAt: Date | null;
};

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Rascunho: "secondary",
  Aberto: "default",
  Encerrado: "outline",
  Finalizado: "destructive",
};

export function EditalCard({ tender }: { tender: Tender }) {
  return (
    <Link href={`/editais/${tender.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-base">{tender.title}</CardTitle>
          <Badge variant={statusColors[tender.status] || "default"}>
            {tender.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{tender.insuranceType}</span>
            <span>
              Prazo:{" "}
              {format(new Date(tender.deadline), "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

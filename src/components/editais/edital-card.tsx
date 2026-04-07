"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { deleteTender } from "@/lib/actions/editais";

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

export function EditalCard({
  tender,
  basePath = "/editais",
  showDelete = false,
}: {
  tender: Tender;
  basePath?: string;
  showDelete?: boolean;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Tem certeza que deseja excluir o edital "${tender.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteTender(tender.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Link href={`${basePath}/${tender.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-base">{tender.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[tender.status] || "default"}>
              {tender.status}
            </Badge>
            {showDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive h-7 w-7 p-0"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
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

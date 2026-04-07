"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Pencil } from "lucide-react";
import { deleteVehicle } from "@/lib/actions/frota";

type Vehicle = {
  id: number;
  plate: string;
  vehicleType: string;
  category: string;
  brand: string | null;
  model: string | null;
  company: string | null;
  currentInsurer: string | null;
  currentCoverage: string | null;
  policyExpiry: Date | null;
  status: string | null;
};

export function FrotaTable({ vehicles }: { vehicles: Vehicle[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return;
    setDeletingId(id);
    try {
      await deleteVehicle(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Marca/Modelo</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Seguradora</TableHead>
            <TableHead>Cobertura</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                Nenhum veículo encontrado.
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono font-medium">
                  {v.plate}
                </TableCell>
                <TableCell>{v.vehicleType}</TableCell>
                <TableCell>
                  <Badge variant="outline">{v.category}</Badge>
                </TableCell>
                <TableCell>
                  {[v.brand, v.model].filter(Boolean).join(" ") || "—"}
                </TableCell>
                <TableCell>{v.company}</TableCell>
                <TableCell>{v.currentInsurer || "—"}</TableCell>
                <TableCell>{v.currentCoverage || "—"}</TableCell>
                <TableCell>
                  {v.policyExpiry
                    ? format(new Date(v.policyExpiry), "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : "—"}
                </TableCell>
                <TableCell>
                  {v.status ? (
                    <Badge
                      variant={v.status === "VENDIDO" ? "secondary" : "default"}
                    >
                      {v.status}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

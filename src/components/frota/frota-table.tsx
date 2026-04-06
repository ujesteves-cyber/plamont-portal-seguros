"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
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
                  {v.brand} {v.model}
                </TableCell>
                <TableCell>{v.company}</TableCell>
                <TableCell>{v.currentInsurer || "\u2014"}</TableCell>
                <TableCell>{v.currentCoverage || "\u2014"}</TableCell>
                <TableCell>
                  {v.policyExpiry
                    ? format(new Date(v.policyExpiry), "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : "\u2014"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={v.status === "VENDIDO" ? "secondary" : "default"}
                  >
                    {v.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

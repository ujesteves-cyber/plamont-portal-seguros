"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Pencil, ArrowUpDown } from "lucide-react";
import { deleteVehicle, updateVehicle } from "@/lib/actions/frota";

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
  broker: string | null;
};

type SortKey = "plate" | "vehicleType" | "category" | "company" | "currentInsurer" | "policyExpiry" | "status" | "broker";

export function FrotaTable({ vehicles }: { vehicles: Vehicle[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("plate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      if (sortKey === "policyExpiry") {
        const aTime = a.policyExpiry ? new Date(a.policyExpiry).getTime() : 0;
        const bTime = b.policyExpiry ? new Date(b.policyExpiry).getTime() : 0;
        return sortDir === "asc" ? aTime - bTime : bTime - aTime;
      }
      const aVal = String(a[sortKey] ?? "");
      const bVal = String(b[sortKey] ?? "");
      const cmp = aVal.localeCompare(bVal, "pt-BR");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [vehicles, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return;
    setDeletingId(id);
    try {
      await deleteVehicle(id);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingVehicle) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateVehicle(editingVehicle.id, {
        plate: fd.get("plate") as string,
        vehicleType: fd.get("vehicleType") as string,
        brand: fd.get("brand") as string || undefined,
        model: fd.get("model") as string || undefined,
        company: fd.get("company") as string || undefined,
        currentInsurer: fd.get("currentInsurer") as string || undefined,
        currentCoverage: fd.get("currentCoverage") as string || undefined,
        status: fd.get("status") as string || undefined,
        broker: fd.get("broker") as string || undefined,
      });
      setEditingVehicle(null);
    } finally {
      setSaving(false);
    }
  }

  function SortHeader({ label, sortKey: key }: { label: string; sortKey: SortKey }) {
    return (
      <TableHead
        className="cursor-pointer select-none hover:text-foreground"
        onClick={() => toggleSort(key)}
      >
        <span className="flex items-center gap-1">
          {label}
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        </span>
      </TableHead>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader label="Placa" sortKey="plate" />
              <SortHeader label="Tipo" sortKey="vehicleType" />
              <SortHeader label="Categoria" sortKey="category" />
              <TableHead>Marca/Modelo</TableHead>
              <SortHeader label="Empresa" sortKey="company" />
              <SortHeader label="Seguradora" sortKey="currentInsurer" />
              <TableHead>Cobertura</TableHead>
              <SortHeader label="Vencimento" sortKey="policyExpiry" />
              <SortHeader label="Status" sortKey="status" />
              <SortHeader label="Corretor" sortKey="broker" />
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  Nenhum veículo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono font-medium">{v.plate}</TableCell>
                  <TableCell>{v.vehicleType}</TableCell>
                  <TableCell><Badge variant="outline">{v.category}</Badge></TableCell>
                  <TableCell>{[v.brand, v.model].filter(Boolean).join(" ") || "—"}</TableCell>
                  <TableCell>{v.company || "—"}</TableCell>
                  <TableCell>{v.currentInsurer || "—"}</TableCell>
                  <TableCell>{v.currentCoverage || "—"}</TableCell>
                  <TableCell>
                    {v.policyExpiry
                      ? format(new Date(v.policyExpiry), "dd/MM/yyyy", { locale: ptBR })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {v.status ? (
                      <Badge variant={v.status === "VENDIDO" ? "secondary" : "default"}>
                        {v.status}
                      </Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{v.broker || "—"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingVehicle(v)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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

      <Dialog open={!!editingVehicle} onOpenChange={() => setEditingVehicle(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
          </DialogHeader>
          {editingVehicle && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="plate">Placa</Label>
                  <Input id="plate" name="plate" defaultValue={editingVehicle.plate} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vehicleType">Tipo</Label>
                  <Input id="vehicleType" name="vehicleType" defaultValue={editingVehicle.vehicleType} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" name="brand" defaultValue={editingVehicle.brand || ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="model">Modelo</Label>
                  <Input id="model" name="model" defaultValue={editingVehicle.model || ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" name="company" defaultValue={editingVehicle.company || ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currentInsurer">Seguradora</Label>
                  <Input id="currentInsurer" name="currentInsurer" defaultValue={editingVehicle.currentInsurer || ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currentCoverage">Cobertura</Label>
                  <Input id="currentCoverage" name="currentCoverage" defaultValue={editingVehicle.currentCoverage || ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="status">Status</Label>
                  <Input id="status" name="status" defaultValue={editingVehicle.status || ""} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="broker">Corretor</Label>
                  <Input id="broker" name="broker" defaultValue={editingVehicle.broker || ""} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingVehicle(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INSURANCE_TYPES } from "@/lib/constants";
import { createTender } from "@/lib/actions/editais";

type Vehicle = {
  id: number;
  plate: string;
  vehicleType: string;
  category: string;
};

export function EditalForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [insuranceType, setInsuranceType] = useState("Frota");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    await createTender({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      insuranceType,
      coverageRequired: formData.get("coverageRequired") as string,
      deadline: formData.get("deadline") as string,
      vehicleIds: selectedVehicles,
    });

    router.push("/editais");
  }

  function toggleVehicle(id: number) {
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedVehicles(vehicles.map((v) => v.id));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Dados do Edital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Titulo</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Ex: Seguro Frota 2026"
            />
          </div>
          <div>
            <Label>Tipo de Seguro</Label>
            <Select
              value={insuranceType}
              onValueChange={(v) => setInsuranceType(v ?? "Frota")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(INSURANCE_TYPES).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Descreva os requisitos..."
            />
          </div>
          <div>
            <Label htmlFor="coverageRequired">Coberturas Exigidas</Label>
            <Textarea
              id="coverageRequired"
              name="coverageRequired"
              rows={3}
              placeholder="Ex: Cobertura total, terceiros, APP..."
            />
          </div>
          <div>
            <Label htmlFor="deadline">Prazo para Propostas</Label>
            <Input
              id="deadline"
              name="deadline"
              type="datetime-local"
              required
            />
          </div>
        </CardContent>
      </Card>

      {insuranceType === "Frota" && vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Veiculos ({selectedVehicles.length} selecionados)
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAll}
              >
                Selecionar Todos
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {vehicles.map((v) => (
                <label
                  key={v.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedVehicles.includes(v.id)}
                    onChange={() => toggleVehicle(v.id)}
                    className="rounded"
                  />
                  <span className="font-mono text-sm">{v.plate}</span>
                  <span className="text-sm text-muted-foreground">
                    {v.vehicleType}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {v.category}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar Edital"}
      </Button>
    </form>
  );
}

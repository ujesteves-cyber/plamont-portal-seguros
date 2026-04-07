"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { importVehiclesFromData } from "@/lib/actions/frota";

export default function AdicionarVeiculoPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await importVehiclesFromData([{
        numberRef: "",
        plate: fd.get("plate") as string,
        vehicleType: fd.get("vehicleType") as string,
        brand: fd.get("brand") as string,
        model: fd.get("model") as string,
        company: fd.get("company") as string,
        insurer: fd.get("insurer") as string,
        policy: fd.get("policy") as string,
        coverage: fd.get("coverage") as string,
        expiry: fd.get("expiry") as string || null,
        status: fd.get("status") as string || "A VENCER",
        broker: fd.get("broker") as string,
        notes: fd.get("notes") as string,
      }]);
      router.push("/frota");
    } catch {
      alert("Erro ao adicionar veículo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader title="Adicionar Veículo" />
      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Novo Veículo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="plate">Placa *</Label>
                  <Input id="plate" name="plate" required placeholder="ABC-1234" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vehicleType">Tipo de Veículo *</Label>
                  <Input id="vehicleType" name="vehicleType" required placeholder="CAMINHAO, ONIBUS..." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" name="brand" placeholder="Volkswagen" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="model">Modelo</Label>
                  <Input id="model" name="model" placeholder="Constellation 24.280" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" name="company" placeholder="PLAMONT ENG." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="insurer">Seguradora</Label>
                  <Input id="insurer" name="insurer" placeholder="Porto Seguro" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="policy">Nº Apólice</Label>
                  <Input id="policy" name="policy" placeholder="123456" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="coverage">Cobertura</Label>
                  <Input id="coverage" name="coverage" placeholder="Compreensiva" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="expiry">Vencimento</Label>
                  <Input id="expiry" name="expiry" placeholder="DD/MM/AAAA" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="status">Status</Label>
                  <Input id="status" name="status" defaultValue="A VENCER" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="broker">Corretor</Label>
                  <Input id="broker" name="broker" placeholder="Nome do corretor" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="notes">Observações</Label>
                  <Input id="notes" name="notes" placeholder="Obs..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push("/frota")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Adicionar Veículo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

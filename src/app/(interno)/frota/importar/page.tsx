"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { importVehiclesFromData } from "@/lib/actions/frota";
import * as XLSX from "xlsx";

export default function ImportarPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      const mapped = rows.map((row) => ({
        numberRef: String(row["N°"] || ""),
        plate: String(row["PLACA"] || ""),
        vehicleType: String(row["TIPO DE VEÍCULO"] || ""),
        brand: String(row["MARCA"] || ""),
        model: String(row["MODELO"] || ""),
        company: String(row["EMPRESA"] || ""),
        insurer: String(row["SEGURADORA"] || ""),
        policy: String(row["Nº APOLICE"] || ""),
        coverage: String(row["COBERTURA"] || ""),
        expiry: row["VENCIMENTO"] ? String(row["VENCIMENTO"]) : null,
        status: String(row["SITUAÇÃO"] || "A VENCER"),
        broker: String(row["CORRETOR"] || ""),
        notes: String(row["OBS"] || ""),
      }));

      const { count } = await importVehiclesFromData(mapped);
      setResult(`${count} veículos importados com sucesso!`);
      setTimeout(() => router.push("/frota"), 2000);
    } catch (err: any) {
      setResult(`Erro ao importar: ${err?.message || "Verifique o formato da planilha."}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader title="Importar Planilha" />
      <div className="p-6 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Importar Frota</CardTitle>
            <CardDescription>
              Envie a planilha .xlsx com os veículos. Colunas esperadas: PLACA,
              TIPO DE VEÍCULO, MARCA, MODELO, EMPRESA, SEGURADORA, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={loading}
            />
            {loading && (
              <p className="text-sm text-muted-foreground">Processando...</p>
            )}
            {result && <p className="text-sm font-medium">{result}</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitProposal } from "@/lib/actions/propostas";
import { Upload } from "lucide-react";

export function PropostaUpload({
  tenderId,
  insurerId,
}: {
  tenderId: number;
  insurerId: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const { url, fileName } = await res.json();
    setPdfUrl(url);
    setPdfFileName(fileName);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pdfUrl) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    await submitProposal({
      tenderId,
      insurerId,
      pdfUrl,
      pdfFileName,
      totalPremium: formData.get("totalPremium") as string,
      deductible: formData.get("deductible") as string,
      coverageType: formData.get("coverageType") as string,
      validity: formData.get("validity") as string,
    });

    router.push("/editais");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Arquivo PDF da Proposta</Label>
            <Input type="file" accept=".pdf" onChange={handleFileUpload} required />
            {pdfFileName && (
              <p className="text-sm text-muted-foreground mt-1">
                <Upload className="inline h-3 w-3 mr-1" />
                {pdfFileName} enviado
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="totalPremium">Premio Total (R$)</Label>
            <Input id="totalPremium" name="totalPremium" placeholder="Ex: 150.000,00" />
          </div>
          <div>
            <Label htmlFor="deductible">Franquia</Label>
            <Input id="deductible" name="deductible" placeholder="Ex: 10% do valor FIPE" />
          </div>
          <div>
            <Label htmlFor="coverageType">Tipo de Cobertura</Label>
            <Input id="coverageType" name="coverageType" placeholder="Ex: Total, Terceiros" />
          </div>
          <div>
            <Label htmlFor="validity">Vigencia</Label>
            <Input id="validity" name="validity" placeholder="Ex: 12 meses" />
          </div>
        </CardContent>
      </Card>
      <Button type="submit" disabled={loading || !pdfUrl}>
        {loading ? "Enviando..." : "Enviar Proposta"}
      </Button>
    </form>
  );
}

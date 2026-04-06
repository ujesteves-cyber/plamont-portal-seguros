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
import { Upload, X } from "lucide-react";

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
  const [editalPdfUrl, setEditalPdfUrl] = useState("");
  const [editalPdfFileName, setEditalPdfFileName] = useState("");
  const [attachments, setAttachments] = useState<{ url: string; fileName: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  async function handleEditalPdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url, fileName } = await res.json();
      setEditalPdfUrl(url);
      setEditalPdfFileName(fileName);
    } catch {
      alert("Erro ao enviar PDF do edital.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAttachmentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url, fileName } = await res.json();
      setAttachments((prev) => [...prev, { url, fileName }]);
    } catch {
      alert("Erro ao enviar anexo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await createTender({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        insuranceType,
        coverageRequired: formData.get("coverageRequired") as string,
        deadline: formData.get("deadline") as string,
        vehicleIds: selectedVehicles,
        editalPdfUrl: editalPdfUrl || undefined,
        editalPdfFileName: editalPdfFileName || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      router.push("/editais");
    } catch {
      alert("Erro ao criar edital. Tente novamente.");
    } finally {
      setLoading(false);
    }
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

      <Card>
        <CardHeader>
          <CardTitle>Documentos do Edital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>PDF do Edital (documento oficial)</Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleEditalPdfUpload}
              disabled={uploading}
            />
            {editalPdfFileName && (
              <p className="text-sm text-muted-foreground mt-1">
                <Upload className="inline h-3 w-3 mr-1" />
                {editalPdfFileName} enviado
              </p>
            )}
          </div>
          <div>
            <Label>Anexos (documentos extras)</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleAttachmentUpload}
              disabled={uploading}
            />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="h-3 w-3" />
                    <span>{att.fileName}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

      <Button type="submit" disabled={loading || uploading}>
        {loading ? "Criando..." : "Criar Edital"}
      </Button>
    </form>
  );
}

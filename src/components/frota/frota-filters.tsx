"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VEHICLE_CATEGORIES, GROUP_COMPANIES } from "@/lib/constants";

export function FrotaFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/frota?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Input
        placeholder="Buscar por placa..."
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => updateFilter("search", e.target.value)}
        className="w-[200px]"
      />
      <Select
        value={searchParams.get("category") || "all"}
        onValueChange={(v) => updateFilter("category", v)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {Object.values(VEHICLE_CATEGORIES).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("company") || "all"}
        onValueChange={(v) => updateFilter("company", v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as empresas</SelectItem>
          {GROUP_COMPANIES.map((co) => (
            <SelectItem key={co} value={co}>
              {co}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

"use server";

import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { VEHICLE_TYPE_TO_CATEGORY } from "@/lib/constants";

export async function getVehicles(filters?: {
  category?: string;
  company?: string;
  search?: string;
}) {
  const conditions = [];

  if (filters?.category) {
    conditions.push(eq(vehicles.category, filters.category as any));
  }
  if (filters?.company) {
    conditions.push(eq(vehicles.company, filters.company));
  }
  if (filters?.search) {
    conditions.push(ilike(vehicles.plate, `%${filters.search}%`));
  }

  const result = await db
    .select()
    .from(vehicles)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(vehicles.category, vehicles.plate);

  return result;
}

export async function importVehiclesFromData(
  data: Array<{
    numberRef: string;
    plate: string;
    vehicleType: string;
    brand: string;
    model: string;
    company: string;
    insurer: string;
    policy: string;
    coverage: string;
    expiry: string | null;
    status: string;
    broker: string;
    notes: string;
  }>
) {
  function parseDate(str: string | null): Date | null {
    if (!str) return null;
    // Handle DD/MM/YYYY format
    const parts = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (parts) {
      return new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]));
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  const rows = data
    .filter((row) => row.plate && row.plate.trim() !== "")
    .map((row) => ({
      numberRef: row.numberRef || null,
      plate: row.plate.trim(),
      vehicleType: row.vehicleType || "Outros",
      category: (VEHICLE_TYPE_TO_CATEGORY[row.vehicleType?.toUpperCase()] ||
        "Equipamentos Especiais") as any,
      brand: row.brand || null,
      model: row.model || null,
      company: row.company || null,
      currentInsurer: row.insurer || null,
      currentPolicy: row.policy || null,
      currentCoverage: row.coverage || null,
      policyExpiry: parseDate(row.expiry),
      status: row.status || "A VENCER",
      broker: row.broker || null,
      notes: row.notes || null,
    }));

  if (rows.length === 0) return { count: 0 };

  // Insert in batches of 50 to avoid query size limits
  for (let i = 0; i < rows.length; i += 50) {
    await db.insert(vehicles).values(rows.slice(i, i + 50));
  }
  return { count: rows.length };
}

export async function deleteVehicle(id: number) {
  await db.delete(vehicles).where(eq(vehicles.id, id));
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/frota");
}

export async function updateVehicle(
  id: number,
  data: {
    plate?: string;
    vehicleType?: string;
    brand?: string;
    model?: string;
    company?: string;
    currentInsurer?: string;
    currentPolicy?: string;
    currentCoverage?: string;
    status?: string;
    broker?: string;
    notes?: string;
  }
) {
  await db.update(vehicles).set(data).where(eq(vehicles.id, id));
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/frota");
}

export async function deleteAllVehicles() {
  await db.delete(vehicles);
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/frota");
}

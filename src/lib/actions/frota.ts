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
  const rows = data.map((row) => ({
    numberRef: row.numberRef,
    plate: row.plate,
    vehicleType: row.vehicleType,
    category: (VEHICLE_TYPE_TO_CATEGORY[row.vehicleType.toUpperCase()] ||
      "Equipamentos Especiais") as any,
    brand: row.brand,
    model: row.model,
    company: row.company,
    currentInsurer: row.insurer,
    currentPolicy: row.policy,
    currentCoverage: row.coverage,
    policyExpiry: row.expiry ? new Date(row.expiry) : null,
    status: row.status,
    broker: row.broker,
    notes: row.notes,
  }));

  await db.insert(vehicles).values(rows);
  return { count: rows.length };
}

"use server";

import { db } from "@/lib/db";
import {
  tenders,
  tenderVehicles,
  vehicles,
  proposals,
  users,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTender(data: {
  title: string;
  description: string;
  insuranceType: string;
  coverageRequired: string;
  deadline: string;
  vehicleIds: number[];
  editalPdfUrl?: string;
  editalPdfFileName?: string;
  attachments?: { url: string; fileName: string }[];
}) {
  const [tender] = await db
    .insert(tenders)
    .values({
      title: data.title,
      description: data.description,
      insuranceType: data.insuranceType as any,
      coverageRequired: data.coverageRequired,
      editalPdfUrl: data.editalPdfUrl,
      editalPdfFileName: data.editalPdfFileName,
      attachments: data.attachments,
      deadline: new Date(data.deadline),
      status: "Rascunho",
    })
    .returning();

  if (data.vehicleIds.length > 0) {
    await db.insert(tenderVehicles).values(
      data.vehicleIds.map((vehicleId) => ({
        tenderId: tender.id,
        vehicleId,
      }))
    );
  }

  revalidatePath("/editais");
  revalidatePath("/s/editais");
  return tender;
}

export async function getTenders() {
  return db.select().from(tenders).orderBy(desc(tenders.createdAt));
}

export async function getTenderById(id: number) {
  const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));
  if (!tender) return null;

  const linkedVehicles = await db
    .select({ vehicle: vehicles })
    .from(tenderVehicles)
    .innerJoin(vehicles, eq(tenderVehicles.vehicleId, vehicles.id))
    .where(eq(tenderVehicles.tenderId, id));

  const tenderProposals = await db
    .select({ proposal: proposals, insurer: users })
    .from(proposals)
    .leftJoin(users, eq(proposals.insurerId, users.id))
    .where(eq(proposals.tenderId, id));

  return {
    ...tender,
    vehicles: linkedVehicles.map((r) => r.vehicle),
    proposals: tenderProposals.map((r) => ({
      ...r.proposal,
      insurerName: r.insurer?.companyName || r.insurer?.name || "Seguradora",
    })),
  };
}

export async function publishTender(id: number) {
  await db
    .update(tenders)
    .set({ status: "Aberto", updatedAt: new Date() })
    .where(eq(tenders.id, id));
  revalidatePath(`/editais/${id}`);
  revalidatePath("/editais");
  revalidatePath("/s/editais");
}

export async function closeTender(id: number) {
  await db
    .update(tenders)
    .set({ status: "Encerrado", updatedAt: new Date() })
    .where(eq(tenders.id, id));
  revalidatePath(`/editais/${id}`);
  revalidatePath("/editais");
  revalidatePath("/c/editais");
}

export async function deleteTender(id: number) {
  await db.delete(tenders).where(eq(tenders.id, id));
  revalidatePath("/editais");
  revalidatePath("/c/editais");
}

export async function updateTender(
  id: number,
  data: {
    title?: string;
    description?: string;
    insuranceType?: string;
    coverageRequired?: string;
    deadline?: Date;
  }
) {
  await db
    .update(tenders)
    .set({ ...data, updatedAt: new Date() } as any)
    .where(eq(tenders.id, id));
  revalidatePath(`/editais/${id}`);
  revalidatePath("/editais");
}

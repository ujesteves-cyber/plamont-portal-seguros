"use server";

import { db } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitProposal(data: {
  tenderId: number;
  insurerId: number;
  pdfUrl: string;
  pdfFileName: string;
  totalPremium: string;
  deductible: string;
  coverageType: string;
  validity: string;
}) {
  const [proposal] = await db
    .insert(proposals)
    .values({
      tenderId: data.tenderId,
      insurerId: data.insurerId,
      pdfUrl: data.pdfUrl,
      pdfFileName: data.pdfFileName,
      totalPremium: data.totalPremium,
      deductible: data.deductible,
      coverageType: data.coverageType,
      validity: data.validity,
    })
    .returning();

  revalidatePath(`/editais/${data.tenderId}`);
  return proposal;
}

export async function selectWinner(proposalId: number, tenderId: number) {
  await db.transaction(async (tx) => {
    await tx
      .update(proposals)
      .set({ isWinner: false })
      .where(eq(proposals.tenderId, tenderId));

    await tx
      .update(proposals)
      .set({ isWinner: true })
      .where(eq(proposals.id, proposalId));
  });

  revalidatePath(`/editais/${tenderId}`);
}

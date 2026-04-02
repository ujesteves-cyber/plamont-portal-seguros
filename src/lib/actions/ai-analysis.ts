"use server";

import { db } from "@/lib/db";
import { proposals, comparisons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { analyzeProposalPdf } from "@/lib/ai/analyze-proposal";
import { compareProposals } from "@/lib/ai/compare-proposals";
import { revalidatePath } from "next/cache";

export async function runAiAnalysis(tenderId: number) {
  // Get all proposals for this tender
  const tenderProposals = await db
    .select()
    .from(proposals)
    .where(eq(proposals.tenderId, tenderId));

  if (tenderProposals.length === 0) {
    throw new Error("Nenhuma proposta para analisar");
  }

  // Analyze each proposal PDF
  const analyses = [];
  for (const proposal of tenderProposals) {
    const analysis = await analyzeProposalPdf(proposal.pdfUrl);

    // Save individual analysis
    await db
      .update(proposals)
      .set({ aiAnalysis: analysis })
      .where(eq(proposals.id, proposal.id));

    analyses.push({
      insurerName: analysis.insurerName || proposal.pdfFileName || "Desconhecida",
      analysis,
    });
  }

  // Generate comparison
  const summary = await compareProposals(analyses);

  // Save comparison
  await db
    .insert(comparisons)
    .values({
      tenderId,
      comparisonData: analyses,
      summary,
    })
    .onConflictDoUpdate({
      target: comparisons.tenderId,
      set: { comparisonData: analyses, summary, generatedAt: new Date() },
    });

  revalidatePath(`/editais/${tenderId}/comparativo`);
  return { summary, analyses };
}

export async function getComparison(tenderId: number) {
  const [comparison] = await db
    .select()
    .from(comparisons)
    .where(eq(comparisons.tenderId, tenderId));

  return comparison;
}

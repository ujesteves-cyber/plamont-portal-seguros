import { generateText, Output } from "ai";
import { z } from "zod";

const proposalSchema = z.object({
  insurerName: z.string().describe("Nome da seguradora"),
  totalPremium: z.string().describe("Valor total do prêmio"),
  monthlyPremium: z.string().optional().describe("Valor mensal se informado"),
  deductible: z.string().describe("Franquia"),
  coverages: z.array(z.string()).describe("Lista de coberturas incluídas"),
  exclusions: z.array(z.string()).describe("Lista de exclusões"),
  validity: z.string().describe("Vigência da apólice"),
  waitingPeriod: z.string().optional().describe("Período de carência"),
  specialConditions: z.array(z.string()).describe("Condições especiais"),
  strengths: z.array(z.string()).describe("Pontos fortes da proposta"),
  weaknesses: z.array(z.string()).describe("Pontos fracos/riscos"),
});

export type ProposalAnalysis = z.infer<typeof proposalSchema>;

export async function analyzeProposalPdf(pdfUrl: string): Promise<ProposalAnalysis> {
  const pdfResponse = await fetch(pdfUrl);
  const pdfBuffer = await pdfResponse.arrayBuffer();
  const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

  const { output } = await generateText({
    model: "anthropic/claude-sonnet-4.6",
    output: Output.object({ schema: proposalSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: pdfBase64,
            mediaType: "application/pdf",
          },
          {
            type: "text",
            text: `Analise esta proposta de seguro em PDF. Extraia todos os dados estruturados:
            nome da seguradora, prêmio total, franquia, coberturas incluídas, exclusões,
            vigência, carência, condições especiais, pontos fortes e pontos fracos.
            Responda em português brasileiro.`,
          },
        ],
      },
    ],
  });

  return output!;
}

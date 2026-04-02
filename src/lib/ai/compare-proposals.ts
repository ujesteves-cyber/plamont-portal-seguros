import { generateText } from "ai";
import type { ProposalAnalysis } from "./analyze-proposal";

export async function compareProposals(
  analyses: Array<{ insurerName: string; analysis: ProposalAnalysis }>
): Promise<string> {
  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.6",
    prompt: `Você é um consultor de seguros experiente. Compare as seguintes propostas de seguro e gere um relatório comparativo executivo em português brasileiro.

PROPOSTAS:
${JSON.stringify(analyses, null, 2)}

Gere um relatório com:
1. **Tabela comparativa** com colunas: Seguradora | Prêmio | Franquia | Coberturas | Exclusões
2. **Destaque** a proposta mais barata, a com maior cobertura, e a com melhor custo-benefício
3. **Resumo executivo** de 3-5 pontos para cada proposta
4. **Recomendação** fundamentada

Use formatação markdown.`,
  });

  return text;
}

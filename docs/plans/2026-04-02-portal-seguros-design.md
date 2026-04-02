# Portal Plamont Seguros - Design

**Data:** 2026-04-02
**Status:** Aprovado

## Visao Geral

Plataforma web onde a Plamont publica editais de seguro, seguradoras enviam propostas em PDF, e uma IA analisa e compara automaticamente as propostas. Corretores participam como intermediarios vinculados a seguradoras.

### Perfis de Usuario

- **Admin (Plamont)** - Cria editais, gerencia frota, visualiza propostas, acessa analise IA
- **Corretor** - Vinculado a seguradoras, gerencia editais e propostas dos seus clientes
- **Seguradora** - Cadastro via link publico com CNPJ, acessa editais abertos, envia propostas

## Categorias de Seguro

### Modulo 1 - Seguros de Frota (veiculos/equipamentos)

Organizados por porte/risco:

| Categoria | Tipos incluidos | Qtd atual |
|-----------|----------------|-----------|
| Leves | Mobi, Saveiro, Polo, Gol, Toro, Strada | ~15 |
| Utilitarios | L200 Triton, Frontier, Caminhonetes | ~15 |
| Pesados - Transporte | Onibus, Cavalo Mecanico, Caminhao Tanque | ~35 |
| Pesados - Operacao | Caminhao Munck | ~40 |
| Equipamentos Especiais | Guindaste, Grua, Empilhadeira | ~30 |
| Reboques/Acoplados | Prancha, Carreta, Reboque, Poliguindaste | ~15 |

### Modulo 2 - Seguros Corporativos

- Seguro de Vida (coletivo funcionarios)
- Seguro Judicial (garantia judicial em processos)
- Seguro Trabalhista (riscos trabalhistas)
- Seguro de Obras (performance bond, risco de engenharia)
- Seguro Contratual (garantia de contratos)

## Fluxo Principal

1. Plamont cria edital -> Define categoria, itens, prazo, coberturas desejadas
2. Edital fica visivel para seguradoras cadastradas (link publico)
3. Seguradora acessa edital -> Ve itens, faz upload da proposta (PDF), preenche campos-chave
4. Prazo encerra -> IA analisa PDFs automaticamente
5. Gera tabela comparativa + resumo executivo com pontos fortes/fracos
6. Plamont decide -> Seleciona vencedora -> Registra apolice

## Analise por IA

- Extrai dados estruturados dos PDFs: premio, franquia, coberturas, exclusoes, carencia, vigencia
- Gera tabela comparativa lado a lado
- Destaca: proposta mais barata, maior cobertura, menores exclusoes, melhor custo-beneficio
- Resumo executivo: 3-5 pontos principais de cada proposta

## Base de Frota

273 veiculos/equipamentos importados da planilha. Campos:
- Placa, tipo, marca, modelo, empresa do grupo
- Seguro atual (seguradora, apolice, cobertura, vencimento)
- Historico de seguros anteriores

Ao criar edital de frota, admin seleciona veiculos por categoria, empresa, ou individualmente.

## Dados da Planilha (referencia)

- 9 empresas do grupo: Plamont Eng., R&I, Plalog, RID Servicos, RID Metal, Hiromi, DLV, Safra Leasing, Lumi
- 5 seguradoras atuais: Porto Seguro, Bradesco, HDI, Tokio, Essor
- 3 tipos de cobertura: Total, Terceiro, Basico-Terc-Prox AG
- Corretores: Gilberto, Rodrigo Rocon, Vix Corretora, Criativa ADM, Weverton

## Arquitetura Tecnica

- **Frontend**: Next.js 16 (App Router) + shadcn/ui + Tailwind + dark mode
- **Backend**: Server Actions + Route Handlers
- **Banco**: Neon Postgres (via Vercel Marketplace)
- **Auth**: Clerk (3 perfis: admin, corretor, seguradora)
- **Storage**: Vercel Blob (upload PDFs das propostas)
- **IA**: AI Gateway (analise de PDFs, comparativo)
- **Deploy**: Vercel

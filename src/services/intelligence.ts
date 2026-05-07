/**
 *  SISTEMA DE INTELIGÊNCIA PARA ANÁLISE DE CAMPANHAS GOOGLE ADS
 *
 * Princípios:
 * 1. Linguagem Probabilística (não certezas absolutas)
 * 2. Benchmarks Internos (matemática do produto, não médias de mercado)
 * 3. Análise em Camadas (dados → tráfego → conversão → financeiro)
 * 4. Contextualização para Afiliados (foco em pré-sell e anúncios)
 */

import type { Product, Campaign, CampaignStatus } from "../types";

// ============================================
//  INTERFACES
// ============================================

export interface Metrics {
  cpc: number;
  ctr: number;
  cr: number;
  roas: number;
  roi: number;
  cpa: number;
  profit: number;
}

export interface CampaignData {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  days: number;
}

export interface DataQuality {
  level: "insufficient" | "preliminary" | "moderate" | "reliable";
  confidence: number; // 0-100
  clicks: number;
  conversions: number;
  days: number;
  message: string;
  canShowCriticalAlerts: boolean;
}

export interface Alert {
  id: string;
  priority: 1 | 2 | 3; // 1 = crítico, 2 = atenção, 3 = observação
  category: "traffic" | "conversion" | "economics" | "anomaly" | "opportunity";
  severity: "critical" | "warning" | "attention" | "positive";

  title: string;
  observation: string; // O que os dados mostram
  possibleCauses: string[];
  suggestions: string[]; // O que o afiliado PODE fazer

  confidence: "low" | "medium" | "high";
  learningPhaseNote?: string; // Contexto adicional se estiver em aprendizado
}

export interface DiagnosticResult {
  dataQuality: DataQuality;
  alerts: Alert[];
  verdict: {
    phase: "learning" | "optimization" | "scaling" | "critical";
    emoji: string;
    title: string;
    description: string;
    colorClass: string;
  };
  benchmarks: {
    requiredCR: number; // CR necessária para empatar
    maxSustainableCPC: number; // CPC máximo para manter ROI mínimo
    breakEvenSpend: number; // Gasto no ponto de equilíbrio
  };
  historicalComparison?: {
    crDelta: number; // % de mudança
    cpcDelta: number;
    message: string;
  };
}

// ============================================
//  CAMADA 1: VALIDAÇÃO DE QUALIDADE DOS DADOS
// ============================================

export function assessDataQuality(
  data: CampaignData,
  status: CampaignStatus
): DataQuality {
  const { clicks, conversions, days, spend } = data;

  let level: DataQuality["level"];
  let confidence: number;
  let message: string;

  // Lógica de confiabilidade
  if (clicks < 30) {
    level = "insufficient";
    confidence = Math.min((clicks / 30) * 30, 30);
    message = `Com ${clicks} cliques, os dados são insuficientes para análise confiável. Recomendamos aguardar pelo menos 50 cliques.`;
  } else if (clicks < 100) {
    level = "preliminary";
    confidence = 30 + ((clicks - 30) / 70) * 30; // 30-60%
    message = `Com ${clicks} cliques, a análise é preliminar. Padrões começam a emergir, mas ainda há margem de variação.`;
  } else if (clicks < 500) {
    level = "moderate";
    confidence = 60 + ((clicks - 100) / 400) * 25; // 60-85%
    message = `Com ${clicks} cliques, os dados são moderados. As métricas já são representativas do desempenho real.`;
  } else {
    level = "reliable";
    confidence = Math.min(85 + (clicks / 1000) * 15, 100); // 85-100%
    message = `Com ${clicks} cliques, os dados são confiáveis. As análises têm alta precisão estatística.`;
  }

  // Exceção: Emergência Financeira fura o bloqueio de aprendizado
  const emergencySpendRatio =
    conversions === 0 && spend > 0 ? spend / (spend + 1) : 0;
  const canShowCriticalAlerts = clicks >= 30 || emergencySpendRatio > 2;

  return {
    level,
    confidence: Math.round(confidence),
    clicks,
    conversions,
    days,
    message,
    canShowCriticalAlerts,
  };
}

// ============================================
//  CAMADA 2: CÁLCULOS DE BENCHMARKS INTERNOS
// ============================================

export function calculateBenchmarks(
  metrics: Metrics,
  product: Product,
  roiTarget: number = 50, // ROI mínimo desejado (%)
  conversions: number = 0 //  Número de vendas realizadas
) {
  const commissionBRL = product.commissionLiquidBRL || 0;

  // 1. CR Necessária para Empatar (Break-Even)
  // Quanto % dos cliques precisa converter para pagar o CPC?
  const requiredCR = metrics.cpc > 0 ? (metrics.cpc / commissionBRL) * 100 : 0;

  // 2. CPC Máximo Sustentável
  // Quanto posso pagar mantendo o ROI mínimo desejado?
  // Fórmula: CPC_max = (Comissão × CR_atual) / (1 + ROI_target/100)
  const maxSustainableCPC =
    metrics.cr > 0
      ? (commissionBRL * (metrics.cr / 100)) / (1 + roiTarget / 100)
      : 0;

  // 3. Gasto de Equilíbrio
  // Quanto posso gastar antes de começar a ter prejuízo?
  const breakEvenSpend = commissionBRL * conversions;

  return {
    requiredCR: Math.max(requiredCR, 0),
    maxSustainableCPC: Math.max(maxSustainableCPC, 0),
    breakEvenSpend: Math.max(breakEvenSpend, 0),
  };
}

// ============================================
//  CAMADA 3: ANÁLISE CRUZADA DE MÉTRICAS
// ============================================

export function analyzeCampaign(
  data: CampaignData,
  metrics: Metrics,
  product: Product,
  status: CampaignStatus,
  history: Campaign[],
  roiTarget: number = 50
): DiagnosticResult {
  const quality = assessDataQuality(data, status);
  const benchmarks = calculateBenchmarks(
    metrics,
    product,
    roiTarget,
    data.conversions
  );
  const alerts: Alert[] = [];

  // ========================================
  //  ANÁLISE 1: EMERGÊNCIA FINANCEIRA
  // ========================================

  // Hemorragia: Gasto > 2× Receita
  if (data.spend > data.revenue * 2 && data.spend > 50) {
    alerts.push({
      id: "hemorrhage",
      priority: 1,
      category: "economics",
      severity: "critical",
      title: " Hemorragia Financeira Detectada",
      observation: `Você gastou R$ ${data.spend.toFixed(
        2
      )} mas gerou apenas R$ ${data.revenue.toFixed(
        2
      )} em receita. O prejuízo está em ${((1 - metrics.roas) * 100).toFixed(
        0
      )}%.`,
      possibleCauses: [
        "Oferta fria ou saturada no mercado",
        "Segmentação muito ampla (atingindo público não qualificado)",
        "CPC fora da realidade do produto",
        "Concorrência com ofertas melhores/mais baratas",
      ],
      suggestions: [
        "AÇÃO IMEDIATA: Pause a campanha até revisar a estratégia",
        "Verifique se a oferta ainda está ativa no produtor",
        "Analise os termos de pesquisa: adicione negativos para tráfego irrelevante",
        "Considere trocar de oferta ou produto",
      ],
      confidence: "high",
      learningPhaseNote:
        quality.level === "insufficient"
          ? "Mesmo em fase inicial, este gasto sem retorno exige ação imediata."
          : undefined,
    });
  }

  // ========================================
  // ️ ANÁLISE 2: TRÁFEGO (CTR)
  // ========================================

  if (data.impressions >= 100) {
    const ctr = metrics.ctr;

    // CTR Crítico (< 0.5%)
    if (ctr < 0.5 && quality.canShowCriticalAlerts) {
      alerts.push({
        id: "ctr-critical",
        priority: 1,
        category: "traffic",
        severity: "critical",
        title: " CTR Extremamente Baixo",
        observation: `Seu anúncio teve ${
          data.impressions
        } impressões mas apenas ${data.clicks} cliques (CTR: ${ctr.toFixed(
          2
        )}%). Em campanhas Search típicas, esperaríamos pelo menos ${Math.round(
          data.impressions * 0.015
        )} cliques.`,
        possibleCauses: [
          "Anúncio não está alinhado com a intenção de busca das palavras-chave",
          "Título/descrição genéricos ou pouco atrativos",
          "Falta de extensões de anúncio (sitelinks, callouts)",
          "Índice de Qualidade baixo (anúncio aparece em posições ruins)",
          "Concorrência com anúncios mais chamativos",
        ],
        suggestions: [
          'Reescreva os Títulos: inclua números, perguntas ou urgência ("Descubra", "Aprenda", "Garanta")',
          "Adicione palavras-chave negativas para filtrar cliques irrelevantes",
          "Ative todas as extensões disponíveis (podem aumentar CTR em 10-25%)",
          "Revise a correspondência das palavras-chave (ampla demais pode diluir relevância)",
          "Teste anúncios responsivos com múltiplas variações de título",
        ],
        confidence: quality.confidence > 60 ? "high" : "medium",
        learningPhaseNote:
          quality.level === "preliminary"
            ? "Os dados são preliminares, mas este CTR já indica desalinhamento. Aja preventivamente."
            : undefined,
      });
    }

    // CTR Baixo (0.5% - 1.5%)
    else if (ctr < 1.5 && ctr >= 0.5) {
      alerts.push({
        id: "ctr-low",
        priority: 2,
        category: "traffic",
        severity: "warning",
        title: "️ CTR Abaixo do Padrão de Search Ads",
        observation: `Seu CTR de ${ctr.toFixed(
          2
        )}% está abaixo da média esperada para campanhas Search (1.5-3%). Isso sugere que o anúncio pode não estar ressoando com o público.`,
        possibleCauses: [
          "Título não destaca o principal benefício da oferta",
          "Anúncio muito institucional/formal (falta gatilhos emocionais)",
          "Segmentação ampla capturando público frio",
          "Falta de prova social ou autoridade no texto",
        ],
        suggestions: [
          'Teste variações de título focando em benefícios ("Emagreça 5kg" vs "Programa de Emagrecimento")',
          'Adicione urgência/escassez se a oferta permitir ("Vagas Limitadas", "Desconto Expira Hoje")',
          "Revise se o texto reflete a linguagem do público-alvo (muito técnico/simples?)",
          "Use o simulador de anúncios do Google para comparar com concorrentes",
        ],
        confidence: quality.confidence > 50 ? "medium" : "low",
      });
    }

    // CTR Suspeito (> 15%)
    else if (ctr > 15) {
      alerts.push({
        id: "ctr-anomaly",
        priority: 2,
        category: "anomaly",
        severity: "warning",
        title: " CTR Anormalmente Alto - Possível Anomalia",
        observation: `CTR de ${ctr.toFixed(
          2
        )}% está muito acima do normal para Search Ads (3-5%). Isso pode indicar tráfego de baixa qualidade ou configuração incorreta.`,
        possibleCauses: [
          "Rede de Display ativada acidentalmente (cliques acidentais em banners)",
          "Tráfego de bot ou cliques fraudulentos",
          "Palavra-chave de marca própria (pessoas já conhecem a oferta)",
          "Segmentação muito restrita (audiência super-qualificada mas pequena)",
        ],
        suggestions: [
          "Verifique nas configurações da campanha se a Rede de Display está desativada",
          'Analise o relatório de "Onde os anúncios foram exibidos" (pode haver sites suspeitos)',
          "Revise os termos de pesquisa: palavras muito genéricas geram cliques ruins",
          "Se for tráfego legítimo, ótimo! Mas monitore a CR - cliques sem vendas confirmam problema",
        ],
        confidence: "high",
      });
    }

    // CTR Excelente (5%+)
    else if (ctr >= 5 && data.conversions > 0) {
      alerts.push({
        id: "ctr-excellent",
        priority: 3,
        category: "opportunity",
        severity: "positive",
        title: " CTR Excepcional!",
        observation: `Seu CTR de ${ctr.toFixed(
          2
        )}% está no topo 10% das campanhas Search. O anúncio está muito bem otimizado.`,
        possibleCauses: [
          "Anúncio altamente relevante para a intenção de busca",
          "Uso eficaz de gatilhos mentais e copywriting",
          "Extensões de anúncio bem configuradas",
          "Público-alvo muito alinhado com a oferta",
        ],
        suggestions: [
          "Documente o que está funcionando (títulos, extensões, palavras-chave)",
          "Considere aumentar o orçamento diário para capturar mais desse tráfego qualificado",
          "Teste variações sutis para tentar melhorar ainda mais",
          "Use este anúncio como modelo para outras campanhas",
        ],
        confidence: "high",
      });
    }
  }

  // ========================================
  //  ANÁLISE 3: CONVERSÃO (CR)
  // ========================================

  if (data.clicks >= 30) {
    const cr = metrics.cr;
    const requiredCR = benchmarks.requiredCR;

    // CR Crítica (< 50% da necessária)
    if (cr < requiredCR * 0.5 && data.conversions === 0 && data.clicks >= 50) {
      alerts.push({
        id: "cr-critical-no-sales",
        priority: 1,
        category: "conversion",
        severity: "critical",
        title: " Zero Vendas com Tráfego Significativo",
        observation: `Você gerou ${
          data.clicks
        } cliques mas ainda não teve conversões. Para empatar, precisaria converter ${requiredCR.toFixed(
          2
        )}% dos cliques.`,
        possibleCauses: [
          "Expectativa criada pelo anúncio não bate com a oferta real (promessa vs entrega)",
          'Público "pesquisador" (clicam para comparar, não para comprar)',
          "Landing page do produtor com problemas (carrinho quebrado, checkout confuso)",
          "Oferta com preço acima da percepção de valor do público",
          "Falta de gatilhos de urgência/escassez na página de vendas",
        ],
        suggestions: [
          'PRIORIDADE: Revise se o anúncio não está "sobre-prometendo" (expectativa irrealista)',
          "Teste a jornada do usuário: clique no seu próprio anúncio e veja a experiência",
          'Adicione termos negativos para "grátis", "download", "pdf" (caça-curiosos)',
          "Se possível, peça ao produtor um link de afiliado com landing page diferente",
          "Considere pausar e testar outra oferta do mesmo nicho (o problema pode ser o produto)",
        ],
        confidence: quality.confidence > 60 ? "high" : "medium",
        learningPhaseNote:
          quality.level === "preliminary"
            ? "Já há cliques suficientes para questionar a viabilidade da oferta. Reavalie a escolha do produto."
            : undefined,
      });
    }

    // CR Abaixo do Necessário (mas tem vendas)
    else if (cr < requiredCR && cr > 0) {
      const gap = (((requiredCR - cr) / requiredCR) * 100).toFixed(0);
      alerts.push({
        id: "cr-below-required",
        priority: cr < requiredCR * 0.7 ? 1 : 2,
        category: "conversion",
        severity: cr < requiredCR * 0.7 ? "critical" : "warning",
        title: `${
          cr < requiredCR * 0.7 ? "" : "️"
        } Taxa de Conversão Abaixo do Sustentável`,
        observation: `Sua CR atual é ${cr.toFixed(
          2
        )}%, mas você precisa de pelo menos ${requiredCR.toFixed(
          2
        )}% para empatar com o CPC de R$ ${metrics.cpc.toFixed(
          2
        )}. Faltam ${gap}% para o equilíbrio.`,
        possibleCauses: [
          "CPC está alto demais para a rentabilidade da oferta",
          "Público parcialmente qualificado (alguns compram, maioria não)",
          "Oferta com conversão naturalmente baixa (produto caro, decisão demorada)",
          "Landing page com fricção (muitos campos no formulário, falta de prova social)",
        ],
        suggestions: [
          `Reduza o CPC gradualmente (teste R$ ${(metrics.cpc * 0.85).toFixed(
            2
          )} - 15% menor)`,
          "Refine a segmentação: exclua públicos que clicam mas não compram",
          "Se você controla a pré-sell, adicione prova social (depoimentos, números)",
          'Teste anúncios mais "filtrados" (ex: mencione o preço para afastar curiosos)',
          "Monitore termos de pesquisa: adicione negativos para intenções não-comerciais",
        ],
        confidence: quality.confidence > 50 ? "medium" : "low",
      });
    }

    // CR Saudável (acima do necessário)
    else if (cr > requiredCR * 1.2 && data.conversions >= 3) {
      alerts.push({
        id: "cr-healthy",
        priority: 3,
        category: "opportunity",
        severity: "positive",
        title: " Taxa de Conversão Saudável",
        observation: `Sua CR de ${cr.toFixed(2)}% está ${(
          (cr / requiredCR - 1) *
          100
        ).toFixed(0)}% acima do necessário para manter a rentabilidade.`,
        possibleCauses: [
          "Segmentação bem ajustada (público quente)",
          "Oferta com alta demanda no mercado",
          "Anúncio filtrando bem o público (só quem tem intenção real clica)",
        ],
        suggestions: [
          "Esta é uma oportunidade de ESCALAR: aumente o orçamento em 20-30%",
          "Teste aumentar o CPC gradualmente para capturar mais tráfego de topo",
          "Duplique a campanha com leves variações para descobrir o limite de volume",
          "Proteja este setup: documente palavras-chave, anúncios e segmentações",
        ],
        confidence: "high",
      });
    }
  }

  // ========================================
  //  ANÁLISE 4: EFICIÊNCIA ECONÔMICA (CPC)
  // ========================================

  if (data.clicks >= 20 && benchmarks.maxSustainableCPC > 0) {
    const cpc = metrics.cpc;
    const maxCPC = benchmarks.maxSustainableCPC;

    // CPC Acima do Sustentável
    if (cpc > maxCPC * 1.2) {
      const excess = ((cpc / maxCPC - 1) * 100).toFixed(0);
      alerts.push({
        id: "cpc-too-high",
        priority: cpc > maxCPC * 1.5 ? 1 : 2,
        category: "economics",
        severity: cpc > maxCPC * 1.5 ? "critical" : "warning",
        title: `${cpc > maxCPC * 1.5 ? "" : "️"} CPC Acima do Sustentável`,
        observation: `Seu CPC de R$ ${cpc.toFixed(
          2
        )} está ${excess}% acima do máximo sustentável (R$ ${maxCPC.toFixed(
          2
        )}) para manter ROI de ${roiTarget}%.`,
        possibleCauses: [
          "Concorrência acirrada (muitos afiliados no mesmo nicho)",
          "Índice de Qualidade baixo (Google cobra mais por relevância ruim)",
          'Lances automáticos muito agressivos ("Maximizar conversões" sem limite)',
          'Palavras-chave muito competitivas (termos genéricos como "emagrecer")',
        ],
        suggestions: [
          `Reduza o lance máximo para R$ ${maxCPC.toFixed(
            2
          )} (CPC sustentável calculado)`,
          "Melhore o Índice de Qualidade: alinhe melhor anúncio + palavra-chave + landing page",
          "Teste palavras-chave de cauda longa (menos concorridas, mais baratas)",
          "Se usar lances automáticos, defina um CPC máximo como proteção",
          "Considere nichos relacionados com menos concorrência",
        ],
        confidence: quality.confidence > 60 ? "high" : "medium",
      });
    }

    // CPC Ótimo
    else if (cpc <= maxCPC * 0.8) {
      alerts.push({
        id: "cpc-excellent",
        priority: 3,
        category: "opportunity",
        severity: "positive",
        title: " CPC Excelente",
        observation: `Seu CPC de R$ ${cpc.toFixed(
          2
        )} está bem abaixo do limite sustentável (R$ ${maxCPC.toFixed(
          2
        )}). Há margem para escalar.`,
        possibleCauses: [
          "Alto Índice de Qualidade (Google premiando com cliques mais baratos)",
          "Nicho com pouca concorrência de afiliados",
          "Palavras-chave bem escolhidas (específicas e relevantes)",
        ],
        suggestions: [
          "Aproveite a margem: aumente o orçamento diário gradualmente",
          "Teste aumentar o lance em 10-15% para capturar mais volume (você tem margem)",
          "Expanda para palavras-chave similares mantendo a relevância",
          "Este é um cenário raro - documente tudo para replicar em outras campanhas",
        ],
        confidence: "high",
      });
    }
  }

  // ========================================
  //  ANÁLISE 5: ROAS E ROI
  // ========================================

  if (data.spend > 20 && data.revenue > 0) {
    const roas = metrics.roas;
    const roi = metrics.roi;

    // ROAS Excelente
    if (roas >= 3.0 && roi > 100) {
      alerts.push({
        id: "roas-excellent",
        priority: 3,
        category: "opportunity",
        severity: "positive",
        title: " Campanha de Alto Desempenho",
        observation: `ROAS de ${roas.toFixed(2)}x e ROI de ${roi.toFixed(
          0
        )}% indicam uma campanha altamente lucrativa.`,
        possibleCauses: [
          "Combinação perfeita: oferta + público + anúncio",
          "Momento de alta demanda do produto",
          "Pouca concorrência direta",
        ],
        suggestions: [
          "ESCALE IMEDIATAMENTE: duplique o orçamento e monitore por 3-5 dias",
          "Crie campanhas similares (mesma estrutura, ofertas relacionadas)",
          "Documente TUDO: este é um caso de sucesso para replicar",
          "Considere testar tráfego em outras redes (Facebook, YouTube) com mesma oferta",
        ],
        confidence: "high",
      });
    }

    // ROI Negativo mas ROAS > 1
    else if (roi < 0 && roas > 1.0) {
      alerts.push({
        id: "roi-negative-high-costs",
        priority: 2,
        category: "economics",
        severity: "warning",
        title: "️ Prejuízo Apesar de ROAS Positivo",
        observation: `Seu ROAS de ${roas.toFixed(
          2
        )}x está positivo, mas o ROI de ${roi.toFixed(
          0
        )}% está negativo. Os custos fixos estão consumindo o lucro.`,
        possibleCauses: [
          "Custos fixos altos distribuídos por poucos produtos ativos",
          "Período de análise curto (custos fixos pesam mais em 1 dia vs 30 dias)",
          "Volume de vendas ainda baixo para diluir os custos operacionais",
        ],
        suggestions: [
          "Aumente o período de análise (custos fixos são mensais, não diários)",
          "Ative mais produtos simultaneamente para diluir custos fixos",
          "Se o ROAS está bom, o problema não é a campanha - é a estrutura de custos",
          "Considere escalar para aumentar o volume e melhorar a margem",
        ],
        confidence: "medium",
      });
    }
  }

  // ========================================
  //  ANÁLISE 6: COMPARAÇÃO COM HISTÓRICO
  // ========================================

  let historicalComparison: DiagnosticResult["historicalComparison"] =
    undefined;

  if (history.length > 0) {
    const productHistory = history.filter((h) => h.productId === product.id);

    if (productHistory.length >= 3) {
      // Calcular médias históricas (últimos 5 registros)
      const recentHistory = productHistory
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      const avgCR =
        recentHistory.reduce((sum, h) => sum + h.cr, 0) / recentHistory.length;
      const avgCPC =
        recentHistory.reduce((sum, h) => sum + h.cpc, 0) / recentHistory.length;

      const crDelta = avgCR > 0 ? ((metrics.cr - avgCR) / avgCR) * 100 : 0;
      const cpcDelta = avgCPC > 0 ? ((metrics.cpc - avgCPC) / avgCPC) * 100 : 0;

      // Gerar mensagem contextual
      let message = "";

      if (Math.abs(crDelta) > 20) {
        message += `Sua CR ${crDelta > 0 ? "aumentou" : "caiu"} ${Math.abs(
          crDelta
        ).toFixed(0)}% em relação à média histórica. `;

        if (crDelta < -20) {
          message +=
            "Isso pode indicar fadiga do anúncio, mudanças na concorrência ou sazonalidade.";

          alerts.push({
            id: "historical-cr-drop",
            priority: 2,
            category: "conversion",
            severity: "warning",
            title: " Queda de Performance vs Histórico",
            observation: `Sua CR atual (${metrics.cr.toFixed(
              2
            )}%) está ${Math.abs(crDelta).toFixed(
              0
            )}% abaixo da sua média histórica (${avgCR.toFixed(2)}%).`,
            possibleCauses: [
              "Fadiga do anúncio (público já viu muitas vezes)",
              "Aumento de concorrência (novos afiliados no nicho)",
              "Mudança na qualidade da oferta pelo produtor",
              "Sazonalidade (demanda natural do produto caiu)",
            ],
            suggestions: [
              "Crie novas variações de anúncio (mesmo produto, ângulo diferente)",
              "Revise se o produtor mudou a landing page recentemente",
              "Teste públicos lookalike ou similares ao que convertia antes",
              "Considere alternar entre ofertas do mesmo nicho (diversificar)",
            ],
            confidence: "high",
          });
        }
      }

      if (Math.abs(cpcDelta) > 30) {
        message += ` O CPC ${cpcDelta > 0 ? "subiu" : "caiu"} ${Math.abs(
          cpcDelta
        ).toFixed(0)}% (média histórica: R$ ${avgCPC.toFixed(2)}).`;
      }

      historicalComparison = {
        crDelta: Math.round(crDelta),
        cpcDelta: Math.round(cpcDelta),
        message: message || "Desempenho estável comparado ao histórico.",
      };
    }
  }

  // ========================================
  //  VEREDITO GERAL
  // ========================================

  let verdict: DiagnosticResult["verdict"];

  // Determinar fase da campanha
  if (quality.level === "insufficient" || status === "aprendizado") {
    verdict = {
      phase: "learning",
      emoji: "",
      title: "Fase de Aprendizado",
      description: `Com ${data.clicks} cliques, ainda estamos coletando dados. ${quality.message}`,
      colorClass: "border-blue-500 bg-blue-50",
    };
  } else if (
    metrics.roas < 1.0 &&
    data.spend > benchmarks.breakEvenSpend * 1.5
  ) {
    verdict = {
      phase: "critical",
      emoji: "",
      title: "Campanha em Zona Crítica",
      description: `ROAS de ${metrics.roas.toFixed(
        2
      )}x indica prejuízo. Você gastou ${(
        (data.spend / benchmarks.breakEvenSpend - 1) *
        100
      ).toFixed(
        0
      )}% além do ponto de equilíbrio. Revise a estratégia antes de continuar investindo.`,
      colorClass: "border-red-500 bg-red-50",
    };
  } else if (metrics.roas >= 2.5 && metrics.roi > 80) {
    verdict = {
      phase: "scaling",
      emoji: "",
      title: "Pronta para Escalar",
      description: `Excelente performance! ROAS de ${metrics.roas.toFixed(
        2
      )}x e ROI de ${metrics.roi.toFixed(
        0
      )}%. Esta campanha está madura para aumento de orçamento.`,
      colorClass: "border-green-500 bg-green-50",
    };
  } else {
    verdict = {
      phase: "optimization",
      emoji: "️",
      title: "Fase de Otimização",
      description: `Campanha operacional com ROAS de ${metrics.roas.toFixed(
        2
      )}x. Há espaço para melhorias nas métricas de conversão e eficiência.`,
      colorClass: "border-yellow-500 bg-yellow-50",
    };
  }

  // Ordenar alertas por prioridade
  alerts.sort((a, b) => a.priority - b.priority);

  return {
    dataQuality: quality,
    alerts,
    verdict,
    benchmarks,
    historicalComparison,
  };
}

// ============================================
//  ANÁLISE ESPECÍFICA DE BREAKDOWN DE OFERTAS
// ============================================

export function analyzeOfferBreakdown(
  breakdown: Array<{
    offerId: string;
    offerName: string;
    quantity: number;
    commission: number;
    revenue: number;
  }>,
  totalSpend: number
): Alert | null {
  if (breakdown.length < 2) return null;

  const activeOffers = breakdown.filter((o) => o.quantity > 0);
  if (activeOffers.length < 2) return null;

  // Calcular ROI por oferta (simplificado: receita / gasto proporcional)
  const offersWithROI = activeOffers.map((offer) => {
    const proportionalSpend =
      (offer.revenue / breakdown.reduce((s, o) => s + o.revenue, 0)) *
      totalSpend;
    const profit = offer.revenue - proportionalSpend;
    const roi = proportionalSpend > 0 ? (profit / proportionalSpend) * 100 : 0;

    return {
      ...offer,
      roi,
      profit,
    };
  });

  // Identificar vencedora e perdedora
  offersWithROI.sort((a, b) => b.roi - a.roi);
  const winner = offersWithROI[0];
  const loser = offersWithROI[offersWithROI.length - 1];

  const roiGap = winner.roi - loser.roi;

  if (roiGap > 50) {
    return {
      id: "offer-breakdown-insight",
      priority: 2,
      category: "opportunity",
      severity: "warning",
      title: " Inteligência de Ofertas Detectada",
      observation: `A oferta "${winner.offerName}" (${
        winner.quantity
      } vendas) está gerando ROI ${roiGap.toFixed(0)}% maior que "${
        loser.offerName
      }" (${loser.quantity} vendas).`,
      possibleCauses: [
        "Oferta vencedora tem melhor alinhamento com a dor do público",
        "Preço da oferta perdedora pode estar fora da realidade",
        "Landing page da oferta vencedora converte melhor",
        "Público atual tem maior afinidade com a oferta vencedora",
      ],
      suggestions: [
        `Considere pausar temporariamente "${loser.offerName}" e concentrar orçamento na vencedora`,
        "Se quiser manter ambas, crie campanhas separadas (uma por oferta)",
        "Teste anúncios específicos focados nos diferenciais da oferta vencedora",
        `Monitore se "${loser.offerName}" melhora - pode ser fase inicial de teste`,
      ],
      confidence: "high",
    };
  }

  return null;
}

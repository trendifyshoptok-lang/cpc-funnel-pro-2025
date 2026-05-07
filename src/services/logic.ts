import type {
  Product,
  ViabilityResult,
  Scenario,
  Campaign,
  CampaignStatus,
  VerdictResult,
  BreakEvenData,
  OperationalCosts,
} from "../types";
import { formatBRL } from "../utils/currency";

// ==========================================
// CONSTANTES DE REFERÊNCIA - CPC THRESHOLDS
// ==========================================
const CPC_THRESHOLDS = {
  BOM: 0.04, // 4% da comissão líquida
  INTER: 0.0555, // 5.55% da comissão líquida
  APERT: 0.0666, // 6.66% da comissão líquida
  RUIM: 0.1, // 10% da comissão líquida
} as const;

// ==========================================
// 1. CÁLCULOS MATEMÁTICOS BÁSICOS
// ==========================================
export const calculateProductMetrics = (
  product: Partial<Product>,
  rates: Record<string, number> = {}
): any => {
  //  CONSTANTES NUMÉRICAS SEGURAS - Evita NaN
  const price = Number(product.price) || 0;
  const commissionPct = Number(product.commissionPct) || 0;
  const platformFeeValue = Number(product.platformFeeValue) || 0;
  const manualBenchmarkCPC = Number(product.manualBenchmarkCPC) || 0;

  // 1. DEFINIÇÃO DA MOEDA
  const currency =
    product.market === "US" || product.market === "OTHER"
      ? "USD"
      : product.market === "EU"
      ? "EUR"
      : product.market === "UK"
      ? "GBP"
      : "BRL";

  // 2. VALIDAÇÃO: Taxa de câmbio obrigatória para moedas internacionais
  let exchangeRate = 1;
  if (currency !== "BRL") {
    if (!rates || !rates[currency] || rates[currency] <= 0) {
      // Retorna objeto zerado para não quebrar a interface
      return {
        commissionGross: 0,
        commissionLiquid: 0,
        commissionGrossBRL: 0,
        commissionLiquidBRL: 0,
        cpcBom: 0,
        cpcInter: 0,
        cpcApert: 0,
        cpcRuim: 0,
        cpcMaxBreakEven: 0,
        clicksPurchasable: 0,
        requiredCR: 0,
        cpcSuggested: 0,
      };
    }
    exchangeRate = rates[currency];
  }

  // 3. VALIDAÇÃO: Preço deve ser válido
  if (price <= 0) {
    return {
      commissionGross: 0,
      commissionLiquid: 0,
      commissionGrossBRL: 0,
      commissionLiquidBRL: 0,
      cpcBom: 0,
      cpcInter: 0,
      cpcApert: 0,
      cpcRuim: 0,
      cpcMaxBreakEven: 0,
      clicksPurchasable: 0,
      requiredCR: 0,
      cpcSuggested: 0,
    };
  }

  // 4. CALCULAR COMISSÃO NA MOEDA ORIGINAL
  const commissionGross = (price * commissionPct) / 100;

  // 5. APLICAR TAXA DA PLATAFORMA (sempre sobre a comissão bruta)
  let platformFee = 0;

  if (product.platformFeeType === "fixed") {
    // Taxa fixa na moeda original (ex: $1.00 ou R$ 1.00)
    platformFee = platformFeeValue;
  } else {
    // Taxa percentual sobre a COMISSÃO BRUTA (não sobre o preço!)
    const feePercentage = platformFeeValue > 0 ? platformFeeValue : 5;
    platformFee = commissionGross * (feePercentage / 100);
  }

  const commissionLiquid = Math.max(0, commissionGross - platformFee);

  // 6. VALIDAÇÃO: Comissão líquida não pode ser negativa
  if (commissionLiquid <= 0) {
    return {
      commissionGross: 0,
      commissionLiquid: 0,
      commissionGrossBRL: 0,
      commissionLiquidBRL: 0,
      cpcBom: 0,
      cpcInter: 0,
      cpcApert: 0,
      cpcRuim: 0,
      cpcMaxBreakEven: 0,
      clicksPurchasable: 0,
      requiredCR: 0,
      cpcSuggested: 0,
    };
  }

  //  7. CONVERTER PARA BRL (Base para todos os cálculos)
  const commissionGrossBRL = commissionGross * exchangeRate;
  const commissionLiquidBRL = commissionLiquid * exchangeRate;

  //  8. CALCULAR CPCs BASEADOS EXCLUSIVAMENTE EM BRL
  const cpcBom = commissionLiquidBRL * CPC_THRESHOLDS.BOM;
  const cpcInter = commissionLiquidBRL * CPC_THRESHOLDS.INTER;
  const cpcApert = commissionLiquidBRL * CPC_THRESHOLDS.APERT;
  const cpcRuim = commissionLiquidBRL * CPC_THRESHOLDS.RUIM;

  //  9. MÉTRICAS DE PODER DE FOGO (Benchmark em BRL)
  // manualBenchmarkCPC já vem em BRL, não converter!
  const baseCPC = manualBenchmarkCPC > 0 ? manualBenchmarkCPC : cpcBom;
  const cpcMaxBreakEven = commissionLiquidBRL / 100;
  const clicksPurchasable =
    baseCPC > 0 ? Math.floor(commissionLiquidBRL / baseCPC) : 0;
  const requiredCR = clicksPurchasable > 0 ? (1 / clicksPurchasable) * 100 : 0;

  return {
    commissionGross, // Moeda original
    commissionLiquid, // Moeda original
    commissionGrossBRL, // Convertido para BRL
    commissionLiquidBRL, // Convertido para BRL 
    cpcBom, // Calculado em BRL 
    cpcInter, // Calculado em BRL 
    cpcApert, // Calculado em BRL 
    cpcRuim, // Calculado em BRL 
    cpcMaxBreakEven, // Calculado em BRL 
    clicksPurchasable, // Baseado em BRL 
    requiredCR, // Baseado em BRL 
    cpcSuggested: cpcBom, // Calculado em BRL 
  };
};

// Helper global para conversão para BRL quando necessário
export const convertToBRL = (
  value: number,
  currency: string,
  rates: Record<string, number> = {}
): number => {
  if (currency === "BRL") return value;
  const rate = rates[currency] || 1;
  return value * rate;
};

// ==========================================
// 2. ANÁLISE DE VIABILIDADE (ATUALIZADO)
// ==========================================
export const calculateViability = (
  product: Product,
  rates: Record<string, number> = {}
): ViabilityResult => {
  let score = 0;
  let log: string[] = [];
  const notes: string[] = [];
  const {
    commissionLiquid,
    commissionLiquidBRL,
    cpcBom,
    clicksPurchasable,
    requiredCR,
  } = calculateProductMetrics(product, rates);

  // ===== VALIDAÇÃO: CPC Médio de Mercado é OBRIGATÓRIO =====
  if (!product.manualBenchmarkCPC || product.manualBenchmarkCPC <= 0) {
    return {
      score: 0,
      status: "REPROVADO",
      reason:
        ' ANÁLISE INCOMPLETA\n\nO campo "CPC Médio de Mercado" é obrigatório para continuar.\n\nSem esse dado, não é possível calcular a viabilidade real do produto.',
      log: [" Campo obrigatório não preenchido: CPC Médio de Mercado"],
      notes: "Preencha o CPC de mercado para prosseguir",
      scenarios: [],
    };
  }

  // --- FATOR 1: FINANCEIRO (Peso 30%) ---
  log.push(` ANÁLISE FINANCEIRA:`);

  if (commissionLiquidBRL >= 100) {
    score += 3;
    log.push(
      `   Comissão Excelente: R$ ${commissionLiquidBRL.toFixed(2)} [+3.0]`
    );
  } else if (commissionLiquidBRL >= 80) {
    score += 2.5;
    log.push(
      `   Comissão Saudável: R$ ${commissionLiquidBRL.toFixed(2)} [+2.5]`
    );
  } else if (commissionLiquidBRL >= 50) {
    score += 1.5;
    log.push(
      `  ️ Comissão Média: R$ ${commissionLiquidBRL.toFixed(
        2
      )} (Margem apertada) [+1.5]`
    );
    notes.push(
      "Comissão abaixo do ideal. Margens mais apertadas exigem maior precisão."
    );
  } else {
    score -= 2;
    log.push(
      `   Comissão Baixa: R$ ${commissionLiquidBRL.toFixed(
        2
      )} (Alto risco) [-2.0]`
    );
    notes.push(
      "️ Comissão muito baixa. Você precisa de CPC extremamente barato ou CR altíssima."
    );
  }

  // --- FATOR 2: CPC DE MERCADO VS CPC ALVO (Peso 40%) ---
  log.push(`\n ANÁLISE DE VIABILIDADE DE CPC:`);

  const marketCpc = product.manualBenchmarkCPC;
  const cpcRatio = marketCpc / cpcBom;

  if (cpcRatio <= 1.0) {
    score += 4;
    log.push(
      `   EXCELENTE! CPC Mercado (R$ ${marketCpc.toFixed(
        2
      )}) ≤ CPC Alvo (R$ ${cpcBom.toFixed(2)}) [+4.0]`
    );
    log.push(
      `   Você tem ${((1 - cpcRatio) * 100).toFixed(
        0
      )}% de margem de segurança.`
    );
  } else if (cpcRatio <= 1.5) {
    score += 2;
    log.push(
      `  ️ CPC Mercado (R$ ${marketCpc.toFixed(2)}) está ${(
        (cpcRatio - 1) *
        100
      ).toFixed(0)}% acima do ideal [+2.0]`
    );
    log.push(`   Ainda é viável, mas margens mais apertadas.`);
    notes.push(
      `CPC de mercado ${((cpcRatio - 1) * 100).toFixed(
        0
      )}% acima do ideal. Monitorar de perto.`
    );
  } else if (cpcRatio <= 2.0) {
    score -= 1;
    log.push(
      `   CPC Mercado (R$ ${marketCpc.toFixed(2)}) está ${(
        (cpcRatio - 1) *
        100
      ).toFixed(0)}% acima do ideal [-1.0]`
    );
    notes.push(
      ` CPC muito alto! ${((cpcRatio - 1) * 100).toFixed(
        0
      )}% acima do recomendado. Lucro improvável.`
    );
  } else {
    score -= 3;
    log.push(
      `   CPC Mercado (R$ ${marketCpc.toFixed(2)}) está ${(
        (cpcRatio - 1) *
        100
      ).toFixed(0)}% acima do ideal [-3.0]`
    );
    notes.push(
      ` INVIÁVEL: CPC de mercado ${cpcRatio.toFixed(
        1
      )}x maior que o sustentável.`
    );
  }

  const realClicksPurchasable = Math.floor(commissionLiquidBRL / marketCpc);
  const realRequiredCR =
    realClicksPurchasable > 0 ? (1 / realClicksPurchasable) * 100 : 100;

  log.push(
    `   Com CPC de mercado R$ ${marketCpc.toFixed(
      2
    )}: ${realClicksPurchasable} cliques compráveis`
  );
  log.push(`   CR necessária para break-even: ${realRequiredCR.toFixed(2)}%`);

  // --- FATOR 3: ANÁLISE DE CR NECESSÁRIA (Peso 20%) ---
  log.push(`\n ANÁLISE DE CONVERSÃO:`);

  const isFundo = product.funnelStage === "fundo";
  const crThreshold = isFundo ? 5.0 : 2.5;
  const crIdeal = isFundo ? 3.0 : 1.5;

  if (realRequiredCR <= crIdeal) {
    score += 2;
    log.push(
      `   CR necessária (${realRequiredCR.toFixed(
        2
      )}%) está abaixo do ideal (${crIdeal}%) [+2.0]`
    );
  } else if (realRequiredCR <= crThreshold) {
    score += 1;
    log.push(
      `  ️ CR necessária (${realRequiredCR.toFixed(
        2
      )}%) está na zona de risco (limite: ${crThreshold}%) [+1.0]`
    );
    notes.push(`CR necessária próxima do limite máximo aceitável.`);
  } else {
    score -= 2;
    log.push(
      `   CR necessária (${realRequiredCR.toFixed(
        2
      )}%) ACIMA do limite (${crThreshold}%) [-2.0]`
    );
    notes.push(
      ` CRÍTICO: CR necessária (${realRequiredCR.toFixed(
        2
      )}%) é irrealista para este funil.`
    );
  }

  // --- FATOR 4: QUALIDADE E ESTRUTURA (Peso 10%) ---
  log.push(`\n️ ANÁLISE ESTRUTURAL:`);

  if (product.temperature === "quente") {
    score += 1;
    log.push(`   Produto Quente (Validado no mercado) [+1.0]`);
  } else if (product.temperature === "frio") {
    log.push(`  ️ Produto Frio (Não validado) [0]`);
    notes.push("Produto não validado. Risco maior de baixa conversão.");
  }

  if (product.qualityLP === "excelente") {
    score += 1;
    log.push(`   Landing Page Excelente [+1.0]`);
  } else if (product.qualityLP === "boa") {
    score += 0.5;
    log.push(`   Landing Page Boa [+0.5]`);
  } else if (product.qualityLP === "media") {
    log.push(`  ️ Landing Page Média [0]`);
    notes.push("LP mediana pode impactar conversão. Considere melhorias.");
  } else if (product.qualityLP === "fraca") {
    score -= 2;
    log.push(`   Landing Page Fraca [-2.0]`);
    notes.push(
      " CRÍTICO: LP fraca vai destruir sua taxa de conversão. Melhore ANTES de investir."
    );
  }

  // ========================================
  //  NOVO: ANÁLISE AUTOMÁTICA DE FUNIL
  // ========================================
  log.push(`\n ANÁLISE DE FUNIL DE VENDAS:`);

  const hasBump = product.offers?.some((o) => o.type === "bump") || false;
  const hasUpsell = product.offers?.some((o) => o.type === "upsell") || false;
  const bumpCount =
    product.offers?.filter((o) => o.type === "bump").length || 0;
  const upsellCount =
    product.offers?.filter((o) => o.type === "upsell").length || 0;

  if (hasBump || hasUpsell) {
    score += 1.5;

    const funilDetails: string[] = [];
    if (hasBump) funilDetails.push(`${bumpCount} Order Bump(s)`);
    if (hasUpsell) funilDetails.push(`${upsellCount} Upsell(s)`);

    log.push(
      `   Funil Otimizado Detectado: ${funilDetails.join(" + ")} [+1.5]`
    );
    log.push(
      `   Funil multi-oferta aumenta LTV (Lifetime Value) e rentabilidade.`
    );

    notes.push(
      ` DESTAQUE: Produto com funil de vendas estruturado (${funilDetails.join(
        ", "
      )}).`
    );
  } else {
    log.push(`  ️ Nenhum Order Bump ou Upsell cadastrado [0]`);
    notes.push(
      " DICA: Adicionar Order Bumps/Upsells aumenta significativamente o lucro por cliente."
    );
  }

  // --- ANÁLISE DE VOLUME/CONCORRÊNCIA (SE DISPONÍVEL) ---
  const volume = product.searchVolume || 0;
  const competitors = product.advertiserCount || 0;

  if (volume > 0 && competitors > 0) {
    log.push(`\n ANÁLISE DE MERCADO (OPCIONAL):`);
    const opportunityRatio = volume / competitors;
    log.push(
      `   ${volume.toLocaleString()} buscas ÷ ${competitors} anunciantes = ${opportunityRatio.toFixed(
        0
      )} buscas/anunciante`
    );

    if (opportunityRatio >= 500) {
      score += 0.5;
      log.push(`   Mercado amplo com espaço para crescer [+0.5]`);
    } else if (opportunityRatio < 50) {
      score -= 0.5;
      log.push(`  ️ Mercado competitivo - CPC pode subir [-0.5]`);
    }
  }

  // --- NORMALIZAÇÃO DO SCORE ---
  if (score > 10) score = 10;
  if (score < 0) score = 0;

  // --- DECISÃO FINAL ---
  let status: "APROVADO" | "REPROVADO" | "RISCO" = "RISCO";
  let reason = "";

  log.push(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  log.push(` SCORE FINAL: ${score.toFixed(1)}/10`);

  if (score >= 7.0) {
    status = "APROVADO";
    reason =
      ` PRODUTO VIÁVEL PARA INVESTIMENTO\n\n` +
      `Score: ${score.toFixed(1)}/10\n\n` +
      ` Análise Financeira:\n` +
      `• Comissão líquida: R$ ${commissionLiquidBRL.toFixed(2)}\n` +
      `• CPC de mercado: R$ ${marketCpc.toFixed(2)}\n` +
      `• Cliques compráveis: ${realClicksPurchasable}\n` +
      `• CR necessária para break-even: ${realRequiredCR.toFixed(2)}%\n\n` +
      ` Recomendação:\n` +
      `Este produto apresenta fundamentos sólidos. ${
        realRequiredCR <= crIdeal
          ? "A CR necessária está abaixo do ideal, indicando boa margem de lucro."
          : "Monitore a conversão de perto nos primeiros dias."
      }\n\n` +
      ` Sugestão de Budget Inicial: R$ ${(commissionLiquidBRL * 3).toFixed(
        2
      )} (3x a comissão)`;
  } else if (score >= 4.0) {
    status = "RISCO";
    reason =
      `️ PRODUTO COM POTENCIAL, MAS REQUER CUIDADO\n\n` +
      `Score: ${score.toFixed(1)}/10\n\n` +
      ` Análise:\n` +
      `• Comissão recebida: R$ ${commissionLiquid.toFixed(2)}\n` +
      `• CPC de mercado: R$ ${marketCpc.toFixed(2)} ${
        cpcRatio > 1.5 ? "(️ ALTO!)" : ""
      }\n` +
      `• CR necessária: ${realRequiredCR.toFixed(2)}% ${
        realRequiredCR > crThreshold ? "(️ ACIMA DO IDEAL!)" : ""
      }\n\n` +
      `️ Pontos de Atenção:\n` +
      `${notes.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\n` +
      ` Recomendação:\n` +
      `Produto passível de lucro, mas com margens apertadas. Só invista se:\n` +
      `• Sua LP for excelente (CR > ${crIdeal}%)\n` +
      `• Você tiver experiência em otimização\n` +
      `• Puder acompanhar diariamente\n\n` +
      ` Budget de Teste Conservador: R$ ${(commissionLiquidBRL * 2).toFixed(
        2
      )}`;
  } else {
    status = "REPROVADO";
    reason =
      ` PRODUTO NÃO RECOMENDADO\n\n` +
      `Score: ${score.toFixed(1)}/10\n\n` +
      ` Problemas Identificados:\n` +
      `${notes.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\n` +
      ` Números:\n` +
      `• CPC de mercado: R$ ${marketCpc.toFixed(2)} (${(
        (cpcRatio - 1) *
        100
      ).toFixed(0)}% acima do sustentável)\n` +
      `• CR necessária: ${realRequiredCR.toFixed(2)}% (${
        realRequiredCR > crThreshold ? "INVIÁVEL" : "ARRISCADO"
      })\n\n` +
      ` Recomendação:\n` +
      `Não invista neste produto nas condições atuais. ${
        notes.length > 0
          ? "Corrija os problemas identificados ou busque outras oportunidades."
          : "Os números não fecham para operação lucrativa."
      }\n\n` +
      `Alternativas:\n` +
      `• Buscar produto com comissão maior\n` +
      `• Encontrar nicho com CPC mais baixo\n` +
      `• Aguardar mudanças nas condições de mercado`;
  }

  // --- CENÁRIOS DE KITS/OFERTAS ---
  const currency =
    product.market === "US" || product.market === "OTHER"
      ? "USD"
      : product.market === "EU"
      ? "EUR"
      : product.market === "UK"
      ? "GBP"
      : "BRL";

  const scenarios: Scenario[] = (product.offers || []).map((offer) => {
    // 1. Calcular comissão na moeda original
    // 1. Calcular comissão bruta da oferta (Moeda Original)
    const offerCommissionGross = offer.price * (offer.commissionPct / 100);

    //  NOVA LÓGICA DINÂMICA PARA KITS:
    let offerPlatformFee = 0;
    if (product.platformFeeType === "fixed") {
      // Se for fixo, subtrai o valor (ex: R$ 1.00 ou $ 1.00)
      offerPlatformFee = product.platformFeeValue || 0;
    } else {
      // Se for %, calcula sobre a bruta (padrão 5% se vazio)
      const feePct = product.platformFeeValue ?? 5;
      offerPlatformFee = offerCommissionGross * (feePct / 100);
    }

    const offerCommissionLiquid = offerCommissionGross - offerPlatformFee;

    // 2.  CONVERTER PARA BRL (essencial!)
    const exchangeRate = rates[currency] || 1;
    const offerCommissionBRL = offerCommissionLiquid * exchangeRate;

    // 3. Calcular quantos cliques são compráveis COM CPC EM BRL
    const clicksNeeded = Math.floor(offerCommissionBRL / marketCpc);
    const crNecessaria = clicksNeeded > 0 ? (1 / clicksNeeded) * 100 : 100;

    let statusScenario: "LUCRO" | "RISCO" | "PREJUÍZO" = "RISCO";

    if (crNecessaria <= crIdeal) {
      statusScenario = "LUCRO";
    } else if (crNecessaria <= crThreshold) {
      statusScenario = "RISCO";
    } else {
      statusScenario = "PREJUÍZO";
    }

    return {
      offerName: offer.name,
      commission: offerCommissionLiquid, // Moeda original (para exibição)
      commissionBRL: offerCommissionBRL, //  NOVO: Em BRL (para cálculos)
      clicksNeeded: clicksNeeded,
      maxCpcBreakEven: crNecessaria,
      status: statusScenario,
    };
  });

  return {
    score,
    status,
    reason,
    log,
    notes: notes.join(" | "),
    scenarios,
  };
};

// ==========================================
// 3. CÁLCULO DE BREAK-EVEN (PONTO DE EQUILÍBRIO)
// ==========================================
export const calculateBreakEven = (
  costs: OperationalCosts,
  commissionLiquid: number,
  cpc: number,
  cr: number
): BreakEvenData => {
  if (cr <= 0) {
    return {
      salesNeeded: 0,
      clicksNeeded: 0,
      investmentAds: 0,
      investmentTotal: costs.total,
      revenueAtBreakEven: 0,
      profit: -costs.total,
      isBalanced: false,
      explanation:
        " Taxa de conversão inválida (CR = 0%). Impossível calcular break-even.",
      marginPerSale: 0,
    };
  }

  const adsCostPerSale = cpc / (cr / 100);
  const marginPerSale = commissionLiquid - adsCostPerSale;

  if (marginPerSale <= 0) {
    return {
      salesNeeded: 0,
      clicksNeeded: 0,
      investmentAds: 0,
      investmentTotal: costs.total,
      revenueAtBreakEven: 0,
      profit: -costs.total,
      isBalanced: false,
      explanation:
        ` PRODUTO INVIÁVEL!\n\n` +
        ` Análise por Venda:\n` +
        `• Comissão recebida: R$ ${commissionLiquid.toFixed(2)}\n` +
        `• Custo de ads por venda: R$ ${adsCostPerSale.toFixed(2)}\n` +
        `• Margem líquida: R$ ${marginPerSale.toFixed(2)} \n\n` +
        `️ PROBLEMA: Cada venda gera prejuízo de R$ ${Math.abs(
          marginPerSale
        ).toFixed(2)}!\n\n` +
        ` SOLUÇÕES:\n` +
        `1. Reduzir o CPC (atualmente R$ ${cpc.toFixed(2)})\n` +
        `2. Melhorar a CR (atualmente ${cr.toFixed(2)}%)\n` +
        `3. Buscar produto com comissão maior`,
      marginPerSale,
    };
  }

  const salesNeeded = Math.ceil(costs.total / marginPerSale);
  const clicksNeeded = Math.ceil(salesNeeded / (cr / 100));
  const investmentAds = clicksNeeded * cpc;
  const investmentTotal = investmentAds + costs.total;
  const revenueAtBreakEven = salesNeeded * commissionLiquid;
  const isBalanced = Math.abs(revenueAtBreakEven - investmentTotal) < 1;

  const explanation =
    ` BREAK-EVEN CALCULADO COM SUCESSO\n\n` +
    ` PONTO DE EQUILÍBRIO:\n` +
    `Você precisa de ${salesNeeded} vendas para zerar o investimento.\n\n` +
    ` DETALHAMENTO:\n\n` +
    ` POR VENDA:\n` +
    `• Comissão recebida: R$ ${commissionLiquid.toFixed(2)}\n` +
    `• Custo de ads: R$ ${adsCostPerSale.toFixed(2)}\n` +
    `• Margem líquida: R$ ${marginPerSale.toFixed(2)} \n\n` +
    ` PARA ATINGIR BREAK-EVEN:\n` +
    `• Vendas necessárias: ${salesNeeded}x\n` +
    `• Cliques necessários: ${clicksNeeded.toLocaleString()} (CR de ${cr}%)\n` +
    `• Investimento em Ads: R$ ${investmentAds.toFixed(2)}\n` +
    `• Custos fixos: R$ ${costs.total.toFixed(2)}\n` +
    `• INVESTIMENTO TOTAL: R$ ${investmentTotal.toFixed(2)}\n\n` +
    ` NO BREAK-EVEN:\n` +
    `• Receita total: R$ ${revenueAtBreakEven.toFixed(2)}\n` +
    `• Lucro: R$ 0,00 (empate)\n\n` +
    ` APÓS O BREAK-EVEN:\n` +
    `Cada venda adicional gera R$ ${marginPerSale.toFixed(
      2
    )} de lucro líquido!`;

  return {
    salesNeeded,
    clicksNeeded,
    investmentAds,
    investmentTotal,
    revenueAtBreakEven,
    profit: 0,
    isBalanced,
    explanation,
    marginPerSale,
  };
};

// ==========================================
// 4. ANÁLISE DE CAMPANHA (VEREDICTO)
// ==========================================
export const analyzeCampaignVerdict = (
  spend: number,
  conversions: number,
  commissionBRL: number,
  status: CampaignStatus
): VerdictResult => {
  // --- VALIDAÇÃO DE SEGURANÇA: Comissão deve ser válida ---
  if (commissionBRL <= 0) {
    return {
      title: "️ DADOS INVÁLIDOS",
      emoji: "️",
      action:
        "A comissão do produto está zerada ou inválida. Verifique o cadastro do produto antes de analisar esta campanha.",
      colorClass: "bg-gray-50 border-gray-200",
      barColorClass: "bg-gray-400",
      textColorClass: "text-gray-800",
      ratioPct: 0,
    };
  }
  // ---------------------------------------------------------
  const revenue = conversions * commissionBRL;
  const cpa = conversions > 0 ? spend / conversions : spend;
  const profit = revenue - spend;
  // Ratio: Quanto do valor da comissão foi gasto para fazer a venda? (0.5 = gastou 50% da comissão)
  const ratio = commissionBRL > 0 ? cpa / commissionBRL : 0;
  const ratioPct = Math.min(ratio * 100, 100);

  // ==============================================================================
  // 1. CENÁRIO: ZERO VENDAS (Fase de Teste/Validação)
  // ==============================================================================
  if (conversions === 0) {
    //  TETO ATINGIDO: Gastou valor cheio da comissão sem vender
    if (spend >= commissionBRL) {
      return {
        title: "PAUSAR: TETO ATINGIDO",
        emoji: "",
        action: `Você gastou R$ ${spend.toFixed(
          2
        )} (100% da comissão) e não vendeu. Pause e revise oferta/público.`,
        colorClass: "bg-red-50 border-red-200",
        barColorClass: "bg-red-600",
        textColorClass: "text-red-800",
        ratioPct: 100,
      };
    }
    //  EM VALIDAÇÃO: Ainda tem "saldo" para gastar
    else {
      return {
        title: "EM VALIDAÇÃO",
        emoji: "",
        action: `O gasto atual ainda não atingiu o valor de uma comissão inteira. Continue rodando para coletar mais dados estatísticos.`,
        colorClass: "bg-yellow-50 border-yellow-200",
        barColorClass: "bg-yellow-500",
        textColorClass: "text-yellow-800",
        // Mostra quanto já consumiu do "seguro"
        ratioPct: commissionBRL > 0 ? (spend / commissionBRL) * 100 : 0,
      };
    }
  }

  // ==============================================================================
  // 2. CENÁRIO: COM VENDAS (Análise de Rentabilidade Detalhada)
  // ==============================================================================

  // Se estiver marcado como "Aprendizado", toleramos um CPA um pouco mais alto
  if (status === "aprendizado") {
    if (ratio <= 0.6) {
      return {
        title: "APRENDIZADO EXCELENTE",
        emoji: " ",
        action: `CPA de R$ ${cpa.toFixed(2)} (${(ratio * 100).toFixed(
          0
        )}% da comissão). Aguarde conclusão sem mexer.`,
        ratioPct,
        colorClass: "bg-blue-50 border-blue-200",
        barColorClass: "bg-blue-600",
        textColorClass: "text-blue-800",
      };
    } else if (ratio <= 1.0) {
      // / Validação dentro do aprendizado
      return {
        title: "APRENDIZADO NORMAL",
        emoji: " ",
        action: `CPA em ${(ratio * 100).toFixed(
          0
        )}% da comissão. Oscilação normal na fase inicial.`,
        ratioPct,
        colorClass: "bg-orange-50 border-orange-200",
        barColorClass: "bg-orange-500",
        textColorClass: "text-orange-800",
      };
    } else {
      //  Prejuízo no aprendizado
      return {
        title: "APRENDIZADO FALHOU",
        emoji: "",
        action: `CPA (R$ ${cpa.toFixed(
          2
        )}) estourou a comissão. Prejuízo de R$ ${Math.abs(profit).toFixed(
          2
        )}. Pausar.`,
        ratioPct: 100,
        colorClass: "bg-red-50 border-red-200",
        barColorClass: "bg-red-600",
        textColorClass: "text-red-800",
      };
    }
  }

  // Se estiver "Qualificada" ou análise geral (Pós-Aprendizado)
  // Aqui entram as funcionalidades de Escala vs Manutenção vs Prejuízo

  if (ratio <= 0.4) {
    //  Lucro muito alto (Gastou até 40% da comissão)
    return {
      title: "ESCALAR AGORA",
      emoji: "️",
      action: `Lucro de R$ ${profit.toFixed(
        2
      )} (${conversions}x vendas). ROI Excelente. Aumente budget em 30-50%.`,
      ratioPct,
      colorClass: "bg-green-50 border-green-200",
      barColorClass: "bg-green-600",
      textColorClass: "text-green-800",
    };
  } else if (ratio <= 0.7) {
    //  Lucro saudável (Gastou até 70% da comissão)
    return {
      title: "PERFORMANCE BOA",
      emoji: "",
      action: `Lucro de R$ ${profit.toFixed(
        2
      )}. Mantenha e otimize (negativar termos ruins, testar novos anúncios).`,
      ratioPct,
      colorClass: "bg-emerald-50 border-emerald-200",
      barColorClass: "bg-emerald-500",
      textColorClass: "text-emerald-800",
    };
  } else if (ratio <= 1.0) {
    //  Empate ou lucro mínimo (Gastou entre 71% e 100% da comissão)

    // CÁLCULO MATEMÁTICO EXATO:
    // Meta: Gasto ser 70% da Receita (para ter 30% de margem de lucro)
    const targetSpend = revenue * 0.7;
    // Fórmula: (Gasto Atual - Gasto Meta) / Gasto Atual
    const reductionNeeded = Math.max(0, ((spend - targetSpend) / spend) * 100);

    return {
      title: "PONTO DE EQUILÍBRIO",
      emoji: "",
      action: `Lucro baixo (R$ ${profit.toFixed(
        2
      )}). Para atingir uma margem saudável de 30%, reduza o CPC em exatos ${reductionNeeded.toFixed(
        1
      )}%.`,
      ratioPct,
      colorClass: "bg-yellow-50 border-yellow-200",
      barColorClass: "bg-yellow-500",
      textColorClass: "text-yellow-800",
    };
  } else {
    //  Prejuízo Real (Gastou mais que a comissão)
    // Cálculo Matemático: Quanto o custo precisa cair para virar Receita?
    const reductionNeeded = ((spend - revenue) / spend) * 100;

    return {
      title: "PREJUÍZO - AÇÃO URGENTE",
      emoji: "",
      action: `Prejuízo de R$ ${Math.abs(profit).toFixed(
        2
      )}. Para empatar (Break-Even) com a conversão atual, é matematicamente necessário reduzir o CPC em exatos ${reductionNeeded.toFixed(
        1
      )}%.`,
      ratioPct: 100,
      colorClass: "bg-red-50 border-red-200",
      barColorClass: "bg-red-600",
      textColorClass: "text-red-800",
    };
  }
};
// ==========================================
// 5. FERRAMENTA 1: DISTRIBUIÇÃO EQUILIBRADA (SIMPLES)
// ==========================================
export const optimizePortfolio = (
  budget: number,
  products: Product[],
  history: Campaign[],
  rates: Record<string, number> = {},
  globalFixedCostsTotal: number = 0,
  activeProductsCount: number = 1
) => {
  if (budget <= 0) {
    return {
      allocation: [],
      remainingBudget: 0,
      totalProfit: 0,
      efficiency: 0,
      message: " Budget inválido. Insira um valor positivo.",
    };
  }

  if (products.length === 0) {
    return {
      allocation: [],
      remainingBudget: budget,
      totalProfit: 0,
      efficiency: 0,
      message:
        "️ Nenhum produto na pasta. Adicione produtos no Mapeamento primeiro.",
    };
  }

  const opportunities = products.map((p) => {
    const prodHistory = history.filter((h) => h.productId === p.id);
    let expectedROI = 0;
    let expectedROAS = 0;

    if (prodHistory.length > 0) {
      const totalRev = prodHistory.reduce((a, b) => a + b.revenue, 0);
      const totalSpend = prodHistory.reduce((a, b) => a + b.spend, 0);

      //  CÁLCULO BLINDADO DE CUSTOS
      const currency =
        p.market === "US" || p.market === "OTHER"
          ? "USD"
          : p.market === "EU"
          ? "EUR"
          : p.market === "UK"
          ? "GBP"
          : "BRL";

      const rate = rates[currency] || 1;

      // 1. Custo Específico (Convertido para BRL)
      const specificCost = (p.specificCosts?.total || 0) * rate;
      // 2. Rateio Global (Divisão igualitária)
      const globalShare =
        activeProductsCount > 0
          ? globalFixedCostsTotal / activeProductsCount
          : 0;

      // 3. Investimento Real = Ads + Específico + Rateio
      const totalInvestment = totalSpend + specificCost + globalShare;

      if (totalInvestment > 0) {
        expectedROAS = totalRev / totalSpend;
        expectedROI = ((totalRev - totalInvestment) / totalInvestment) * 100;
      }
    } else {
      const metrics = calculateProductMetrics(p, rates);
      const estimatedCR = p.funnelStage === "fundo" ? 0.02 : 0.01;
      const estimatedCPC = p.manualBenchmarkCPC || metrics.cpcBom || 2.5;
      const testBudget = 100;
      const estimatedSales = (testBudget / estimatedCPC) * estimatedCR;
      const estimatedRev = estimatedSales * (metrics.commissionLiquidBRL || 0);
      if (testBudget > 0) {
        expectedROAS = estimatedRev / testBudget;
        expectedROI = ((estimatedRev - testBudget) / testBudget) * 100;
      }
    }

    return {
      product: p,
      efficiency: expectedROI,
      roas: expectedROAS,
    };
  });

  const viableOpportunities = opportunities.filter((opp) => opp.efficiency > 0);

  if (viableOpportunities.length === 0) {
    return {
      allocation: [],
      remainingBudget: budget,
      totalProfit: 0,
      efficiency: 0,
      message:
        "️ Nenhum produto com ROI positivo. Impossível alocar com segurança.",
    };
  }

  viableOpportunities.sort((a, b) => b.efficiency - a.efficiency);

  const allocation: any[] = [];
  let remainingBudget = budget;
  let totalProfit = 0;

  viableOpportunities.forEach((opp, index) => {
    if (remainingBudget < 50) return;

    const maxAllocationPct = 0.4;
    const positionMultiplier = Math.max(1 - index * 0.2, 0.3);

    let proposedAllocation = Math.min(
      remainingBudget,
      budget * maxAllocationPct * positionMultiplier
    );

    proposedAllocation = Math.floor(proposedAllocation / 10) * 10;

    if (proposedAllocation < 50) return;

    //  ROI já considera custos fixos históricos, não descontar novamente
    const expectedProfit = proposedAllocation * (opp.efficiency / 100);

    allocation.push({
      productName: opp.product.name,
      amount: proposedAllocation,
      expectedROI: opp.efficiency,
      expectedProfit: expectedProfit,
    });

    remainingBudget -= proposedAllocation;
    totalProfit += expectedProfit;
  });

  const efficiency =
    budget - remainingBudget > 0
      ? (totalProfit / (budget - remainingBudget)) * 100
      : 0;

  return {
    allocation,
    remainingBudget: Math.max(0, remainingBudget),
    totalProfit,
    efficiency,
    message:
      allocation.length > 0
        ? ` Budget distribuído em ${allocation.length} produto(s).`
        : "️ Budget insuficiente.",
  };
};

// ==========================================
// 6. FERRAMENTA 2: SIMPLEX OTIMIZADO (AVANÇADO)
// ==========================================
interface ProductOpportunity {
  id: string;
  name: string;
  roi: number;
  minBudget: number;
  maxBudget: number;
  confidence: number;
  historicalSpend: number;
}

interface SimplexResult {
  allocation: {
    productId: string;
    productName: string;
    allocatedBudget: number;
    expectedProfit: number;
    expectedRevenue: number;
    recommendation: "AUMENTAR" | "MANTER" | "REDUZIR" | "NOVO";
    previousBudget?: number;
    change?: number;
    changePercent?: number;
    confidence: string;
  }[];
  totalBudget: number;
  totalExpectedProfit: number;
  totalExpectedRevenue: number;
  remainingBudget: number;
  efficiency: number;
  message: string;
}

export const optimizePortfolioSimplex = (
  totalBudget: number,
  products: Product[],
  history: Campaign[],
  rates: Record<string, number> = {},
  globalFixedCostsTotal: number = 0,
  activeProductsCount: number = 1
): SimplexResult => {
  // Validação de segurança
  if (!products || !Array.isArray(products)) {
    return {
      allocation: [],
      totalBudget: totalBudget || 0,
      totalExpectedProfit: 0,
      totalExpectedRevenue: 0,
      remainingBudget: totalBudget || 0,
      efficiency: 0,
      message: " Lista de produtos inválida.",
    };
  }

  if (!history || !Array.isArray(history)) {
    history = [];
  }
  if (totalBudget <= 0) {
    return {
      allocation: [],
      totalBudget: 0,
      totalExpectedProfit: 0,
      totalExpectedRevenue: 0,
      remainingBudget: 0,
      efficiency: 0,
      message: " Budget inválido. Insira um valor positivo.",
    };
  }

  if (products.length === 0) {
    return {
      allocation: [],
      totalBudget: totalBudget,
      totalExpectedProfit: 0,
      totalExpectedRevenue: 0,
      remainingBudget: totalBudget,
      efficiency: 0,
      message: "️ Nenhum produto disponível para análise.",
    };
  }
  const opportunities = products.map((p) => {
    const prodHistory = history.filter((h) => h.productId === p.id);
    let roi = 0;
    let confidence = 0;
    let historicalSpendAvg = 0;

    const currency =
      p.market === "US" || p.market === "OTHER"
        ? "USD"
        : p.market === "EU"
        ? "EUR"
        : p.market === "UK"
        ? "GBP"
        : "BRL";
    const rate = rates[currency] || 1;

    //  CÁLCULO DE CUSTO FIXO UNIFICADO (Rateio + Específico)
    const specificCostBRL = (p.specificCosts?.total || 0) * rate;
    const globalShareBRL =
      activeProductsCount > 0 ? globalFixedCostsTotal / activeProductsCount : 0;
    const totalFixedCostsBRL = specificCostBRL + globalShareBRL;

    if (prodHistory.length >= 5) {
      // ... (Lógica de Confiança Alta)
      const totalRevenue = prodHistory.reduce((a, b) => a + b.revenue, 0);
      const totalSpend = prodHistory.reduce((a, b) => a + b.spend, 0);
      const totalRevenueBRL = convertToBRL(totalRevenue, currency, rates);
      const totalSpendBRL = convertToBRL(totalSpend, currency, rates);

      // SOMA TUDO NO INVESTIMENTO
      const totalInvestment = totalSpendBRL + totalFixedCostsBRL;

      if (totalInvestment > 0) {
        roi = (totalRevenueBRL - totalInvestment) / totalInvestment;
        confidence = 0.9;
        historicalSpendAvg = totalSpendBRL / prodHistory.length;
      }
    } else if (prodHistory.length > 0) {
      // ... (Lógica de Confiança Média)
      const totalRevenue = prodHistory.reduce((a, b) => a + b.revenue, 0);
      const totalSpend = prodHistory.reduce((a, b) => a + b.spend, 0);
      const totalRevenueBRL = convertToBRL(totalRevenue, currency, rates);
      const totalSpendBRL = convertToBRL(totalSpend, currency, rates);

      const totalInvestment = totalSpendBRL + totalFixedCostsBRL;

      if (totalInvestment > 0) {
        roi = (totalRevenueBRL - totalInvestment) / totalInvestment;
        confidence = 0.5 + prodHistory.length * 0.1;
        historicalSpendAvg = totalSpendBRL / prodHistory.length;
      }
    } else {
      // ... (Sem Histórico - Estimativa)
      const metrics = calculateProductMetrics(p, rates);
      const estimatedCR = p.funnelStage === "fundo" ? 0.025 : 0.012;
      const estimatedCPC = p.manualBenchmarkCPC || metrics.cpcBom || 2.5;

      const testBudget = 100; // Ads
      const estimatedClicks = testBudget / estimatedCPC;
      const estimatedSales = estimatedClicks * estimatedCR;
      const estimatedRev = estimatedSales * (metrics.commissionLiquidBRL || 0);

      // Investimento = Ads (100) + Custos Fixos
      const totalInvestment = testBudget + totalFixedCostsBRL;

      roi =
        totalInvestment > 0
          ? (estimatedRev - totalInvestment) / totalInvestment
          : 0;
      confidence = 0.3;
      historicalSpendAvg = 0;
    }

    const adjustedROI = roi * confidence;

    const commissionGross = (p.price || 0) * ((p.commissionPct || 0) / 100);
    const platformFee = commissionGross * ((p.platformFeePct ?? 5) / 100);
    const commissionLiquid = commissionGross - platformFee;
    const commissionLiquidBRL = convertToBRL(commissionLiquid, currency);

    const minBudget = Math.max(50, commissionLiquidBRL * 3);
    const maxBudget =
      historicalSpendAvg > 0 ? historicalSpendAvg * 2.5 : totalBudget * 0.4;

    return {
      id: p.id,
      name: p.name,
      roi: adjustedROI,
      minBudget,
      maxBudget,
      confidence,
      historicalSpend: historicalSpendAvg,
    };
  });

  const viableOpportunities = opportunities.filter((opp) => opp.roi > 0);

  if (viableOpportunities.length === 0) {
    return {
      allocation: [],
      totalBudget: totalBudget,
      totalExpectedProfit: 0,
      totalExpectedRevenue: 0,
      remainingBudget: totalBudget,
      efficiency: 0,
      message: "️ Nenhum produto com ROI positivo detectado.",
    };
  }

  viableOpportunities.sort((a, b) => b.roi - a.roi);

  const allocation: SimplexResult["allocation"] = [];
  let remainingBudget = totalBudget;
  let totalExpectedProfit = 0;
  let totalExpectedRevenue = 0;

  viableOpportunities.forEach((opp) => {
    if (remainingBudget < opp.minBudget) return;

    let allocatedBudget = 0;

    if (opp.confidence >= 0.8) {
      allocatedBudget = Math.min(
        opp.maxBudget,
        remainingBudget,
        totalBudget * 0.5
      );
    } else if (opp.confidence >= 0.5) {
      allocatedBudget = Math.min(
        opp.maxBudget,
        remainingBudget,
        totalBudget * 0.3
      );
    } else {
      allocatedBudget = Math.min(
        opp.maxBudget,
        remainingBudget,
        totalBudget * 0.15,
        opp.minBudget * 2
      );
    }

    allocatedBudget = Math.floor(allocatedBudget / 10) * 10;

    if (allocatedBudget < opp.minBudget) return;

    const expectedRevenue = allocatedBudget * (1 + opp.roi);
    const expectedProfit = allocatedBudget * opp.roi; //  ROI já inclui custos fixos, não descontar novamente

    let recommendation: "AUMENTAR" | "MANTER" | "REDUZIR" | "NOVO" = "NOVO";
    let previousBudget = opp.historicalSpend;
    let change = 0;
    let changePercent = 0;

    if (opp.historicalSpend > 0) {
      change = allocatedBudget - opp.historicalSpend;
      changePercent = (change / opp.historicalSpend) * 100;

      if (changePercent > 10) {
        recommendation = "AUMENTAR";
      } else if (changePercent < -10) {
        recommendation = "REDUZIR";
      } else {
        recommendation = "MANTER";
      }
    }

    const confidenceLabel =
      opp.confidence >= 0.8
        ? "Alta"
        : opp.confidence >= 0.5
        ? "Média"
        : "Baixa";

    allocation.push({
      productId: opp.id,
      productName: opp.name,
      allocatedBudget,
      expectedProfit,
      expectedRevenue,
      recommendation,
      previousBudget: previousBudget > 0 ? previousBudget : undefined,
      change: previousBudget > 0 ? change : undefined,
      changePercent: previousBudget > 0 ? changePercent : undefined,
      confidence: confidenceLabel,
    });

    remainingBudget -= allocatedBudget;
    totalExpectedProfit += expectedProfit;
    totalExpectedRevenue += expectedRevenue;
  });

  const efficiency =
    totalBudget > 0
      ? (totalExpectedProfit / (totalBudget - remainingBudget)) * 100
      : 0;

  return {
    allocation,
    totalBudget,
    totalExpectedProfit,
    totalExpectedRevenue,
    remainingBudget,
    efficiency,
    message:
      allocation.length > 0
        ? ` Alocação otimizada para ${
            allocation.length
          } produto(s). ROI médio: ${efficiency.toFixed(1)}%`
        : "️ Nenhuma alocação viável.",
  };
};

// ==========================================
// 7. ANÁLISE FINANCEIRA COMPLETA (SETUP) - VERSÃO FINAL
// ==========================================

export interface FinancialMetrics {
  // Dados base
  custoFixoTotal: number;
  comissao: number;
  cpc: number;

  //  SEMPRE CALCULADOS (sem precisar de CR)
  crMinimaParaBreakEven: number;
  cpaMaximo: number;

  // Tabela de cenários
  cenarios: {
    cr: number;
    cv: number;
    mc: number;
    cpa: number;
    beVendas: number;
    beCliques: number;
    gastoTotal: number;
    status: "LUCRO" | "BREAK-EVEN" | "PREJUÍZO";
  }[];

  // Calculados COM CR (quando fornecida)
  crFornecida: number | null;
  custoVariavelPorVenda: number | null;
  margemContribuicao: number | null;
  breakEvenVendas: number | null;
  breakEvenCliques: number | null;
  gastoTotal: number | null;
  cpaReal: number | null;
  cpcMaximo: number | null;
  isViable: boolean | null;
}

export const calculateFinancialMetrics = (
  custos: OperationalCosts,
  comissaoLiquida: number,
  cpc: number,
  crPorcentagem: number,
  currency: string = "BRL",
  rates: Record<string, number> = {}
): FinancialMetrics | null => {
  if (custos.total < 0) return null;
  if (cpc <= 0) return null;
  if (comissaoLiquida <= 0) return null;

  //  CONVERTER PARA BRL
  const exchangeRate = rates[currency] || 1;
  const comissaoLiquidaBRL = comissaoLiquida * exchangeRate;

  //  USAR comissaoLiquidaBRL nos cálculos
  const crMinimaParaBreakEven = (cpc / comissaoLiquidaBRL) * 100;
  const cpaMaximo = comissaoLiquidaBRL;

  //  GERAR CENÁRIOS
  const cenarios = [4, 3, 2, 1.5, 1, 0.5].map((cr) => {
    const crDecimal = cr / 100;
    const cv = cpc / crDecimal;
    const mc = comissaoLiquida - cv;
    const cpa = cv;
    const beVendas = mc > 0 ? custos.total / mc : 0;
    const beCliques = beVendas > 0 ? beVendas / crDecimal : 0;
    const gastoTotal = beCliques * cpc;

    let status: "LUCRO" | "BREAK-EVEN" | "PREJUÍZO" = "PREJUÍZO";
    if (mc > cpaMaximo * 0.2) status = "LUCRO";
    else if (mc > 0) status = "BREAK-EVEN";

    return { cr, cv, mc, cpa, beVendas, beCliques, gastoTotal, status };
  });

  //  SE CR FOI FORNECIDA
  let metricsComCR = {
    crFornecida: null as number | null,
    custoVariavelPorVenda: null as number | null,
    margemContribuicao: null as number | null,
    breakEvenVendas: null as number | null,
    breakEvenCliques: null as number | null,
    gastoTotal: null as number | null,
    cpaReal: null as number | null,
    cpcMaximo: null as number | null,
    isViable: null as boolean | null,
  };

  if (crPorcentagem > 0 && crPorcentagem <= 100) {
    const cr = crPorcentagem / 100;
    const cv = cpc / cr;
    const mc = comissaoLiquida - cv;

    metricsComCR = {
      crFornecida: crPorcentagem,
      custoVariavelPorVenda: cv,
      margemContribuicao: mc,
      breakEvenVendas: mc > 0 ? custos.total / mc : 0,
      breakEvenCliques: mc > 0 ? custos.total / mc / cr : 0,
      gastoTotal: mc > 0 ? (custos.total / mc / cr) * cpc : 0,
      cpaReal: cv,
      cpcMaximo: comissaoLiquida * cr,
      isViable: mc > 0,
    };
  }

  return {
    custoFixoTotal: custos.total,
    comissao: comissaoLiquida,
    cpc,
    crMinimaParaBreakEven,
    cpaMaximo,
    cenarios,
    ...metricsComCR,
  };
};
// ==========================================
// 8. FUNÇÕES PARA DASHBOARD (NOVAS)
// ==========================================

// ==========================================
// 1. calculateSimulatorMetrics (MODIFICADA)
// ==========================================
export const calculateSimulatorMetrics = (
  product: Product,
  budget: number,
  cpc: number,
  cr: number,
  fixedCostsTotal: number = 0,
  activeProductsCount: number = 1,
  rates: Record<string, number> = {},
  daysToRate: number = 30 //  NOVO: Janela de tempo (dias do mês)
) => {
  // Recalcular métricas com conversão correta
  //  USA A COMISSÃO QUE JÁ VEM INJETADA (já considerando a oferta ativa)
  const commissionLiquid = product.commissionLiquid || 0;

  // Calcular custos fixos mensais
  const totalMonthlyFixed =
    activeProductsCount > 0 ? Number(fixedCostsTotal) / activeProductsCount : 0;

  //  NOVO: Ratear custo fixo pela janela de tempo (ex: 28, 30 ou 31 dias)
  const ratedFixedCost = totalMonthlyFixed / Number(daysToRate);

  // Métricas de tráfego
  const clicks = Math.floor(budget / cpc);
  const sales = Math.floor(clicks * (cr / 100));
  const revenue = sales * commissionLiquid;

  // Lucro real (Revenue - Ads - Fixo RATEADO)
  const profit = revenue - budget - ratedFixedCost;

  // ROI real
  const totalInvested = budget + ratedFixedCost;
  const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  return { clicks, sales, revenue, profit, roi };
};

/**
 * Calcula break-even simplificado (versão Financeiro)
 */
export const calculateBreakEvenSimple = (
  product: Product,
  budget: number,
  cpc: number,
  fixedCostsTotal: number = 0,
  rates: Record<string, number> = {},
  daysToRate: number = 30 //  NOVO: Janela de tempo
) => {
  //  USA A COMISSÃO QUE JÁ VEM INJETADA (já considerando a oferta ativa)
  const commissionLiquid = product.commissionLiquid || 0;

  if (cpc <= 0 || commissionLiquid <= 0) {
    return {
      totalClicks: 0,
      requiredCR: 0,
      salesNeeded: 0,
      revenueAtBreakEven: 0,
    };
  }

  const totalClicks = Math.floor(budget / cpc);

  //  NOVO: Ratear custo fixo pela janela de tempo
  const ratedFixedCost = fixedCostsTotal / daysToRate;
  const totalInvestment = budget + ratedFixedCost;

  const salesNeeded = Math.ceil(totalInvestment / commissionLiquid);
  const requiredCR = totalClicks > 0 ? (salesNeeded / totalClicks) * 100 : 0;
  const revenueAtBreakEven = salesNeeded * commissionLiquid;

  return {
    totalClicks,
    requiredCR,
    salesNeeded,
    revenueAtBreakEven,
  };
};

/**
 * Calcula KPIs de campanha/produto
 */
export const calculateCampaignKPIs = (
  revenue: number,
  spend: number,
  conversions: number,
  clicks: number
) => {
  const profit = revenue - spend;
  const roi = spend > 0 ? (profit / spend) * 100 : 0;
  const roas = spend > 0 ? revenue / spend : 0;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const cr = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpa = conversions > 0 ? spend / conversions : 0;
  const avgTicket = conversions > 0 ? revenue / conversions : 0;

  return {
    profit,
    roi,
    roas,
    margin,
    cr,
    cpc,
    cpa,
    avgTicket,
  };
};

/**
 * Calcula métricas agregadas de múltiplas campanhas
 */
export const calculateAggregatedMetrics = (campaigns: Campaign[]) => {
  const totals = campaigns.reduce(
    (acc, campaign) => ({
      spend: acc.spend + campaign.spend,
      revenue: acc.revenue + campaign.revenue,
      conversions: acc.conversions + campaign.conversions,
      clicks: acc.clicks + campaign.clicks,
      campaignCount: acc.campaignCount + 1,
    }),
    { spend: 0, revenue: 0, conversions: 0, clicks: 0, campaignCount: 0 }
  );

  const kpis = calculateCampaignKPIs(
    totals.revenue,
    totals.spend,
    totals.conversions,
    totals.clicks
  );

  return {
    ...totals,
    ...kpis,
  };
};
// ==========================================
// 9. SISTEMA DE ALERTAS INTELIGENTES
// ==========================================

export type AlertType = "danger" | "warning" | "success" | "info";
export type AlertCategory =
  | "campaign"
  | "product"
  | "budget"
  | "goal"
  | "opportunity";

export interface Alert {
  id: string;
  type: AlertType;
  category: AlertCategory;
  title: string;
  message: string;
  details?: string;
  actionSuggestion?: string;
  productName?: string;
  campaignId?: string;
  timestamp: number;
  priority: number; // 1 (baixa) a 5 (crítica)
}

interface AlertConfig {
  // Limites de alerta
  maxDaysWithoutConversion: number;
  minROIForScale: number;
  maxCPCIncreasePercent: number;
  minCRDecreasePercent: number;
  goalWarningThreshold: number; // % abaixo da meta para alertar
}

const DEFAULT_ALERT_CONFIG: AlertConfig = {
  maxDaysWithoutConversion: 3,
  minROIForScale: 100,
  maxCPCIncreasePercent: 30,
  minCRDecreasePercent: 20,
  goalWarningThreshold: 25,
};

/**
 * Analisa campanhas e produtos e gera alertas inteligentes
 */
export const generateAlerts = (
  products: Product[],
  campaigns: Campaign[],
  monthlyGoal: number,
  config: Partial<AlertConfig> = {}
): Alert[] => {
  const alerts: Alert[] = [];
  const finalConfig = { ...DEFAULT_ALERT_CONFIG, ...config };
  const now = Date.now();

  // 1. ALERTAS DE CAMPANHA: Gastando sem converter
  const recentCampaigns = campaigns.filter((c) => {
    const campaignDate = new Date(c.date).getTime();
    const daysAgo = (now - campaignDate) / (1000 * 60 * 60 * 24);
    return daysAgo <= finalConfig.maxDaysWithoutConversion;
  });

  const campaignsByProduct = new Map<string, Campaign[]>();
  recentCampaigns.forEach((c) => {
    const list = campaignsByProduct.get(c.productId) || [];
    list.push(c);
    campaignsByProduct.set(c.productId, list);
  });

  campaignsByProduct.forEach((productCampaigns, productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const totalSpend = productCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalConversions = productCampaigns.reduce(
      (sum, c) => sum + c.conversions,
      0
    );
    const daysActive = productCampaigns.length;

    // ALERTA: Gastando sem converter
    if (
      totalConversions === 0 &&
      totalSpend > (product.commissionLiquid || 50) * 0.5
    ) {
      alerts.push({
        id: `no-conversion-${productId}-${now}`,
        type: "danger",
        category: "campaign",
        title: " Campanha sem conversão",
        message: `${product.name} está há ${daysActive} dia(s) sem converter`,
        details: `Já foram gastos R$ ${totalSpend.toFixed(
          2
        )} sem nenhuma venda.`,
        actionSuggestion:
          "Revisar público-alvo, anúncios ou pausar a campanha temporariamente.",
        productName: product.name,
        timestamp: now,
        priority: 5,
      });
    }
  });

  // 2. ALERTAS DE OPORTUNIDADE: ROI alto = hora de escalar
  const productsWithHistory = products
    .map((p) => {
      const productCampaigns = campaigns.filter((c) => c.productId === p.id);
      if (productCampaigns.length === 0) return null;

      const aggregated = calculateAggregatedMetrics(productCampaigns);
      return { product: p, metrics: aggregated };
    })
    .filter(Boolean) as {
    product: Product;
    metrics: ReturnType<typeof calculateAggregatedMetrics>;
  }[];

  productsWithHistory.forEach(({ product, metrics }) => {
    // ALERTA: ROI excelente - oportunidade de escalar
    if (
      metrics.roi >= finalConfig.minROIForScale &&
      metrics.campaignCount >= 3
    ) {
      alerts.push({
        id: `scale-opportunity-${product.id}-${now}`,
        type: "success",
        category: "opportunity",
        title: " Oportunidade de escala detectada!",
        message: `${product.name} está com ROI de ${metrics.roi.toFixed(0)}%`,
        details: `Baseado em ${
          metrics.campaignCount
        } campanhas recentes. Lucro atual: R$ ${metrics.profit.toFixed(2)}.`,
        actionSuggestion:
          "Considere aumentar o budget em 30-50% para maximizar lucros.",
        productName: product.name,
        timestamp: now,
        priority: 4,
      });
    }

    // ALERTA: Prejuízo consistente
    if (metrics.profit < 0 && metrics.campaignCount >= 5) {
      alerts.push({
        id: `consistent-loss-${product.id}-${now}`,
        type: "danger",
        category: "product",
        title: " Produto em prejuízo consistente",
        message: `${product.name} está no vermelho há várias campanhas`,
        details: `Prejuízo acumulado: R$ ${Math.abs(metrics.profit).toFixed(
          2
        )} em ${metrics.campaignCount} campanhas.`,
        actionSuggestion:
          "Pausar produto ou revisar estratégia completamente (LP, público, oferta).",
        productName: product.name,
        timestamp: now,
        priority: 5,
      });
    }
  });

  // 3. ALERTAS DE MUDANÇA: CPC subiu, CR caiu
  productsWithHistory.forEach(({ product, metrics }) => {
    const last7Days = campaigns.filter((c) => {
      const daysAgo =
        (now - new Date(c.date).getTime()) / (1000 * 60 * 60 * 24);
      return c.productId === product.id && daysAgo <= 7;
    });

    const previous7Days = campaigns.filter((c) => {
      const daysAgo =
        (now - new Date(c.date).getTime()) / (1000 * 60 * 60 * 24);
      return c.productId === product.id && daysAgo > 7 && daysAgo <= 14;
    });

    if (last7Days.length === 0 || previous7Days.length === 0) return;

    const recentMetrics = calculateAggregatedMetrics(last7Days);
    const previousMetrics = calculateAggregatedMetrics(previous7Days);

    // ALERTA: CPC subiu significativamente
    const cpcIncrease =
      ((recentMetrics.cpc - previousMetrics.cpc) / previousMetrics.cpc) * 100;
    if (cpcIncrease >= finalConfig.maxCPCIncreasePercent) {
      alerts.push({
        id: `cpc-spike-${product.id}-${now}`,
        type: "warning",
        category: "campaign",
        title: "️ CPC aumentou significativamente",
        message: `${product.name}: CPC subiu ${cpcIncrease.toFixed(
          0
        )}% na última semana`,
        details: `De R$ ${previousMetrics.cpc.toFixed(
          2
        )} para R$ ${recentMetrics.cpc.toFixed(2)}.`,
        actionSuggestion:
          "Revisar palavras-chave, adicionar negativações ou ajustar lances.",
        productName: product.name,
        timestamp: now,
        priority: 3,
      });
    }

    // ALERTA: CR caiu significativamente
    const crDecrease =
      ((previousMetrics.cr - recentMetrics.cr) / previousMetrics.cr) * 100;
    if (
      crDecrease >= finalConfig.minCRDecreasePercent &&
      previousMetrics.cr > 0
    ) {
      alerts.push({
        id: `cr-drop-${product.id}-${now}`,
        type: "warning",
        category: "campaign",
        title: " Taxa de conversão caiu",
        message: `${product.name}: CR caiu ${crDecrease.toFixed(0)}%`,
        details: `De ${previousMetrics.cr.toFixed(
          2
        )}% para ${recentMetrics.cr.toFixed(2)}%.`,
        actionSuggestion:
          "Verificar se houve mudanças na LP, oferta ou qualidade do tráfego.",
        productName: product.name,
        timestamp: now,
        priority: 3,
      });
    }
  });

  // 4. ALERTAS DE META: Progresso da meta mensal
  if (monthlyGoal > 0) {
    const thisMonthCampaigns = campaigns.filter((c) => {
      const campaignDate = new Date(c.date);
      const now = new Date();
      return (
        campaignDate.getMonth() === now.getMonth() &&
        campaignDate.getFullYear() === now.getFullYear()
      );
    });

    if (thisMonthCampaigns.length > 0) {
      const monthMetrics = calculateAggregatedMetrics(thisMonthCampaigns);
      const progressPercent = (monthMetrics.profit / monthlyGoal) * 100;

      const today = new Date().getDate();
      const daysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate();
      const expectedProgress = (today / daysInMonth) * 100;
      const gap = progressPercent - expectedProgress;

      // ALERTA: Muito abaixo da meta
      if (gap < -finalConfig.goalWarningThreshold) {
        alerts.push({
          id: `goal-behind-${now}`,
          type: "warning",
          category: "goal",
          title: " Abaixo da meta mensal",
          message: `Você está ${Math.abs(gap).toFixed(0)}% abaixo do esperado`,
          details: `Meta: ${formatBRL(monthlyGoal)} | Lucro atual: ${formatBRL(
            monthMetrics.profit
          )} (${progressPercent.toFixed(0)}%)`,
          actionSuggestion:
            "Considere escalar produtos lucrativos ou revisar estratégia.",
          timestamp: now,
          priority: 3,
        });
      }

      // ALERTA: Vai superar a meta!
      if (progressPercent >= 90 && progressPercent < 100) {
        alerts.push({
          id: `goal-almost-${now}`,
          type: "success",
          category: "goal",
          title: " Quase batendo a meta!",
          message: `Faltam apenas ${(100 - progressPercent).toFixed(
            0
          )}% para atingir sua meta`,
          details: `Lucro atual: R$ ${monthMetrics.profit.toFixed(
            2
          )} de R$ ${monthlyGoal.toFixed(2)}`,
          actionSuggestion:
            "Continue o bom trabalho! Mantenha a estratégia atual.",
          timestamp: now,
          priority: 2,
        });
      }

      // ALERTA: Meta batida!
      if (progressPercent >= 100) {
        alerts.push({
          id: `goal-achieved-${now}`,
          type: "success",
          category: "goal",
          title: " META ATINGIDA!",
          message: `Parabéns! Você superou sua meta mensal!`,
          details: `Meta: R$ ${monthlyGoal.toFixed(
            2
          )} | Alcançado: R$ ${monthMetrics.profit.toFixed(
            2
          )} (${progressPercent.toFixed(0)}%)`,
          actionSuggestion: "Considere aumentar sua meta para o próximo mês!",
          timestamp: now,
          priority: 1,
        });
      }
    }
  }

  // Ordenar por prioridade (maior primeiro)
  return alerts.sort((a, b) => b.priority - a.priority);
};

// ==========================================
// 10. COMPARADOR DE PRODUTOS
// ==========================================

export interface ProductComparisonMetrics {
  productId: string;
  productName: string;
  nicho: string;

  // Métricas agregadas
  totalCampaigns: number;
  totalSpend: number;
  totalRevenue: number;
  totalProfit: number;
  totalProfitBRL?: number;
  totalConversions: number;
  totalClicks: number;

  // KPIs
  roi: number;
  roas: number;
  cr: number;
  cpc: number;
  cpa: number;
  avgTicket: number;
  margin: number;

  // Score geral (0-100)
  overallScore: number;
}

export interface ProductComparison {
  products: ProductComparisonMetrics[];
  winner: {
    productId: string;
    productName: string;
    reason: string;
  };
  recommendations: string[];
  insights: string[];
}

/**
 * Compara múltiplos produtos e gera análise detalhada
 * ATUALIZADO: Usa Performance Score baseado em dados reais (não overallScore)
 */
export const compareProducts = (
  productIds: string[],
  allProducts: Product[],
  campaigns: Campaign[],
  rates: Record<string, number> = {} //  NOVO: recebe taxas de câmbio
): ProductComparison | null => {
  if (productIds.length < 2) {
    return null;
  }

  // Calcular métricas para cada produto
  const productsMetrics: ProductComparisonMetrics[] = productIds
    .map((productId) => {
      const product = allProducts.find((p) => p.id === productId);
      if (!product) {
        return null;
      }

      const productCampaigns = campaigns.filter(
        (c) => c.productId === productId
      );

      if (productCampaigns.length === 0) {
        return {
          productId: product.id,
          productName: product.name,
          nicho: product.nicho || "Sem nicho",
          totalCampaigns: 0,
          totalSpend: 0,
          totalRevenue: 0,
          totalProfit: 0,
          totalConversions: 0,
          totalClicks: 0,
          roi: 0,
          roas: 0,
          cr: 0,
          cpc: 0,
          cpa: 0,
          avgTicket: 0,
          margin: 0,
          overallScore: 0,
        };
      }

      const aggregated = calculateAggregatedMetrics(productCampaigns);

      //  CONVERSÃO CRÍTICA: Normalizar lucro para BRL
      const currency =
        product.market === "US" || product.market === "OTHER"
          ? "USD"
          : product.market === "EU"
          ? "EUR"
          : product.market === "UK"
          ? "GBP"
          : "BRL";

      const exchangeRate = rates[currency] || 1;
      const totalProfitBRL = aggregated.profit * exchangeRate;

      //  NOVO CÁLCULO: Performance Score (0-100)
      // Baseado em dados REAIS das campanhas (não mais product.overallScore)

      // 1. Normalizar Lucro (0-100): Quanto maior o lucro, melhor
      // Assumindo que R$ 1000+ de lucro = score 100
      const maxProfitForScore = 1000;
      const profitScore = Math.min(
        100,
        Math.max(0, (totalProfitBRL / maxProfitForScore) * 100)
      );

      // 2. Normalizar ROI (0-100): ROI de 200%+ = score 100
      const maxROIForScore = 200;
      const roiScore = Math.min(
        100,
        Math.max(0, (aggregated.roi / maxROIForScore) * 100)
      );

      // 3. Normalizar Volume (0-100): 10+ conversões = score 100
      const maxConversionsForScore = 10;
      const volumeScore = Math.min(
        100,
        Math.max(0, (aggregated.conversions / maxConversionsForScore) * 100)
      );

      //  FÓRMULA FINAL: Performance Score
      const performanceScore =
        profitScore * 0.5 + // 50% Lucro
        roiScore * 0.3 + // 30% ROI
        volumeScore * 0.2; // 20% Volume

      return {
        productId: product.id,
        productName: product.name,
        nicho: product.nicho || "Sem nicho",
        totalCampaigns: aggregated.campaignCount,
        totalSpend: aggregated.spend,
        totalRevenue: aggregated.revenue,
        totalProfit: aggregated.profit, // ️ Manter original para exibição
        totalProfitBRL, //  NOVO: para comparação justa
        totalConversions: aggregated.conversions,
        totalClicks: aggregated.clicks,
        roi: aggregated.roi,
        roas: aggregated.roas,
        cr: aggregated.cr,
        cpc: aggregated.cpc,
        cpa: aggregated.cpa,
        avgTicket: aggregated.avgTicket,
        margin: aggregated.margin,
        overallScore: performanceScore, //  AGORA É PERFORMANCE SCORE
      };
    })
    .filter(Boolean) as ProductComparisonMetrics[];

  if (productsMetrics.length < 2) {
    return null;
  }

  //  DETERMINAR VENCEDOR: Maior Performance Score
  const sortedByScore = [...productsMetrics].sort(
    (a, b) => b.overallScore - a.overallScore
  );
  const winner = sortedByScore[0];

  //  CRITÉRIO DE DESEMPATE: Se scores muito próximos (< 5 pontos), Lucro decide
  const runnerUp = sortedByScore[1];
  if (Math.abs(winner.overallScore - runnerUp.overallScore) < 5) {
    // Comparar Lucro em BRL
    const winnerProfitBRL = winner.totalProfitBRL || winner.totalProfit;
    const runnerUpProfitBRL = runnerUp.totalProfitBRL || runnerUp.totalProfit;

    if (runnerUpProfitBRL > winnerProfitBRL) {
      // Runner-up vence por lucro maior
      const tempWinner = sortedByScore[0];
      sortedByScore[0] = sortedByScore[1];
      sortedByScore[1] = tempWinner;
    }
  }

  const finalWinner = sortedByScore[0];

  //  REASON EXPLICATIVO (baseado em dados reais)
  let winnerReason = "";

  if (finalWinner.totalProfit > 0 && finalWinner.roi > 100) {
    winnerReason = `Melhor balanço entre lucro (R$ ${(
      finalWinner.totalProfitBRL || finalWinner.totalProfit
    ).toFixed(2)}) e eficiência (ROI de ${finalWinner.roi.toFixed(0)}%)`;
  } else if (finalWinner.totalProfit > 0) {
    winnerReason = `Maior lucro líquido total: R$ ${(
      finalWinner.totalProfitBRL || finalWinner.totalProfit
    ).toFixed(2)} em ${finalWinner.totalCampaigns} campanhas`;
  } else if (finalWinner.roi > 50) {
    winnerReason = `Melhor eficiência com ROI de ${finalWinner.roi.toFixed(
      0
    )}%, apesar de lucro ainda em crescimento`;
  } else {
    winnerReason = `Menor prejuízo ou melhor posição entre as opções disponíveis`;
  }

  // Gerar recomendações (mantém a lógica existente, mas com ajustes)
  const recommendations: string[] = [];

  const bestROI = Math.max(...productsMetrics.map((p) => p.roi));
  const worstROI = Math.min(...productsMetrics.map((p) => p.roi));

  if (bestROI > 100) {
    const bestProduct = productsMetrics.find((p) => p.roi === bestROI);
    recommendations.push(
      ` ${bestProduct?.productName} tem ROI excelente (${bestROI.toFixed(
        0
      )}%). Considere aumentar o budget neste produto.`
    );
  }

  if (worstROI < 0) {
    const worstProduct = productsMetrics.find((p) => p.roi === worstROI);
    recommendations.push(
      `️ ${worstProduct?.productName} está em prejuízo. Considere pausar ou otimizar drasticamente.`
    );
  }

  //  NOVA RECOMENDAÇÃO: Comparação de lucro absoluto
  const bestProfitProduct = [...productsMetrics].sort(
    (a, b) =>
      (b.totalProfitBRL || b.totalProfit) - (a.totalProfitBRL || a.totalProfit)
  )[0];

  const worstProfitProduct = [...productsMetrics].sort(
    (a, b) =>
      (a.totalProfitBRL || a.totalProfit) - (b.totalProfitBRL || b.totalProfit)
  )[0];

  const profitGap =
    (bestProfitProduct.totalProfitBRL || bestProfitProduct.totalProfit) -
    (worstProfitProduct.totalProfitBRL || worstProfitProduct.totalProfit);

  if (profitGap > 500) {
    recommendations.push(
      ` ${bestProfitProduct.productName} gera R$ ${profitGap.toFixed(
        2
      )} a mais de lucro que ${
        worstProfitProduct.productName
      }. Priorize o que põe dinheiro no bolso.`
    );
  }

  const bestCR = Math.max(...productsMetrics.map((p) => p.cr));
  const worstCR = Math.min(...productsMetrics.map((p) => p.cr));

  if (bestCR > worstCR * 2) {
    const bestCRProduct = productsMetrics.find((p) => p.cr === bestCR);
    recommendations.push(
      ` ${bestCRProduct?.productName} converte ${(
        (bestCR / worstCR - 1) *
        100
      ).toFixed(
        0
      )}% melhor que o pior produto. A landing page ou oferta está muito superior.`
    );
  }

  // Gerar insights (mantém a lógica, com ajustes)
  const insights: string[] = [];

  const avgROI =
    productsMetrics.reduce((sum, p) => sum + p.roi, 0) / productsMetrics.length;
  insights.push(` ROI médio entre os produtos: ${avgROI.toFixed(1)}%`);

  const totalSpend = productsMetrics.reduce((sum, p) => sum + p.totalSpend, 0);
  const totalRevenue = productsMetrics.reduce(
    (sum, p) => sum + p.totalRevenue,
    0
  );
  const totalProfit = productsMetrics.reduce(
    (sum, p) => sum + (p.totalProfitBRL || p.totalProfit),
    0
  );

  insights.push(
    ` Total investido: R$ ${totalSpend.toFixed(
      2
    )} | Total recebido: R$ ${totalRevenue.toFixed(
      2
    )} | Lucro líquido: R$ ${totalProfit.toFixed(2)}`
  );

  const profitableCount = productsMetrics.filter(
    (p) => p.totalProfit > 0
  ).length;
  insights.push(
    ` ${profitableCount} de ${productsMetrics.length} produto(s) no lucro`
  );

  return {
    products: productsMetrics,
    winner: {
      productId: finalWinner.productId,
      productName: finalWinner.productName,
      reason: winnerReason,
    },
    recommendations,
    insights,
  };
};
// ==========================================
// 11. GERADOR DE RELATÓRIOS
// ==========================================

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  label: string;
}

export interface ReportData {
  period: ReportPeriod;
  generatedAt: Date;

  // Resumo Executivo
  summary: {
    totalRevenue: number;
    totalSpend: number;
    totalProfit: number;
    roi: number;
    margin: number;
    campaignsCount: number;
    productsActive: number;
  };
  breakdowns: {
    byCurrency: Record<
      string,
      { revenue: number; spend: number; profit: number }
    >;
    byMarket: {
      nacional: { profitBRL: number; roiAvg: number; productsCount: number };
      internacional: {
        profitBRL: number;
        roiAvg: number;
        productsCount: number;
      };
    };
    byNiche: { nicho: string; profitBRL: number; productsCount: number }[];
  };

  // Performance por Produto
  productPerformance: {
    name: string;
    nicho: string;
    revenue: number;
    spend: number;
    profit: number;
    profitBRL: number;
    market: string;
    roi: number;
    conversions: number;
    status: "excellent" | "good" | "warning" | "danger";
  }[];

  // Top Performers
  topProducts: {
    byROI: { name: string; roi: number }[];
    byRevenue: { name: string; revenue: number }[];
    byProfit: { name: string; profit: number }[];
  };

  // Alertas e Problemas
  alerts: {
    critical: string[];
    warnings: string[];
    opportunities: string[];
  };

  // Recomendações Estratégicas
  recommendations: string[];

  // Tendências (comparação com período anterior)
  trends: {
    revenueChange: number;
    spendChange: number;
    profitChange: number;
    roiChange: number;
  };

  // Metas
  goals?: {
    monthlyTarget: number;
    currentProgress: number;
    progressPercent: number;
    daysRemaining: number;
    onTrack: boolean;
  };
}

/**
 * Gera relatório completo para um período específico
 */
export const generateReport = (
  products: Product[],
  campaigns: Campaign[],
  startDate: Date,
  endDate: Date,
  monthlyGoal?: number,
  rates: Record<string, number> = {},
  //  NOVOS ARGUMENTOS
  globalFixedCostsTotal: number = 0,
  activeProductsCount: number = 1
): ReportData => {
  // Filtrar campanhas do período
  const periodCampaigns = campaigns.filter((c) => {
    const date = new Date(c.date);
    return date >= startDate && date <= endDate;
  });

  //  CÁLCULO DE CUSTO FIXO PROPORCIONAL AO PERÍODO
  const oneDay = 24 * 60 * 60 * 1000;
  // Quantos dias tem o relatório? (mínimo 1 dia)
  const reportDays = Math.max(
    1,
    Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay)) + 1
  );

  // Soma de todos os custos específicos de todos os produtos
  const allSpecificCosts = products.reduce((acc, p) => {
    const currency =
      p.market === "US" || p.market === "OTHER"
        ? "USD"
        : p.market === "EU"
        ? "EUR"
        : p.market === "UK"
        ? "GBP"
        : "BRL";
    const rate = rates[currency] || 1;
    return acc + (p.specificCosts?.total || 0) * rate;
  }, 0);

  // Custo Fixo Mensal Total da Empresa (Global + Específicos)
  const totalMonthlyFixedCost = globalFixedCostsTotal + allSpecificCosts;

  // Custo a ser descontado neste relatório (Regra de 3: Custo Mensal / 30 * Dias do Relatório)
  const proportionalFixedCost = (totalMonthlyFixedCost / 30) * reportDays;

  //  HELPER: Identificar moeda do produto
  const getCurrency = (product: Product): string => {
    if (product.market === "US" || product.market === "OTHER") return "USD";
    if (product.market === "EU") return "EUR";
    if (product.market === "UK") return "GBP";
    return "BRL";
  };

  //  HELPER: Converter valor para BRL
  const convertToBRL = (value: number, currency: string): number => {
    const rate = rates[currency] || 1;
    return value * rate;
  };

  // Calcular métricas do período anterior (para comparação)
  const periodLength = endDate.getTime() - startDate.getTime();
  const previousStart = new Date(startDate.getTime() - periodLength);
  const previousEnd = startDate;

  const previousCampaigns = campaigns.filter((c) => {
    const date = new Date(c.date);
    return date >= previousStart && date < previousEnd;
  });

  //  MÉTRICAS CONVERTIDAS PARA BRL
  const calculateConvertedMetrics = (campaignsList: Campaign[]) => {
    let totalRevenueBRL = 0;
    let totalSpendBRL = 0;
    let totalConversions = 0;
    let totalClicks = 0;

    campaignsList.forEach((c) => {
      const product = products.find((p) => p.id === c.productId);
      if (!product) return;

      const currency = getCurrency(product);
      totalRevenueBRL += convertToBRL(c.revenue, currency);
      totalSpendBRL += convertToBRL(c.spend, currency);
      totalConversions += c.conversions;
      totalClicks += c.clicks;
    });

    const profitBRL = totalRevenueBRL - totalSpendBRL;
    const roi = totalSpendBRL > 0 ? (profitBRL / totalSpendBRL) * 100 : 0;
    const margin =
      totalRevenueBRL > 0 ? (profitBRL / totalRevenueBRL) * 100 : 0;

    const cr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpendBRL / totalClicks : 0;

    return {
      revenue: totalRevenueBRL,
      spend: totalSpendBRL,
      profit: profitBRL,
      roi,
      margin,
      conversions: totalConversions,
      clicks: totalClicks,
      cr,
      cpc,
      campaignCount: campaignsList.length,
    };
  };

  const currentMetricsRaw = calculateConvertedMetrics(periodCampaigns);
  // Aplica o desconto do custo fixo proporcional no lucro e ROI
  const currentMetrics = {
    ...currentMetricsRaw,
    profit: currentMetricsRaw.profit - proportionalFixedCost, //  O PULO DO GATO
    roi:
      currentMetricsRaw.spend + proportionalFixedCost > 0
        ? ((currentMetricsRaw.profit - proportionalFixedCost) /
            (currentMetricsRaw.spend + proportionalFixedCost)) *
          100
        : 0,
  };
  const previousMetrics = calculateConvertedMetrics(previousCampaigns);

  //  CALCULAR BREAKDOWNS
  const breakdowns = {
    byCurrency: {} as Record<
      string,
      { revenue: number; spend: number; profit: number }
    >,
    byMarket: {
      nacional: { profitBRL: 0, roiAvg: 0, productsCount: 0, totalSpendBRL: 0 },
      internacional: {
        profitBRL: 0,
        roiAvg: 0,
        productsCount: 0,
        totalSpendBRL: 0,
      },
    },
    byNiche: [] as {
      nicho: string;
      profitBRL: number;
      productsCount: number;
    }[],
  };

  // 1️⃣ Por Moeda
  periodCampaigns.forEach((c) => {
    const product = products.find((p) => p.id === c.productId);
    if (!product) return;

    const currency = getCurrency(product);
    if (!breakdowns.byCurrency[currency]) {
      breakdowns.byCurrency[currency] = { revenue: 0, spend: 0, profit: 0 };
    }

    breakdowns.byCurrency[currency].revenue += c.revenue;
    breakdowns.byCurrency[currency].spend += c.spend;
    breakdowns.byCurrency[currency].profit += c.revenue - c.spend;
  });

  // 2️⃣ Por Mercado (Nacional vs Internacional)
  const marketGroups = {
    nacional: [] as Campaign[],
    internacional: [] as Campaign[],
  };

  periodCampaigns.forEach((c) => {
    const product = products.find((p) => p.id === c.productId);
    if (!product) return;

    if (product.market === "BR") {
      marketGroups.nacional.push(c);
    } else {
      marketGroups.internacional.push(c);
    }
  });

  // Calcular métricas de cada mercado
  const calculateMarketMetrics = (campaignsList: Campaign[]) => {
    const uniqueProducts = new Set(campaignsList.map((c) => c.productId));
    let totalRevenueBRL = 0;
    let totalSpendBRL = 0;

    campaignsList.forEach((c) => {
      const product = products.find((p) => p.id === c.productId);
      if (!product) return;

      const currency = getCurrency(product);
      totalRevenueBRL += convertToBRL(c.revenue, currency);
      totalSpendBRL += convertToBRL(c.spend, currency);
    });

    const profitBRL = totalRevenueBRL - totalSpendBRL;
    const roiAvg = totalSpendBRL > 0 ? (profitBRL / totalSpendBRL) * 100 : 0;

    return {
      profitBRL,
      roiAvg,
      productsCount: uniqueProducts.size,
      totalSpendBRL,
    };
  };

  breakdowns.byMarket.nacional = calculateMarketMetrics(marketGroups.nacional);
  breakdowns.byMarket.internacional = calculateMarketMetrics(
    marketGroups.internacional
  );

  // 3️⃣ Por Nicho
  const nicheMap = new Map<
    string,
    { profitBRL: number; productsSet: Set<string> }
  >();

  periodCampaigns.forEach((c) => {
    const product = products.find((p) => p.id === c.productId);
    if (!product) return;

    const nicho = product.nicho || "Sem Nicho";
    const currency = getCurrency(product);
    const profitBRL = convertToBRL(c.revenue - c.spend, currency);

    if (!nicheMap.has(nicho)) {
      nicheMap.set(nicho, { profitBRL: 0, productsSet: new Set() });
    }

    const nicheData = nicheMap.get(nicho)!;
    nicheData.profitBRL += profitBRL;
    nicheData.productsSet.add(c.productId);
  });

  breakdowns.byNiche = Array.from(nicheMap.entries())
    .map(([nicho, data]) => ({
      nicho,
      profitBRL: data.profitBRL,
      productsCount: data.productsSet.size,
    }))
    .sort((a, b) => b.profitBRL - a.profitBRL);

  // Calcular mudanças percentuais
  const revenueChange =
    previousMetrics.revenue > 0
      ? ((currentMetrics.revenue - previousMetrics.revenue) /
          previousMetrics.revenue) *
        100
      : 0;

  const spendChange =
    previousMetrics.spend > 0
      ? ((currentMetrics.spend - previousMetrics.spend) /
          previousMetrics.spend) *
        100
      : 0;

  const profitChange =
    previousMetrics.profit !== 0
      ? ((currentMetrics.profit - previousMetrics.profit) /
          Math.abs(previousMetrics.profit)) *
        100
      : 0;

  const roiChange = currentMetrics.roi - previousMetrics.roi;

  // Performance por produto
  const productPerformance = products
    .map((p) => {
      const productCampaigns = periodCampaigns.filter(
        (c) => c.productId === p.id
      );

      if (productCampaigns.length === 0) {
        return null;
      }

      //  Calcular métricas na moeda original
      const revenue = productCampaigns.reduce((sum, c) => sum + c.revenue, 0);
      const spend = productCampaigns.reduce((sum, c) => sum + c.spend, 0);
      const conversions = productCampaigns.reduce(
        (sum, c) => sum + c.conversions,
        0
      );
      const profit = revenue - spend;
      const roi = spend > 0 ? (profit / spend) * 100 : 0;

      //  Converter para BRL
      const currency = getCurrency(p);
      const profitBRL = convertToBRL(profit, currency);

      let status: "excellent" | "good" | "warning" | "danger";
      if (roi > 100) status = "excellent";
      else if (roi > 50) status = "good";
      else if (roi > 0) status = "warning";
      else status = "danger";

      return {
        name: p.name,
        nicho: p.nicho || "Sem nicho",
        revenue,
        spend,
        profit,
        profitBRL, //  NOVO
        market: p.market || "BR", //  NOVO
        roi,
        conversions,
        status,
      };
    })
    .filter(Boolean) as ReportData["productPerformance"];

  // Top Performers
  const topByROI = [...productPerformance]
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 3)
    .map((p) => ({ name: p.name, roi: p.roi }));

  const topByRevenue = [...productPerformance]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3)
    .map((p) => ({ name: p.name, revenue: p.revenue }));

  const topByProfit = [...productPerformance]
    .sort((a, b) => b.profitBRL - a.profitBRL) //  USAR profitBRL
    .slice(0, 3)
    .map((p) => ({ name: p.name, profit: p.profitBRL })); //  RETORNAR profitBRL

  // Alertas
  const alerts = {
    critical: [] as string[],
    warnings: [] as string[],
    opportunities: [] as string[],
  };

  // Alertas críticos
  const lossProducts = productPerformance.filter((p) => p.status === "danger");
  if (lossProducts.length > 0) {
    alerts.critical.push(
      `${lossProducts.length} produto(s) em prejuízo: ${lossProducts
        .map((p) => p.name)
        .join(", ")}`
    );
  }

  if (currentMetrics.profit < 0) {
    alerts.critical.push(
      `Período fechou com prejuízo de R$ ${Math.abs(
        currentMetrics.profit
      ).toFixed(2)}`
    );
  }

  // Avisos
  if (revenueChange < -20) {
    alerts.warnings.push(
      `Receita caiu ${Math.abs(revenueChange).toFixed(
        0
      )}% em relação ao período anterior`
    );
  }

  if (spendChange > 50) {
    alerts.warnings.push(
      `Gastos aumentaram ${spendChange.toFixed(0)}% - monitorar de perto`
    );
  }

  // Oportunidades
  const excellentProducts = productPerformance.filter(
    (p) => p.status === "excellent"
  );
  if (excellentProducts.length > 0) {
    alerts.opportunities.push(
      `${excellentProducts.length} produto(s) com ROI acima de 100% - considere escalar`
    );
  }

  if (revenueChange > 20) {
    alerts.opportunities.push(
      `Receita cresceu ${revenueChange.toFixed(
        0
      )}% - momento positivo para investir mais`
    );
  }

  // Recomendações Estratégicas
  const recommendations: string[] = [];

  if (excellentProducts.length > 0) {
    recommendations.push(
      ` Escalar investimento em: ${excellentProducts
        .map((p) => p.name)
        .join(", ")}`
    );
  }

  if (lossProducts.length > 0) {
    recommendations.push(
      `️ Revisar ou pausar: ${lossProducts.map((p) => p.name).join(", ")}`
    );
  }

  if (currentMetrics.cr < 1.5 && currentMetrics.conversions > 0) {
    recommendations.push(
      ` Taxa de conversão está abaixo do ideal (${currentMetrics.cr.toFixed(
        2
      )}%). Otimizar landing pages e anúncios.`
    );
  }

  if (currentMetrics.cpc > 5) {
    recommendations.push(
      ` CPC médio está elevado (R$ ${currentMetrics.cpc.toFixed(
        2
      )}). Revisar palavras-chave e segmentação.`
    );
  }

  if (currentMetrics.roi > 50 && productPerformance.length < 5) {
    recommendations.push(
      ` ROI saudável - considere adicionar mais produtos ao portfólio para diversificar.`
    );
  }

  // Metas
  let goals: ReportData["goals"] | undefined;
  if (monthlyGoal && monthlyGoal > 0) {
    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const daysRemaining = daysInMonth - now.getDate();
    const progressPercent = (currentMetrics.profit / monthlyGoal) * 100;
    const onTrack = progressPercent >= (now.getDate() / daysInMonth) * 100;

    goals = {
      monthlyTarget: monthlyGoal,
      currentProgress: currentMetrics.profit,
      progressPercent,
      daysRemaining,
      onTrack,
    };
  }

  return {
    period: {
      startDate,
      endDate,
      label: `${startDate.toLocaleDateString(
        "pt-BR"
      )} a ${endDate.toLocaleDateString("pt-BR")}`,
    },
    generatedAt: new Date(),
    summary: {
      totalRevenue: currentMetrics.revenue,
      totalSpend: currentMetrics.spend,
      totalProfit: currentMetrics.profit,
      roi: currentMetrics.roi,
      margin: currentMetrics.margin,
      campaignsCount: periodCampaigns.length,
      productsActive: productPerformance.length,
    },
    breakdowns,
    productPerformance,
    topProducts: {
      byROI: topByROI,
      byRevenue: topByRevenue,
      byProfit: topByProfit,
    },
    alerts,
    recommendations,
    trends: {
      revenueChange,
      spendChange,
      profitChange,
      roiChange,
    },
    goals,
  };
};
// ==========================================
// 12. SIMULADOR DE ESCALA
// ==========================================

export interface ScaleScenario {
  label: string;
  budgetIncrease: number; // Percentual de aumento (ex: 50 = 50%)

  // Métricas projetadas
  newBudget: number;
  projectedClicks: number;
  projectedConversions: number;
  projectedRevenue: number;
  projectedProfit: number;
  projectedROI: number;

  // Ajustes de mercado
  estimatedCPCIncrease: number; // % de aumento esperado no CPC
  estimatedCRDecrease: number; // % de queda esperada na CR

  // Análise de risco
  riskLevel: "low" | "medium" | "high";
  warnings: string[];
  recommendations: string[];
}

export interface ScaleSimulation {
  // Cenário atual
  current: {
    budget: number;
    clicks: number;
    conversions: number;
    revenue: number;
    profit: number;
    roi: number;
    cpc: number;
    cr: number;
    auditFixedCost: number;
    auditSpecificCost: number;
  };

  // Cenários projetados
  scenarios: ScaleScenario[];

  // Recomendação geral
  bestScenario: ScaleScenario | null;
  recommendation: string;
}

// ==========================================
// 3. simulateScale (CORRIGIDO E SEGURO)
// ==========================================
export const simulateScale = (
  product: Product,
  currentBudget: number,
  currentCPC: number,
  currentCR: number,
  fixedCostsTotal: number = 0,
  activeProductsCount: number = 1,
  rates: Record<string, number> = {},
  daysInMonth: number = 30,
  viewMode: "daily" | "monthly" = "daily", // Padrão 'daily' para não quebrar outros arquivos
  historicalData?: { avgCPC: number; avgCR: number; volatility: number }
): ScaleSimulation => {
  // 1. Identificar Moeda e Taxa
  const currency =
    product.market === "US" || product.market === "OTHER"
      ? "USD"
      : product.market === "EU"
      ? "EUR"
      : product.market === "UK"
      ? "GBP"
      : "BRL";

  const rate = rates[currency] || 1;

  // 2. Converter valores para Reais (BRL)
  const commissionLiquidBRL = (product.commissionLiquid || 0) * rate;
  const specificCostBRL = (product.specificCosts?.total || 0) * rate;

  // 3. Preparar Custos Fixos (Rateio + Específico)
  const globalShareBRL =
    activeProductsCount > 0 ? Number(fixedCostsTotal) / activeProductsCount : 0;
  const totalMonthlyFixedBRL = globalShareBRL + specificCostBRL;

  // 4. Aplicar Visão (Diário vs Mensal)
  const appliedFixedCost =
    viewMode === "daily"
      ? totalMonthlyFixedBRL / daysInMonth
      : totalMonthlyFixedBRL;

  const appliedBudget =
    viewMode === "daily" ? currentBudget : currentBudget * daysInMonth;

  const auditSpecificCost =
    viewMode === "daily" ? specificCostBRL / daysInMonth : specificCostBRL;

  // 5. Calcular Cenário Atual
  const currentClicks = currentCPC > 0 ? appliedBudget / currentCPC : 0;
  const currentConversions = currentClicks * (currentCR / 100);
  const currentRevenue = currentConversions * commissionLiquidBRL;

  // Lucro Real = Receita(BRL) - Ads(BRL) - Custos(BRL)
  const currentProfit = currentRevenue - appliedBudget - appliedFixedCost;
  const totalCurrentInvested = appliedBudget + appliedFixedCost;
  const currentROI =
    totalCurrentInvested > 0 ? (currentProfit / totalCurrentInvested) * 100 : 0;

  // 6. Cenários de Escala
  const scalePercentages = [20, 50, 100, 150, 200];
  const scenarios: ScaleScenario[] = scalePercentages.map((increasePercent) => {
    const newBudget = appliedBudget * (1 + increasePercent / 100);

    // Degradação
    let estimatedCPCIncrease =
      increasePercent >= 200 ? 25 : increasePercent >= 100 ? 15 : 5;
    let estimatedCRDecrease =
      increasePercent >= 200 ? 20 : increasePercent >= 100 ? 10 : 2;

    const adjustedCPC = currentCPC * (1 + estimatedCPCIncrease / 100);
    const adjustedCR = currentCR * (1 - estimatedCRDecrease / 100);

    const projectedClicks = adjustedCPC > 0 ? newBudget / adjustedCPC : 0;
    const projectedConversions = projectedClicks * (adjustedCR / 100);
    const salesFloor = Math.floor(projectedConversions);
    const projectedRevenue = salesFloor * commissionLiquidBRL;
    const projectedProfit = projectedRevenue - newBudget - appliedFixedCost;
    const totalProjectedInvested = newBudget + appliedFixedCost;
    const projectedROI =
      totalProjectedInvested > 0
        ? (projectedProfit / totalProjectedInvested) * 100
        : 0;

    let riskLevel: "low" | "medium" | "high" = "low";
    if (projectedROI < 0) riskLevel = "high";
    else if (increasePercent > 100) riskLevel = "medium";

    return {
      label: `+${increasePercent}%`,
      budgetIncrease: increasePercent,
      newBudget,
      projectedClicks,
      projectedConversions,
      projectedRevenue,
      projectedProfit,
      projectedROI,
      estimatedCPCIncrease,
      estimatedCRDecrease,
      riskLevel,
      warnings: [],
      recommendations: [],
    };
  });

  const bestScenario =
    scenarios.find(
      (s) => s.projectedProfit > currentProfit && s.riskLevel !== "high"
    ) || null;

  return {
    current: {
      budget: appliedBudget,
      clicks: currentClicks,
      conversions: currentConversions,
      revenue: currentRevenue,
      profit: currentProfit,
      roi: currentROI,
      cpc: currentCPC,
      cr: currentCR,
      auditFixedCost: appliedFixedCost,
      auditSpecificCost: auditSpecificCost,
    },
    scenarios,
    bestScenario,
    recommendation: bestScenario
      ? "Escala recomendada"
      : "Mantenha o budget atual",
  };
};

// ========================================
//  TIPOS FLEXÍVEIS (string para customização)
// ========================================

// Market agora aceita string customizada (ex: "Japão", "África do Sul")
export type Market = "BR" | "US" | "UK" | "EU" | "OTHER" | string;

// Platform agora aceita string customizada (ex: "Rede Local XYZ")
export type Platform =
  // Brasileiras
  | "Hotmart"
  | "Monetizze"
  | "Eduzz"
  | "Braip"
  | "Ticto"
  | "Kiwify"
  // Internacionais
  | "Clickbank"
  | "BuyGoods"
  | "Digistore24"
  | "MaxWeb"
  | "JVZoo"
  | "WarriorPlus"
  | "PayKickstart"
  | "Outra"
  | string; //  Permite digitação livre

//  NOVO: Currency independente do Market
export type Currency = "BRL" | "USD" | "EUR" | "GBP";

export type ProductType =
  | "fisico"
  | "digital"
  | "curso"
  | "mentoria"
  | "software";
export type QualityLP = "excelente" | "boa" | "media" | "fraca";
export type Temperature = "quente" | "morno" | "frio";
export type FunnelStage = "topo" | "meio" | "fundo";
export type CampaignStatus = "aprendizado" | "qualificada";
export type OfferType = "standard" | "bump" | "upsell";

// ========================================
//  FUNÇÕES AUXILIARES
// ========================================

/**
 * Retorna lista de mercados sugeridos (mas aceita qualquer string)
 */
export const getMarketSuggestions = (): { value: string; label: string }[] => {
  return [
    { value: "BR", label: " Brasil" },
    { value: "US", label: " Estados Unidos" },
    { value: "EU", label: " Europa" },
    { value: "UK", label: " Reino Unido" },
    { value: "CA", label: " Canadá" },
    { value: "AU", label: " Austrália" },
    { value: "MX", label: " México" },
    { value: "AR", label: " Argentina" },
    { value: "ZA", label: " África do Sul" },
    { value: "JP", label: " Japão" },
    { value: "OTHER", label: " Outro (digite)" },
  ];
};

/**
 * Retorna lista de moedas disponíveis
 */
export const getCurrencies = (): {
  value: Currency;
  label: string;
  symbol: string;
}[] => {
  return [
    { value: "BRL", label: "Real Brasileiro", symbol: "R$" },
    { value: "USD", label: "Dólar Americano", symbol: "$" },
    { value: "EUR", label: "Euro", symbol: "€" },
    { value: "GBP", label: "Libra Esterlina", symbol: "£" },
  ];
};

/**
 * Retorna símbolo da moeda
 */
export const getCurrencySymbol = (currency?: Currency): string => {
  const symbols: Record<Currency, string> = {
    BRL: "R$",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency || "BRL"] || "R$";
};

/**
 * Filtra plataformas por mercado (sugestões inteligentes)
 */
export const getPlatformsByMarket = (market?: string): string[] => {
  const marketUpper = market?.toUpperCase() || "";

  // Plataformas Brasileiras
  const brazilianPlatforms = [
    "Hotmart",
    "Monetizze",
    "Eduzz",
    "Braip",
    "Ticto",
    "Kiwify",
  ];

  // Plataformas Internacionais
  const internationalPlatforms = [
    "Clickbank",
    "BuyGoods",
    "Digistore24",
    "MaxWeb",
    "JVZoo",
    "WarriorPlus",
    "PayKickstart",
  ];

  if (marketUpper === "BR" || marketUpper === "BRASIL") {
    return [...brazilianPlatforms, "Outra"];
  }

  return [...internationalPlatforms, "Outra"];
};

/**
 * Nome amigável de plataforma (com bandeiras)
 */
export const getPlatformDisplayName = (platform: string): string => {
  const names: Record<string, string> = {
    Hotmart: " Hotmart",
    Monetizze: " Monetizze",
    Eduzz: " Eduzz",
    Braip: " Braip",
    Ticto: " Ticto",
    Kiwify: " Kiwify",
    Clickbank: " Clickbank",
    BuyGoods: " BuyGoods",
    Digistore24: " Digistore24",
    MaxWeb: " MaxWeb",
    JVZoo: " JVZoo",
    WarriorPlus: " Warrior Plus",
    PayKickstart: " PayKickstart",
    Outra: " Outra",
  };

  return names[platform] || platform; // Retorna o nome digitado se não estiver na lista
};

// ========================================
//  INTERFACES (COM CURRENCY)
// ========================================

export interface CostItem {
  id: string;
  name: string;
  value: number;
}

export interface OperationalCosts {
  items: CostItem[];
  total: number;
}

export interface Offer {
  id: string;
  name: string;
  price: number;
  commissionPct: number;
  type: OfferType;
}

export interface Scenario {
  offerName: string;
  commission: number;
  commissionBRL: number;
  clicksNeeded: number;
  maxCpcBreakEven: number;
  status: "LUCRO" | "PREJUÍZO" | "RISCO";
}

export interface ViabilityResult {
  score: number;
  status: "APROVADO" | "REPROVADO" | "RISCO";
  reason: string;
  log: string[];
  notes: string;
  scenarios: Scenario[];
}

// ========================================
//  PRODUCT - COM CURRENCY INDEPENDENTE
// ========================================

export interface Product {
  id: string;
  name: string;
  price: number;
  commissionPct: number;
  nicho: string;
  type: ProductType;
  platformFeePct?: number;
  platformFeeValue?: number;
  platformFeeType?: "percentage" | "fixed";

  //  NOVOS: Market (país) e Currency (moeda) são independentes
  market: string; // Ex: "África do Sul", "Japão", "US"
  currency: Currency; // Ex: "USD", "EUR", "BRL"

  qualityLP: QualityLP;
  funnelStage?: FunnelStage;
  searchVolume?: number;
  advertiserCount?: number;
  temperature?: Temperature;
  platform?: string; //  Agora aceita qualquer string
  analysisDate?: string;
  manualBenchmarkCPC?: number;

  offers?: Offer[];
  selectedOfferId?: string;

  // Calculated metrics
  crEstimated?: number;
  cpcSuggested: number;
  commissionValue: number;
  commissionLiquid: number;
  commissionLiquidBRL?: number;
  commissionGross?: number;

  clicksPurchasable: number;
  requiredCR: number;

  cpcBom: number;
  cpcInter: number;
  cpcApert: number;
  cpcRuim: number;

  // Analysis results
  viabilityScore?: number;
  viabilityStatus?: "APROVADO" | "REPROVADO" | "RISCO";
  viabilityReason?: string | null;
  viabilityDetails?: any;
  calculationLog?: string[];
  scenarios?: Scenario[];

  // Setup Data
  keywords?: Keyword[];
  negatives?: string[];
  negativeKeywords?: string;
  ads?: Ad[];

  // Costs
  specificCosts?: OperationalCosts;

  breakEven?: BreakEvenData;
}

export interface Keyword {
  term: string;
  type: "exata" | "frase" | "ampla";
  cpc: number;
  intent: "alta" | "media" | "baixa";
}

export interface Ad {
  title: string;
  description: string;
}

export interface BreakEvenData {
  salesNeeded: number;
  clicksNeeded: number;
  investmentAds: number;
  investmentTotal: number;
  revenueAtBreakEven: number;
  profit: number;
  isBalanced: boolean;
  explanation?: string;
  marginPerSale?: number;
}

export interface FinancialMetrics {
  custoFixoTotal: number;
  comissao: number;
  cpc: number;
  crMinimaParaBreakEven: number;
  cpaMaximo: number;
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

export interface Campaign {
  id: number;
  date: string;
  campaignId?: string;
  productId: string;
  productName: string;
  nicho: string;
  spend: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cpc: number;
  cr: number;
  roas: number;
  roi: number;
  profit: number;

  //  MULTI-MOEDA (Ajustado conforme solicitado)
  originalCurrency?: Market; // Ex: 'US', 'EU' (Define o mercado de origem)
  exchangeRate?: number; // Taxa usada na conversão
  originalRevenue?: number; // Receita bruta na moeda original
  originalSpend?: number; // (Opcional que você já tinha, pode manter)

  conversionBreakdown?: {
    offerId: string;
    offerName: string;
    quantity: number;
    commission: number;
    revenue: number;
  }[];
}

export interface AISuggestion {
  priority: "CRÍTICA" | "ALTÍSSIMA" | "ALTA" | "MÉDIA" | "BAIXA";
  area: string;
  action: string;
  details: string;
  resultado: string;
}

export interface AIAnalysisResponse {
  diagnostico: string;
  sugestoes: AISuggestion[];
}

export interface AlertConfig {
  cpcMax: number;
  roasMin: number;
  roiMin: number;
  crMin: number;
  ctrMin: number;
}

export interface VerdictResult {
  title: string;
  emoji: string;
  action: string;
  ratioPct: number;
  colorClass: string;
  barColorClass: string;
  textColorClass: string;
}

export type ActivityStatus = "active" | "idle" | "dormant" | "never";

export interface PortfolioProps {
  products: Product[];
  history: Campaign[];
  onDeleteProduct: (id: string) => void;
  onSelectProductForAnalysis: (product: Product, tab?: string) => void;
  fixedCostsTotal: number;
  editingProduct?: Product | null;
  setEditingProduct?: (p: Product | null) => void;
  onChangeTab?: (tab: string) => void;
}

export interface EnrichedProduct extends Product {
  campaignCount: number;
  spend: number;
  revenue: number;
  conversions: number;
  clicks: number;
  profit: number;
  roi: number;
  roas: number;
  cr: number;
  cpc: number;
  avgTicket: number;
  status: "excellent" | "good" | "warning" | "danger";
  healthScore: number;
  fixedCosts: number;
  activityStatus: ActivityStatus;
  lastCampaignDate: string | null;
  sparklineData: number[];
}

export interface OptimizationResult {
  allocation: AllocationItem[];
  remainingBudget: number;
  totalBudget?: number;
  totalProfit?: number;
  totalExpectedProfit?: number;
  totalExpectedRevenue?: number;
  efficiency: number;
  message: string;
}

export interface AllocationItem {
  productId: string;
  productName: string;
  allocatedBudget: number;
  amount?: number;
  expectedProfit: number;
  expectedRevenue?: number;
  expectedROI?: number;
  recommendation?: "AUMENTAR" | "REDUZIR" | "MANTER" | "NOVO";
  previousBudget?: number;
  changePercent?: number;
  confidence?: string;
  campaignCount?: number;
  currentROI?: number;
}

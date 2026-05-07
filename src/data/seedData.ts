import type { Product, Campaign } from '../types';

// ─── Produtos de demonstração ───────────────────────────────────────────────
export const SEED_PRODUCTS: Product[] = [
  {
    id: 'seed_prod_1',
    name: 'Curso Tráfego Pago Pro',
    price: 497,
    commissionPct: 50,
    nicho: 'Marketing Digital',
    type: 'curso',
    market: 'BR',
    currency: 'BRL',
    platform: 'Hotmart',
    qualityLP: 'excelente',
    funnelStage: 'fundo',
    temperature: 'quente',
    platformFeePct: 9.9,
    platformFeeType: 'percentage',
    cpcSuggested: 1.80,
    commissionValue: 248.5,
    commissionLiquid: 223.84,
    commissionLiquidBRL: 223.84,
    clicksPurchasable: 124,
    requiredCR: 0.80,
    cpcBom: 2.00,
    cpcInter: 1.50,
    cpcApert: 1.00,
    cpcRuim: 0.70,
    viabilityScore: 82,
    viabilityStatus: 'APROVADO',
    viabilityReason: 'Produto com alta comissão e boa LP',
  },
  {
    id: 'seed_prod_2',
    name: 'Ebook Finanças Pessoais',
    price: 97,
    commissionPct: 60,
    nicho: 'Finanças',
    type: 'digital',
    market: 'BR',
    currency: 'BRL',
    platform: 'Kiwify',
    qualityLP: 'boa',
    funnelStage: 'topo',
    temperature: 'frio',
    platformFeePct: 7.9,
    platformFeeType: 'percentage',
    cpcSuggested: 0.65,
    commissionValue: 58.2,
    commissionLiquid: 53.60,
    commissionLiquidBRL: 53.60,
    clicksPurchasable: 82,
    requiredCR: 1.20,
    cpcBom: 0.80,
    cpcInter: 0.60,
    cpcApert: 0.40,
    cpcRuim: 0.25,
    viabilityScore: 68,
    viabilityStatus: 'APROVADO',
    viabilityReason: 'Produto acessível, alto volume de conversão',
  },
  {
    id: 'seed_prod_3',
    name: 'Mentoria Afiliados Pro',
    price: 1997,
    commissionPct: 40,
    nicho: 'Afiliados',
    type: 'mentoria',
    market: 'BR',
    currency: 'BRL',
    platform: 'Monetizze',
    qualityLP: 'boa',
    funnelStage: 'fundo',
    temperature: 'quente',
    platformFeePct: 9.9,
    platformFeeType: 'percentage',
    cpcSuggested: 3.50,
    commissionValue: 798.8,
    commissionLiquid: 719.57,
    commissionLiquidBRL: 719.57,
    clicksPurchasable: 205,
    requiredCR: 0.49,
    cpcBom: 4.00,
    cpcInter: 3.00,
    cpcApert: 2.00,
    cpcRuim: 1.20,
    viabilityScore: 75,
    viabilityStatus: 'APROVADO',
    viabilityReason: 'Alta comissão por venda, CPA sustentável',
  },
];

// ─── Utilitário para gerar campanhas realistas ───────────────────────────────
function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function makeCampaign(
  id: number,
  product: Product,
  daysAgo: number,
  qualityFactor = 1,
): Campaign {
  const cpc = parseFloat((product.cpcSuggested * randBetween(0.75, 1.25) * qualityFactor).toFixed(2));
  const clicks = Math.round(randBetween(80, 350));
  const spend = parseFloat((cpc * clicks).toFixed(2));
  const cr = parseFloat((product.requiredCR * randBetween(0.7, 1.4) * qualityFactor).toFixed(4));
  const conversions = Math.round(clicks * (cr / 100));
  const revenue = parseFloat((conversions * (product.commissionLiquid ?? product.commissionValue)).toFixed(2));
  const profit = parseFloat((revenue - spend).toFixed(2));
  const roi = spend > 0 ? parseFloat(((profit / spend) * 100).toFixed(1)) : 0;
  const roas = spend > 0 ? parseFloat((revenue / spend).toFixed(2)) : 0;

  return {
    id,
    date: dateStr(daysAgo),
    productId: product.id,
    productName: product.name,
    nicho: product.nicho,
    spend,
    clicks,
    conversions,
    revenue,
    cpc,
    cr: parseFloat((cr).toFixed(2)),
    roas,
    roi,
    profit,
  };
}

// ─── Gera campanhas para os últimos 30 dias ───────────────────────────────────
export function generateSeedCampaigns(): Campaign[] {
  const campaigns: Campaign[] = [];
  let id = 9000;

  const products = SEED_PRODUCTS;

  // Produto 1 — 12 campanhas espaçadas nos últimos 30 dias (bom desempenho)
  [1,3,5,7,9,11,14,16,18,21,24,28].forEach((daysAgo) => {
    campaigns.push(makeCampaign(id++, products[0], daysAgo, 1.10));
  });

  // Produto 2 — 10 campanhas (volume alto, ticket baixo)
  [2,4,6,8,10,13,15,19,22,26].forEach((daysAgo) => {
    campaigns.push(makeCampaign(id++, products[1], daysAgo, 0.95));
  });

  // Produto 3 — 7 campanhas (alta comissão, menos frequente)
  [3,7,12,17,20,25,29].forEach((daysAgo) => {
    campaigns.push(makeCampaign(id++, products[2], daysAgo, 1.05));
  });

  return campaigns;
}

export const SEED_CAMPAIGNS = generateSeedCampaigns();

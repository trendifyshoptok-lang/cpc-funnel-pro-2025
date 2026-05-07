import type { Product, Campaign, EnrichedProduct, ActivityStatus } from '../../types';
import { optimizePortfolio, optimizePortfolioSimplex } from '../../services/logic';

/* ─────────────────────────────────────────────
   Activity Status
───────────────────────────────────────────── */
export function getActivityStatus(
  productId: string,
  history: Campaign[]
): { status: ActivityStatus; lastDate: string | null } {
  const campaigns = history.filter(c => c.productId === productId);
  if (campaigns.length === 0) return { status: 'never', lastDate: null };

  const sorted = [...campaigns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastDate = sorted[0].date;
  const daysDiff = Math.floor(
    (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  let status: ActivityStatus;
  if (daysDiff <= 7) status = 'active';
  else if (daysDiff <= 30) status = 'idle';
  else status = 'dormant';

  return { status, lastDate };
}

/* ─────────────────────────────────────────────
   Sparkline — 14-day rolling profit per day
───────────────────────────────────────────── */
export function buildSparklineData(productId: string, history: Campaign[]): number[] {
  const now = new Date();
  const days: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().slice(0, 10);
    const total = history
      .filter(c => c.productId === productId && c.date?.startsWith(dayStr))
      .reduce((acc, c) => acc + (c.profit ?? 0), 0);
    days.push(total);
  }
  return days;
}

/* ─────────────────────────────────────────────
   Health Score 2.0 (0–100)
───────────────────────────────────────────── */
export function computeHealthScore(
  product: Product,
  metrics: {
    roi: number;
    cr: number;
    cpc: number;
    roas: number;
    campaignCount: number;
    activityStatus: ActivityStatus;
  }
): number {
  let score = 0;

  // ROI (30 pts)
  if (metrics.roi > 100) score += 30;
  else if (metrics.roi > 50) score += 20;
  else if (metrics.roi > 0) score += 10;

  // CR vs benchmark (20 pts)
  if (metrics.cr > 2) score += 20;
  else if (metrics.cr > 1) score += 10;

  // CPC vs Bom zone (15 pts)
  const cpcBom = product.cpcBom ?? 0;
  const cpcInter = product.cpcInter ?? 0;
  const cpcApert = product.cpcApert ?? 0;
  if (metrics.cpc > 0 && cpcBom > 0) {
    if (metrics.cpc <= cpcBom) score += 15;
    else if (metrics.cpc <= cpcInter) score += 10;
    else if (metrics.cpc <= cpcApert) score += 5;
  }

  // Consistência (15 pts)
  if (metrics.campaignCount >= 5) score += 15;
  else if (metrics.campaignCount >= 2) score += 8;

  // Atividade (10 pts)
  if (metrics.activityStatus === 'active') score += 10;
  else if (metrics.activityStatus === 'idle') score += 6;
  else if (metrics.activityStatus === 'dormant') score += 2;

  // ROAS (10 pts)
  if (metrics.roas >= 3) score += 10;
  else if (metrics.roas >= 2) score += 6;
  else if (metrics.roas >= 1) score += 3;

  return Math.max(0, Math.min(100, score));
}

/* ─────────────────────────────────────────────
   Enrich Products
───────────────────────────────────────────── */
export function enrichProducts(
  products: Product[],
  history: Campaign[]
): EnrichedProduct[] {
  return products.map(p => {
    const prodHistory = history.filter(h => h.productId === p.id);
    const spend = prodHistory.reduce((acc, h) => acc + h.spend, 0);
    const revenue = prodHistory.reduce((acc, h) => acc + h.revenue, 0);
    const conversions = prodHistory.reduce((acc, h) => acc + h.conversions, 0);
    const clicks = prodHistory.reduce((acc, h) => acc + h.clicks, 0);

    const fixedCosts = (p as any).costs?.total ?? 0;
    const profit = revenue - spend - fixedCosts;
    const totalInvestment = spend + fixedCosts;

    const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
    const roas = spend > 0 ? revenue / spend : 0;
    const cr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const avgTicket = conversions > 0 ? revenue / conversions : 0;

    const { status: activityStatus, lastDate: lastCampaignDate } =
      getActivityStatus(p.id, history);
    const sparklineData = buildSparklineData(p.id, history);

    const healthScore = computeHealthScore(p, {
      roi, cr, cpc, roas, campaignCount: prodHistory.length, activityStatus,
    });

    let status: EnrichedProduct['status'] = 'good';
    if (roi > 100) status = 'excellent';
    else if (roi > 50) status = 'good';
    else if (roi > 0) status = 'warning';
    else status = 'danger';

    return {
      ...p,
      campaignCount: prodHistory.length,
      spend,
      revenue,
      profit,
      roi,
      roas,
      conversions,
      clicks,
      cr,
      cpc,
      avgTicket,
      status,
      healthScore,
      fixedCosts,
      activityStatus,
      lastCampaignDate,
      sparklineData,
    } as EnrichedProduct;
  });
}

/* ─────────────────────────────────────────────
   Pareto Analysis
───────────────────────────────────────────── */
export function computePareto(products: EnrichedProduct[]): {
  topCount: number;
  topPct: number;
  profitPct: number;
} {
  const profitable = products.filter(p => p.profit > 0)
    .sort((a, b) => b.profit - a.profit);

  if (profitable.length === 0) return { topCount: 0, topPct: 0, profitPct: 0 };

  const total = profitable.reduce((acc, p) => acc + p.profit, 0);
  const twentyPct = Math.max(1, Math.ceil(profitable.length * 0.2));
  const topProfit = profitable.slice(0, twentyPct).reduce((acc, p) => acc + p.profit, 0);

  return {
    topCount: twentyPct,
    topPct: Math.round((twentyPct / profitable.length) * 100),
    profitPct: total > 0 ? Math.round((topProfit / total) * 100) : 0,
  };
}

/* ─────────────────────────────────────────────
   Export CSV
───────────────────────────────────────────── */
export function exportToCSV(products: EnrichedProduct[]): void {
  const headers = [
    'Nome', 'Nicho', 'Mercado', 'Tipo', 'Status', 'Atividade',
    'Lucro (R$)', 'ROI (%)', 'ROAS', 'CR (%)', 'CPC (R$)',
    'Vendas', 'Cliques', 'Campanhas', 'Ultima Campanha',
  ];
  const rows = products.map(p => [
    `"${p.name}"`,
    `"${p.nicho}"`,
    p.market,
    p.type,
    p.status,
    p.activityStatus,
    p.profit.toFixed(2),
    p.roi.toFixed(1),
    p.roas.toFixed(2),
    p.cr.toFixed(2),
    p.cpc.toFixed(2),
    p.conversions,
    p.clicks,
    p.campaignCount,
    p.lastCampaignDate ?? 'nunca',
  ]);

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portfolio_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────
   Formatters
───────────────────────────────────────────── */
export const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const fmtPct = (v: number) => `${v.toFixed(1)}%`;

export { optimizePortfolio, optimizePortfolioSimplex };

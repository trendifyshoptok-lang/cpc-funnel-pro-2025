import { useMemo } from 'react';
import type { Product, AlertConfig } from '../../types';
import { computeHealthScore } from './helpers';

export interface RealData {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export interface Metrics {
  cpc: number;
  ctr: number;
  cr: number;
  roas: number;
  roi: number;
  cpa: number;
}

// ── Core metrics (derived from raw data) ─────────────────────────────────────
export function useMetrics(realData: RealData, revenue: number): Metrics {
  return useMemo(() => {
    const cpc = realData.clicks > 0 ? realData.spend / realData.clicks : 0;
    const ctr = realData.impressions > 0 ? (realData.clicks / realData.impressions) * 100 : 0;
    const cr = realData.clicks > 0 ? (realData.conversions / realData.clicks) * 100 : 0;
    const roas = realData.spend > 0 ? revenue / realData.spend : 0;
    const roi = realData.spend > 0 ? ((revenue - realData.spend) / realData.spend) * 100 : 0;
    const cpa = realData.conversions > 0 ? realData.spend / realData.conversions : 0;
    return { cpc, ctr, cr, roas, roi, cpa };
  }, [realData, revenue]);
}

// ── Funnel proportions for horizontal funnel ──────────────────────────────────
export function useFunnelData(
  metrics: Pick<Metrics, 'ctr' | 'cr'>,
  realData: RealData,
  requiredCR: number,
) {
  return useMemo(() => {
    const { ctr, cr } = metrics;
    // Widths as percentage of NEXT stage
    const ctrPct = Math.max(5, Math.min(100, (ctr / 10) * 100));
    const crPct = Math.max(5, Math.min(100, (cr / (requiredCR || 1)) * 100));
    const ctrBottleneck = ctr < 2;
    const crBottleneck = cr < (requiredCR || 1) * 0.5;
    const lostClicks = Math.max(0, realData.impressions - realData.clicks);
    const lostConversions = Math.max(0, realData.clicks - realData.conversions);
    const ctrLossPct = realData.impressions > 0 ? (lostClicks / realData.impressions) * 100 : 0;
    const crLossPct = realData.clicks > 0 ? (lostConversions / realData.clicks) * 100 : 0;
    return { ctrPct, crPct, ctrBottleneck, crBottleneck, lostClicks, lostConversions, ctrLossPct, crLossPct };
  }, [metrics, realData, requiredCR]);
}

// ── CPC Gauge ─────────────────────────────────────────────────────────────────
export function useGauge(
  cpc: number,
  product: Pick<Product, 'cpcBom' | 'cpcInter' | 'cpcApert'>,
) {
  return useMemo(() => {
    // Sort thresholds ascending to handle inverted product data
    const [sortedBom, sortedInter, sortedApert] = [product.cpcBom, product.cpcInter, product.cpcApert]
      .filter(v => v > 0)
      .sort((a, b) => a - b)
      .concat([0, 0, 0]);

    const max = Math.max(sortedApert * 1.6, 1);
    const pos = Math.min((cpc / max) * 100, 100);
    const status: 'excellent' | 'good' | 'warning' | 'danger' =
      cpc <= sortedBom ? 'excellent'
      : cpc <= sortedInter ? 'good'
      : cpc <= sortedApert ? 'warning'
      : 'danger';
    return { max, pos, status };
  }, [cpc, product]);
}

// ── Alerts list ───────────────────────────────────────────────────────────────
export interface Alert {
  text: string;
  level: 'critical' | 'warning' | 'info';
}

export function useAlerts(
  metrics: Pick<Metrics, 'cpc' | 'ctr' | 'cr' | 'roas' | 'roi'>,
  realData: RealData,
  alertConfig: AlertConfig,
): Alert[] {
  return useMemo(() => {
    const list: Alert[] = [];
    if (metrics.cpc > alertConfig.cpcMax && realData.clicks > 0) {
      const profitableHighCpc = metrics.roas >= 2 && metrics.roi > 0;
      list.push({
        text: profitableHighCpc
          ? `CPC R$${metrics.cpc.toFixed(2)} alto — ROAS ${metrics.roas.toFixed(1)}x garante lucro. Otimize lances sem pausar`
          : `CPC R$${metrics.cpc.toFixed(2)} acima do limite R$${alertConfig.cpcMax.toFixed(2)} com ROI comprometido`,
        level: profitableHighCpc ? 'warning' : 'critical',
      });
    }
    if (realData.spend > 0 && metrics.roas < alertConfig.roasMin && metrics.roas > 0)
      list.push({ text: `ROAS ${metrics.roas.toFixed(2)}x abaixo da meta ${alertConfig.roasMin}x`, level: 'warning' });
    if (realData.spend > 0 && metrics.roi < 0)
      list.push({ text: `ROI negativo: prejuizo de ${Math.abs(metrics.roi).toFixed(1)}%`, level: 'critical' });
    if (realData.clicks > 20 && metrics.cr < alertConfig.crMin)
      list.push({ text: `CR ${metrics.cr.toFixed(2)}% abaixo da meta ${alertConfig.crMin.toFixed(2)}%`, level: 'warning' });
    if (realData.impressions > 100 && metrics.ctr < alertConfig.ctrMin)
      list.push({ text: `CTR ${metrics.ctr.toFixed(2)}% muito baixo (min ${alertConfig.ctrMin}%)`, level: 'info' });
    return list;
  }, [metrics, realData, alertConfig]);
}

// ── Health Score 0-100 ────────────────────────────────────────────────────────
export function useHealthScore(
  metrics: Pick<Metrics, 'cpc' | 'ctr' | 'cr' | 'roas' | 'roi'>,
  realData: RealData,
  alertConfig: AlertConfig,
  product: Product,
): number {
  return useMemo(
    () => computeHealthScore({ ...metrics, spend: realData.spend, conversions: realData.conversions, product, alertConfig }),
    [metrics, realData, alertConfig, product],
  );
}

import React, { useState, useMemo } from 'react';
import { BadgePercent, TrendingUp, Target } from 'lucide-react';
import type { Product, Campaign, CampaignStatus, AlertConfig, AIAnalysisResponse, VerdictResult } from '../../types';
import { analyzeCampaignVerdict } from '../../services/logic';

import { useMetrics, useFunnelData, useGauge, useAlerts, useHealthScore, type RealData } from './hooks';
import { generateAutoSuggestions } from './helpers';
import { CampaignInputs } from './parts/CampaignInputs';
import { VerdictCard } from './parts/VerdictCard';
import { FunnelHorizontal } from './parts/FunnelHorizontal';
import { CPCGauge } from './parts/CPCGauge';
import { AIModal } from './parts/AIModal';

// ── Props (same interface as old Analysis.tsx) ────────────────────────────────
interface AnalysisProps {
  product: Product;
  products: Product[];
  history: Campaign[];
  onAddToHistory: (campaign: Campaign) => void;
  fixedCostsTotal?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const Analysis: React.FC<AnalysisProps> = ({
  product,
  history,
  onAddToHistory,
  fixedCostsTotal = 0,
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [realData, setRealData] = useState<RealData>({
    impressions: 1000,
    clicks: 0,
    spend: 0,
    conversions: 0,
  });

  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>('aprendizado');

  const [alertConfig] = useState<AlertConfig>({
    cpcMax: product.cpcApert,
    roasMin: 1.5,
    roiMin: 10,
    crMin: product.requiredCR || 1.0,
    ctrMin: 1.0,
  });

  const [aiReport, setAiReport] = useState<AIAnalysisResponse | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  const revenue = useMemo(
    () => realData.conversions * product.commissionLiquid,
    [realData.conversions, product.commissionLiquid],
  );

  const metrics = useMetrics(realData, revenue);
  const funnelData = useFunnelData(metrics, realData, product.requiredCR || 1);
  const gaugeData = useGauge(metrics.cpc, product);
  const alerts = useAlerts(metrics, realData, alertConfig);
  const healthScore = useHealthScore(metrics, realData, alertConfig, product);

  const verdict: VerdictResult = useMemo(
    () => analyzeCampaignVerdict(realData.spend, realData.conversions, product.commissionLiquid, campaignStatus),
    [realData.spend, realData.conversions, product.commissionLiquid, campaignStatus],
  );

  const suggestions = useMemo(
    () => generateAutoSuggestions(metrics, product, alertConfig),
    [metrics, product, alertConfig],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (realData.spend === 0) {
      alert('Adicione dados de gasto antes de salvar!');
      return;
    }
    const campaign: Campaign = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      productId: product.id,
      productName: product.name,
      nicho: product.nicho,
      spend: realData.spend,
      clicks: realData.clicks,
      conversions: realData.conversions,
      revenue,
      cpc: metrics.cpc,
      cr: metrics.cr,
      roas: metrics.roas,
      roi: metrics.roi,
      profit: revenue - realData.spend,
    };
    onAddToHistory(campaign);
    alert('Campanha salva!');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <>
      <div className="space-y-5 pb-32">

        {/* ── Product context header — Dark Navy ── */}
        <div
          className="relative rounded-2xl overflow-hidden border border-slate-700/40 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #0E2233 50%, #0A1628 100%)' }}
        >
          {/* Dot matrix overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(34,211,238,0.06) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            {/* Left: name + tags */}
            <div className="min-w-0 flex-1">
              <p className="text-2xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(34,211,238,0.70)' }}>
                Analise de Campanha
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-white truncate leading-tight">{product.name}</span>
                {product.nicho && (
                  <span
                    className="text-2xs font-bold px-2 py-0.5 rounded-md"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    {product.nicho}
                  </span>
                )}
                {product.type && (
                  <span
                    className="text-2xs font-bold px-2 py-0.5 rounded-md"
                    style={{ background: 'rgba(34,211,238,0.10)', color: 'rgba(34,211,238,0.75)', border: '1px solid rgba(34,211,238,0.20)' }}
                  >
                    {product.type}
                  </span>
                )}
                {product.funnelStage && (
                  <span
                    className="text-2xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide"
                    style={{ background: 'rgba(139,92,246,0.12)', color: 'rgba(167,139,250,0.85)', border: '1px solid rgba(139,92,246,0.22)' }}
                  >
                    {product.funnelStage} de Funil
                  </span>
                )}
              </div>
            </div>

            {/* Right: 3 KPI chips */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {[
                { icon: <BadgePercent size={11} />, label: 'Comissao', value: fmt(product.commissionLiquid), accent: '#22D3EE', bg: 'rgba(34,211,238,0.10)', border: 'rgba(34,211,238,0.22)' },
                { icon: <TrendingUp size={11} />,   label: 'CPC Bom',  value: fmt(product.cpcBom),              accent: '#60A5FA', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.22)'  },
                { icon: <Target size={11} />,        label: 'Meta CR',  value: `${product.requiredCR.toFixed(2)}%`, accent: '#A78BFA', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.22)' },
              ].map(k => (
                <div
                  key={k.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: k.bg, border: `1px solid ${k.border}` }}
                >
                  <span style={{ color: k.accent }}>{k.icon}</span>
                  <div>
                    <div className="text-2xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.40)' }}>{k.label}</div>
                    <div className="text-sm font-black tabular-nums leading-none" style={{ color: k.accent }}>{k.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 1: Inputs + Verdict ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Inputs — 2 cols (compacto) */}
          <div className="lg:col-span-2">
            <CampaignInputs
              realData={realData}
              onChange={setRealData}
              campaignStatus={campaignStatus}
              onStatusChange={setCampaignStatus}
              revenue={revenue}
              ctr={metrics.ctr}
              product={product}
              onSave={handleSave}
            />
          </div>

          {/* Verdict + Health + Plano de Ação — 3 cols (mais espaço) */}
          <div className="lg:col-span-3">
            <VerdictCard
              verdict={realData.spend > 0 ? verdict : null}
              healthScore={healthScore}
              hasData={realData.spend > 0}
              alerts={alerts}
              metrics={metrics}
              product={product}
              suggestions={realData.spend > 0 ? suggestions : []}
            />
          </div>
        </div>

        {/* ── Row 2: Horizontal Funnel ── */}
        <FunnelHorizontal
          impressions={realData.impressions}
          clicks={realData.clicks}
          conversions={realData.conversions}
          ctr={metrics.ctr}
          cr={metrics.cr}
          requiredCR={product.requiredCR || 1}
          ctrBottleneck={funnelData.ctrBottleneck}
          crBottleneck={funnelData.crBottleneck}
          lostClicks={funnelData.lostClicks}
          lostConversions={funnelData.lostConversions}
          ctrLossPct={funnelData.ctrLossPct}
          crLossPct={funnelData.crLossPct}
        />

        {/* ── Row 3: CPC Gauge ── */}
        <CPCGauge
          cpc={metrics.cpc}
          cpcBom={product.cpcBom}
          cpcInter={product.cpcInter}
          cpcApert={product.cpcApert}
          max={gaugeData.max}
          pos={gaugeData.pos}
          status={gaugeData.status}
          isProfitable={metrics.roas >= 2 && metrics.roi > 0}
        />

        {/* ActionPlan moved into VerdictCard */}
      </div>

      {/* ── AI Modal ── */}
      <AIModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        metrics={metrics}
        product={product}
        onReport={r => { setAiReport(r); }}
        aiReport={aiReport}
      />
    </>
  );
};

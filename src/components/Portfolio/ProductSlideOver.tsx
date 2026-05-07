import React, { useState, useEffect } from 'react';
import {
  X, BarChart2, Settings2, DollarSign, TrendingUp, Target, Percent,
  MousePointer2, ShoppingCart, Activity, BarChart, Clock, Award,
  CheckCircle, AlertCircle, XCircle, Plus, FileText,
} from 'lucide-react';
import type { EnrichedProduct } from '../../types';
import { Button, IconButton } from '../ui';
import { MiniSparkline } from './MiniSparkline';
import { ActivityBadge } from './ProductCard';
import { fmt, fmtPct } from './helpers';

interface ProductSlideOverProps {
  product: EnrichedProduct | null;
  tags: string[];
  notes: string;
  onClose: () => void;
  onAnalyze: () => void;
  onSetup: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onNotesChange: (v: string) => void;
}

/* ── Metric card ── */
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}> = ({ icon, label, value, sub, color = 'text-slate-800' }) => (
  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
    <div className="flex items-center gap-1.5 text-2xs text-slate-400 font-bold uppercase tracking-widest mb-1.5">
      {icon} {label}
    </div>
    <div className={`text-lg font-bold tabular-nums ${color}`}>{value}</div>
    {sub && <div className="text-2xs text-slate-400 mt-0.5">{sub}</div>}
  </div>
);

/* ── Health score bar ── */
const HealthBar: React.FC<{ score: number }> = ({ score }) => {
  const color =
    score >= 80 ? 'bg-emerald-500' :
    score >= 60 ? 'bg-amber-400' :
    score >= 40 ? 'bg-orange-500' :
                  'bg-red-500';
  const label =
    score >= 80 ? 'Excelente' :
    score >= 60 ? 'Bom' :
    score >= 40 ? 'Regular' : 'Critico';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Health Score 2.0</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">{label}</span>
          <span className={`text-base font-bold tabular-nums ${
            score >= 60 ? 'text-green-600' : score >= 40 ? 'text-orange-500' : 'text-red-600'
          }`}>{score}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

/* ── Status badge ── */
const StatusBadge: React.FC<{ status: EnrichedProduct['status'] }> = ({ status }) => {
  const map = {
    excellent: { icon: <Award size={11} />,         text: 'Excelente',  cls: 'bg-green-100 text-green-700' },
    good:      { icon: <CheckCircle size={11} />,   text: 'Bom',        cls: 'bg-blue-100 text-blue-700'   },
    warning:   { icon: <AlertCircle size={11} />,   text: 'Atencao',    cls: 'bg-yellow-100 text-yellow-700' },
    danger:    { icon: <XCircle size={11} />,       text: 'Critico',    cls: 'bg-red-100 text-red-700'     },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.icon} {s.text}
    </span>
  );
};

const TAG_PRESETS = ['escalar', 'favorito', 'testar', 'pausar', 'otimizar', 'abandonar'];

export const ProductSlideOver: React.FC<ProductSlideOverProps> = ({
  product,
  tags,
  notes,
  onClose,
  onAnalyze,
  onSetup,
  onAddTag,
  onRemoveTag,
  onNotesChange,
}) => {
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);

  useEffect(() => { setLocalNotes(notes); }, [notes]);

  if (!product) return null;

  const p = product;
  const profitColor = p.profit > 0 ? 'text-green-600' : p.profit < 0 ? 'text-red-600' : 'text-slate-800';

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !tags.includes(clean)) onAddTag(clean);
    setTagInput('');
    setShowTagInput(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* ── Top bar ── */}
        <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-start gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge status={p.status} />
              <ActivityBadge status={p.activityStatus} />
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-tight truncate">{p.name}</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">{p.nicho} · {p.market} · {p.type}</p>
          </div>
          <IconButton icon={<X size={18}/>} label="Fechar painel" variant="ghost" size="md" onClick={onClose} className="flex-shrink-0" />
        </div>

        {/* ── Action buttons ── */}
        <div className="px-5 py-3 border-b border-slate-50 flex gap-2 flex-shrink-0">
          <button
            onClick={onAnalyze}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold py-2 rounded-lg transition-colors"
          >
            <BarChart2 size={13} /> Ir para Análise
          </button>
          <button
            onClick={onSetup}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-[13px] font-semibold py-2 rounded-lg transition-colors border border-slate-200 hover:border-slate-300"
          >
            <Settings2 size={13} /> Configurar no Setup
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">

          {/* Sparkline */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Tendencia — ultimos 14 dias
            </p>
            <MiniSparkline data={p.sparklineData} width={400} height={48} className="w-full" />
            {p.lastCampaignDate && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                <Clock size={11} />
                Ultima campanha: {new Date(p.lastCampaignDate).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>

          {/* Metrics grid */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Metricas Acumuladas
            </p>
            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                icon={<DollarSign size={10} />}
                label="Lucro Liquido"
                value={fmt(p.profit)}
                sub={`${fmt(p.revenue)} rec. - ${fmt(p.spend)} ads`}
                color={profitColor}
              />
              <MetricCard
                icon={<TrendingUp size={10} />}
                label="ROI"
                value={`${p.roi.toFixed(1)}%`}
                sub="Retorno sobre investimento"
                color={p.roi >= 0 ? 'text-blue-700' : 'text-red-600'}
              />
              <MetricCard
                icon={<Activity size={10} />}
                label="ROAS"
                value={`${p.roas.toFixed(2)}x`}
                sub="Receita / Gasto ads"
              />
              <MetricCard
                icon={<Percent size={10} />}
                label="Taxa Conversao"
                value={fmtPct(p.cr)}
                sub={`${p.conversions} vendas de ${p.clicks} cliques`}
              />
              <MetricCard
                icon={<MousePointer2 size={10} />}
                label="CPC Real"
                value={fmt(p.cpc)}
                sub={`Ref bom: ${fmt(p.cpcBom ?? 0)}`}
                color={p.cpc > 0 && p.cpcBom && p.cpc <= p.cpcBom ? 'text-green-700' : 'text-slate-800'}
              />
              <MetricCard
                icon={<ShoppingCart size={10} />}
                label="Conversoes"
                value={p.conversions.toString()}
                sub={`Ticket medio: ${fmt(p.avgTicket)}`}
              />
              <MetricCard
                icon={<BarChart size={10} />}
                label="Campanhas"
                value={p.campaignCount.toString()}
                sub="Total rodadas"
              />
              <MetricCard
                icon={<Target size={10} />}
                label="Investimento"
                value={fmt(p.spend + p.fixedCosts)}
                sub={`Ads ${fmt(p.spend)} + Fixos ${fmt(p.fixedCosts)}`}
              />
            </div>
          </div>

          {/* Health Score */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <HealthBar score={p.healthScore} />
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Calculado com base em ROI, CR, CPC, ROAS, atividade e consistencia das campanhas.
            </p>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Etiquetas
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.length === 0 && (
                <span className="text-[11px] text-slate-400">Nenhuma etiqueta ainda</span>
              )}
              {tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100"
                >
                  #{t}
                  <button onClick={() => onRemoveTag(t)} className="hover:text-red-500 transition-colors ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>

            {/* Tag presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {TAG_PRESETS.filter(t => !tags.includes(t)).map(preset => (
                <button
                  key={preset}
                  onClick={() => onAddTag(preset)}
                  className="text-[11px] text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-2 py-0.5 rounded-full transition-all flex items-center gap-0.5"
                >
                  <Plus size={9} /> {preset}
                </button>
              ))}
            </div>

            {showTagInput ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddTag();
                    if (e.key === 'Escape') setShowTagInput(false);
                  }}
                  placeholder="nova etiqueta..."
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Button variant="primary" size="sm" onClick={handleAddTag}>Ok</Button>
                <IconButton icon={<X size={14}/>} label="Cancelar" variant="ghost" size="sm" onClick={() => setShowTagInput(false)} />
              </div>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> Adicionar etiqueta personalizada
              </button>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={13} className="text-slate-400" />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Anotacoes
              </p>
            </div>
            <textarea
              value={localNotes}
              onChange={e => {
                setLocalNotes(e.target.value);
                onNotesChange(e.target.value);
              }}
              placeholder="Anote aqui observacoes, proximos passos, hipoteses de teste..."
              rows={4}
              className="w-full text-sm text-slate-700 border border-slate-200 rounded-xl p-3 resize-none outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-300"
            />
          </div>

        </div>
      </div>
    </>
  );
};

import React, { useState } from 'react';
import { Zap, BrainCircuit, ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react';
import type { Product, AlertConfig, AIAnalysisResponse } from '../../../types';
import type { Metrics } from '../hooks';
import { generateAutoSuggestions } from '../helpers';

interface Props {
  metrics: Metrics;
  product: Product;
  alertConfig: AlertConfig;
  aiReport: AIAnalysisResponse | null;
  onOpenAI: () => void;
}

const PRIORITY_CONFIG = {
  ALTA: {
    dot:    'bg-red-500',
    badge:  'bg-red-100 text-red-700',
    border: 'border-l-red-400',
    bg:     'bg-red-50/40',
    label:  'text-red-600',
  },
  MEDIA: {
    dot:    'bg-amber-400',
    badge:  'bg-amber-100 text-amber-700',
    border: 'border-l-amber-400',
    bg:     'bg-amber-50/40',
    label:  'text-amber-600',
  },
  BAIXA: {
    dot:    'bg-slate-300',
    badge:  'bg-slate-100 text-slate-500',
    border: 'border-l-slate-200',
    bg:     'bg-slate-50/60',
    label:  'text-slate-500',
  },
};

export const ActionPlan: React.FC<Props> = ({
  metrics, product, alertConfig, aiReport, onOpenAI,
}) => {
  const [expanded, setExpanded] = useState(true);
  const suggestions = generateAutoSuggestions(metrics, product, alertConfig);
  const highCount = suggestions.filter(s => s.priority === 'ALTA').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

      {/* ── Header ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-amber-200">
            <Zap size={14} className="text-white" />
          </div>
          <div className="text-left">
            <div className="text-[13px] font-bold text-slate-800 leading-none">Plano de Ação</div>
            <div className="text-2xs text-slate-400 mt-0.5 font-medium">
              {suggestions.length} sugestão{suggestions.length !== 1 ? 'es' : ''}
              {highCount > 0 && (
                <span className="text-red-500 font-bold"> · {highCount} alta prioridade</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {highCount > 0 && (
            <span className="min-w-[20px] h-5 rounded-full bg-red-500 text-white text-2xs font-bold flex items-center justify-center px-1.5">
              {highCount}
            </span>
          )}
          {expanded
            ? <ChevronUp size={14} className="text-slate-400" />
            : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100">

          {/* ── Suggestion list ── */}
          <div className="divide-y divide-slate-50">
            {suggestions.map((s, i) => {
              const cfg = PRIORITY_CONFIG[s.priority];
              return (
                <div
                  key={i}
                  className={`flex gap-4 px-5 py-3.5 border-l-[3px] ${cfg.border} ${cfg.bg} transition-colors`}
                >
                  {/* Index + priority column */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5 pt-0.5" style={{ width: 36 }}>
                    <span className="text-[11px] font-bold text-slate-300">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`text-2xs font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md ${cfg.badge} whitespace-nowrap`}>
                      {s.priority}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    {/* Area chip + action title */}
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <span className="text-2xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {s.area}
                      </span>
                      <span className="text-[12px] font-bold text-slate-700 leading-snug">{s.action}</span>
                    </div>
                    {/* Detail */}
                    <p className="text-[11px] text-slate-500 leading-relaxed">{s.details}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── AI CTA — compact ── */}
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            {/* Left: label */}
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500">Quer uma análise mais profunda?</p>
              <p className="text-2xs text-slate-400 mt-0.5">Diagnóstico completo via IA</p>
            </div>

            {/* Right: compact button */}
            <button
              onClick={onOpenAI}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-[11px] text-white transition-all hover: hover:shadow-indigo-200/60 active:scale-[0.97] group"
              style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
            >
              {aiReport
                ? <><Sparkles size={12} /> Ver Relatório</>
                : <><BrainCircuit size={12} /> Analisar com IA<ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" /></>
              }
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

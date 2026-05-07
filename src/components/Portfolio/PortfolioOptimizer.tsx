import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Target, CheckCircle,
  RotateCcw, Zap, ChevronDown, ChevronUp, GitBranch, Cpu,
} from 'lucide-react';
import type { Product, Campaign, OptimizationResult } from '../../types';
import { optimizePortfolio, optimizePortfolioSimplex, fmt } from './helpers';

type OptimizationMethod = 'simple' | 'simplex';

interface PortfolioOptimizerProps {
  products: Product[];
  history: Campaign[];
}

export const PortfolioOptimizer: React.FC<PortfolioOptimizerProps> = ({ products, history }) => {
  const [method, setMethod] = useState<OptimizationMethod>('simple');
  const [budget, setBudget] = useState(1000);
  const [allocation, setAllocation] = useState<OptimizationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setAllocation(null);
    setShowResults(false);
  }, [method]);

  const handleOptimize = () => {
    if (!budget || budget <= 0) {
      alert('Insira um orçamento válido maior que zero.');
      return;
    }
    if (!products || products.length === 0) {
      alert('Não há produtos para otimizar.');
      return;
    }
    try {
      const result = method === 'simple'
        ? optimizePortfolio(budget, products, history)
        : optimizePortfolioSimplex(budget, products, history);
      if (result && typeof result === 'object') {
        setAllocation(result);
        setShowResults(true);
      }
    } catch (e) {
      console.error('Erro no otimizador:', e);
      alert('Erro ao calcular. Tente novamente.');
    }
  };

  const handleReset = () => {
    setAllocation(null);
    setShowResults(false);
    setBudget(1000);
    setMethod('simple');
  };

  const methods = [
    {
      id: 'simple' as OptimizationMethod,
      label: 'Equilibrada',
      sublabel: 'Proporcional ao ROI',
      icon: <GitBranch size={15} />,
      desc: 'Distribui budget proporcional ao ROI de cada produto. Ideal para quem está testando ou tem poucos dados históricos.',
      accent: 'text-blue-600',
      ring: 'ring-blue-500',
    },
    {
      id: 'simplex' as OptimizationMethod,
      label: 'Simplex',
      sublabel: 'Maximiza lucro total',
      icon: <Cpu size={15} />,
      desc: 'Algoritmo que maximiza o lucro considerando histórico e confiança nos dados. Ideal para 5+ campanhas registradas.',
      accent: 'text-violet-600',
      ring: 'ring-violet-500',
    },
  ] as const;

  const active = methods.find(m => m.id === method)!;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">Otimizador de Budget</p>
            <p className="text-[12px] text-slate-500">Onde alocar para maximizar o lucro</p>
          </div>
        </div>
        {allocation && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={12} /> Limpar
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">

        {/* ── Method selector ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Método de Otimização
          </p>

          {/* Segmented control */}
          <div className="grid grid-cols-2 gap-2.5">
            {methods.map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`relative text-left p-3.5 rounded-xl border-2 transition-all ${ method === m.id ? m.id === 'simple' ? 'border-blue-500 bg-blue-50/60' : 'border-violet-500 bg-violet-50/60' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50' }`}
              >
                {/* Selection indicator dot */}
                <span className={`absolute top-3 right-3 w-2 h-2 rounded-full transition-all ${ method === m.id ? m.id === 'simple' ? 'bg-blue-500' : 'bg-violet-500' : 'bg-slate-200' }`} />

                <span className={`flex items-center gap-1.5 mb-1 ${ method === m.id ? m.accent : 'text-slate-400' }`}>
                  {m.icon}
                </span>
                <p className={`text-[13px] font-bold leading-tight ${ method === m.id ? 'text-slate-800' : 'text-slate-600' }`}>{m.label}</p>
                <p className={`text-[11px] mt-0.5 ${ method === m.id ? 'text-slate-500' : 'text-slate-400' }`}>{m.sublabel}</p>
              </button>
            ))}
          </div>

          {/* Description — only for active method */}
          <div className={`mt-3 px-3.5 py-2.5 rounded-xl text-[12px] leading-relaxed border ${ method === 'simple' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-violet-50 border-violet-100 text-violet-800' }`}>
            {active.desc}
          </div>
        </div>

        {/* ── Budget input ── */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">
            Orçamento Mensal
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-500 select-none">
              R$
            </span>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(parseFloat(e.target.value) || 0)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-300"
              placeholder="0,00"
              min={0}
              step={100}
            />
          </div>
        </div>

        {/* ── CTA ── */}
        <button
          onClick={handleOptimize}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[13px] font-semibold py-2.5 px-5 rounded-xl transition-all hover: hover:shadow-blue-500/20 active:scale-[0.99]"
        >
          <TrendingUp size={14} />
          Calcular Alocação Ótima
        </button>

        {/* ── Results ── */}
        {allocation && allocation.allocation && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">

            {/* Summary row */}
            <button
              onClick={() => setShowResults(p => !p)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200"
            >
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Lucro Esperado</p>
                  <p className="text-lg font-black text-green-600 tabular-nums leading-none">
                    {fmt(allocation.totalExpectedProfit ?? allocation.totalProfit ?? 0)}
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">ROI Médio</p>
                  <p className="text-lg font-black text-blue-700 tabular-nums leading-none">
                    {(allocation.efficiency ?? 0).toFixed(1)}%
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Alocado</p>
                  <p className="text-lg font-black text-slate-800 tabular-nums leading-none">
                    {fmt((allocation.totalBudget ?? budget) - (allocation.remainingBudget ?? 0))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                {showResults ? 'Fechar' : 'Ver detalhes'}
                {showResults ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {/* Detail */}
            {showResults && (
              <div className="p-4 space-y-2.5">
                {allocation.message && (
                  <p className="text-[12px] text-slate-600 leading-relaxed pb-1">{allocation.message}</p>
                )}

                {(allocation.allocation ?? [])
                  .filter((item: any) => item?.productName)
                  .map((item: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-100 p-3.5">
                      <div className="flex items-start justify-between mb-2.5">
                        <div>
                          <p className="text-[13px] font-bold text-slate-800 leading-tight">{item.productName}</p>
                          {method === 'simplex' && item.recommendation && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-1 ${ item.recommendation === 'AUMENTAR' ? 'text-blue-600' : item.recommendation === 'REDUZIR' ? 'text-orange-500' : item.recommendation === 'MANTER' ? 'text-green-600' : 'text-violet-600' }`}>
                              {item.recommendation === 'AUMENTAR' && <TrendingUp size={11} />}
                              {item.recommendation === 'REDUZIR'  && <TrendingDown size={11} />}
                              {item.recommendation === 'MANTER'   && <CheckCircle size={11} />}
                              {item.recommendation === 'AUMENTAR' && `Aumentar ${item.changePercent?.toFixed(0)}%`}
                              {item.recommendation === 'REDUZIR'  && `Reduzir ${Math.abs(item.changePercent ?? 0).toFixed(0)}%`}
                              {item.recommendation === 'MANTER'   && 'Manter investimento'}
                              {item.recommendation === 'NOVO'     && 'Novo investimento'}
                            </span>
                          )}
                        </div>
                        {method === 'simplex' && item.confidence && (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ item.confidence === 'Alta' ? 'bg-green-50 text-green-700' : item.confidence === 'Media' ? 'bg-yellow-50 text-yellow-700' : 'bg-orange-50 text-orange-600' }`}>
                            {item.confidence}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Investir</p>
                          <p className="text-[15px] font-black text-slate-800 tabular-nums leading-none">
                            {fmt(item.allocatedBudget ?? item.amount ?? 0)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2.5">
                          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Lucro Est.</p>
                          <p className="text-[15px] font-black text-green-600 tabular-nums leading-none">
                            {fmt(item.expectedProfit ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                {(allocation.remainingBudget ?? 0) > 0 && (
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2">
                      <Target size={13} className="text-amber-600" />
                      <span className="text-[12px] font-semibold text-amber-800">Reserva de Segurança</span>
                    </div>
                    <span className="text-[14px] font-bold text-amber-700 tabular-nums">
                      {fmt(allocation.remainingBudget)}
                    </span>
                  </div>
                )}

                {(allocation.allocation ?? []).length === 0 && (
                  <p className="py-5 text-center text-[13px] text-slate-400">
                    Nenhum produto com ROI positivo suficiente para justificar investimento.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

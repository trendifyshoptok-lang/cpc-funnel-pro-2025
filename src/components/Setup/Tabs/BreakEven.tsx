import React, { useState, useMemo } from 'react';
import {
  Calculator, TrendingUp, Target, Zap, DollarSign, MousePointer,
  ShoppingCart, Percent, Info, AlertCircle, RotateCcw, TrendingDown,
  CheckCircle, XCircle, MinusCircle
} from 'lucide-react';
import type { Product } from '../../../types';

interface BreakEvenProps {
  product: Product;
}

/* ── Tooltip ── */
const Tip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>{children}</div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl whitespace-nowrap shadow-xl max-w-[200px] text-center">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-slate-900" />
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Step Header ── */
const StepHeader: React.FC<{
  step: number;
  title: string;
  subtitle: string;
  color: 'blue' | 'violet' | 'slate';
}> = ({ step, title, subtitle, color }) => {
  const ring = {
    blue:   'bg-blue-600 text-white',
    violet: 'bg-violet-600 text-white',
    slate:  'bg-slate-700 text-white',
  }[color];
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-7 h-7 rounded-full ${ring} text-sm font-bold flex-shrink-0 flex items-center justify-center`}>
        {step}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
};

const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const BreakEven: React.FC<BreakEvenProps> = ({ product }) => {
  const [budget, setBudget] = useState(100);
  const [cpc, setCpc] = useState(product.cpcBom || 1);
  const [cr, setCR] = useState(product.requiredCR || 2);

  const validBudget = Math.max(0, budget);
  const validCpc = Math.max(0.01, cpc);
  const validCr = Math.max(0, Math.min(100, cr));

  const commissionLiquid = product.commissionLiquid || 0;

  const dynamicRequiredCR = commissionLiquid > 0 && cpc > 0
    ? (cpc / commissionLiquid) * 100
    : 0;

  const sim = useMemo(() => {
    const clicks = Math.floor(validBudget / validCpc);
    const sales = Math.floor(clicks * (validCr / 100));
    const revenue = sales * commissionLiquid;
    const profit = revenue - validBudget;
    const roi = validBudget > 0 ? (profit / validBudget) * 100 : 0;
    return { clicks, sales, revenue, profit, roi };
  }, [validBudget, validCpc, validCr, commissionLiquid]);

  const breakEven = useMemo(() => {
    if (validCpc <= 0 || commissionLiquid <= 0)
      return { totalClicks: 0, requiredCR: 0, salesNeeded: 0, revenueAtBreakEven: 0 };
    const totalClicks = Math.floor(validBudget / validCpc);
    const salesNeeded = Math.ceil(validBudget / commissionLiquid);
    const requiredCR = totalClicks > 0 ? (salesNeeded / totalClicks) * 100 : 0;
    return { totalClicks, requiredCR, salesNeeded, revenueAtBreakEven: salesNeeded * commissionLiquid };
  }, [validBudget, validCpc, commissionLiquid]);

  const scenarios = useMemo(() => {
    return [0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map(scenarioCr => {
      const clicks = Math.floor(validBudget / validCpc);
      const sales = Math.floor(clicks * (scenarioCr / 100));
      const revenue = sales * commissionLiquid;
      const profit = revenue - validBudget;
      const roi = validBudget > 0 ? (profit / validBudget) * 100 : 0;
      return { cr: scenarioCr, clicks, sales, revenue, profit, roi };
    });
  }, [validBudget, validCpc, commissionLiquid]);

  const isProfit    = sim.profit > 0;
  const isBreakeven = sim.profit === 0;

  const cpcZone =
    cpc <= (product.cpcBom   || 0) ? { label: 'Bom',           bg: 'bg-green-100',  text: 'text-green-700'  } :
    cpc <= (product.cpcInter || 0) ? { label: 'Intermediario',  bg: 'bg-yellow-100', text: 'text-yellow-700' } :
    cpc <= (product.cpcApert || 0) ? { label: 'Apertado',       bg: 'bg-orange-100', text: 'text-orange-700' } :
                                     { label: 'Ruim',            bg: 'bg-red-100',    text: 'text-red-700'    };

  const crZone =
    cr < dynamicRequiredCR          ? { label: 'Insuficiente',    bg: 'bg-red-100',    text: 'text-red-700'    } :
    sim.profit < 0                  ? { label: 'Falta Orcamento', bg: 'bg-orange-100', text: 'text-orange-700' } :
    cr < dynamicRequiredCR * 1.2    ? { label: 'Margem Apertada', bg: 'bg-yellow-100', text: 'text-yellow-700' } :
                                      { label: 'Lucro Real',       bg: 'bg-green-100',  text: 'text-green-700'  };

  return (
    <div className="space-y-6">

      {/* ══ STEP 1 — PARAMETROS ══ */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 pt-5 pb-0">
          <StepHeader
            step={1}
            title="Parametros da Simulacao"
            subtitle="Configure o cenario que voce quer testar"
            color="blue"
          />
        </div>

        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Budget */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <DollarSign size={11} className="text-green-500" />
              Investimento
              <Tip text="Quanto voce vai investir em anuncios nesse periodo">
                <Info size={12} className="text-slate-300 cursor-help" />
              </Tip>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
              <input
                type="number" value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                min="0" step="10"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Budget da campanha</p>
          </div>

          {/* CPC */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <MousePointer size={11} className="text-blue-500" />
              CPC Esperado
              <Tip text="Custo por clique que voce estima pagar">
                <Info size={12} className="text-slate-300 cursor-help" />
              </Tip>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
              <input
                type="number" value={cpc}
                onChange={e => setCpc(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                min="0.01" step="0.01"
              />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${cpcZone.bg} ${cpcZone.text}`}>
                {cpcZone.label}
              </span>
              <span className="text-[11px] text-slate-400">Ref: {fmt(product.cpcBom || 0)}</span>
            </div>
          </div>

          {/* CR */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Percent size={11} className="text-purple-500" />
              Taxa de Conversao
              <Tip text="Percentual de cliques que viram vendas">
                <Info size={12} className="text-slate-300 cursor-help" />
              </Tip>
            </label>
            <div className="relative">
              <input
                type="number" value={cr}
                onChange={e => setCR(Number(e.target.value))}
                className="w-full pr-7 pl-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                min="0" max="100" step="0.1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${crZone.bg} ${crZone.text}`}>
                {crZone.label}
              </span>
              <span className="text-[11px] text-slate-400">Min: {dynamicRequiredCR.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="px-5 pb-4 border-t border-slate-100 pt-3 flex justify-end">
          <button
            onClick={() => { setBudget(100); setCpc(product.cpcBom || 1); setCR(product.requiredCR || 2); }}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={11} /> Restaurar Padroes
          </button>
        </div>
      </div>

      {/* ══ STEP 2 — RESULTADO LIVE ══ */}
      <div className={`rounded-2xl border-2 overflow-hidden ${
        isProfit   ? 'border-green-200 bg-green-50' :
        isBreakeven? 'border-yellow-200 bg-yellow-50' :
                    'border-red-200 bg-red-50'
      }`}>
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          {isProfit    ? <CheckCircle size={16} className="text-green-600" /> :
           isBreakeven ? <MinusCircle size={16} className="text-yellow-600" /> :
                        <XCircle size={16} className="text-red-600" />}
          <span className={`text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-lg ${
            isProfit    ? 'bg-green-200 text-green-800' :
            isBreakeven ? 'bg-yellow-200 text-yellow-800' :
                         'bg-red-200 text-red-800'
          }`}>
            {isProfit ? 'Cenario Lucrativo' : isBreakeven ? 'Break-Even (Empate)' : 'Cenario de Prejuizo'}
          </span>
          <span className={`text-xs font-semibold ml-auto ${
            sim.profit >= 0 ? 'text-green-700' : 'text-red-600'
          }`}>
            {sim.profit >= 0 ? '+' : ''}{fmt(sim.profit)} resultado
          </span>
        </div>

        <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-2xs text-slate-400 font-bold uppercase mb-1.5">
              <MousePointer size={11} /> Cliques
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">{sim.clicks.toLocaleString('pt-BR')}</div>
            <div className="text-2xs text-slate-400 mt-0.5">{fmt(validBudget)} ÷ {fmt(validCpc)}</div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-2xs text-slate-400 font-bold uppercase mb-1.5">
              <ShoppingCart size={11} /> Vendas
            </div>
            <div className="text-2xl font-black text-blue-700 tabular-nums">{sim.sales}</div>
            <div className="text-2xs text-slate-400 mt-0.5">{sim.clicks} x {validCr.toFixed(1)}%</div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-2xs text-slate-400 font-bold uppercase mb-1.5">
              <DollarSign size={11} /> Receita
            </div>
            <div className="text-2xl font-black text-green-700 tabular-nums">{fmt(sim.revenue)}</div>
            <div className="text-2xs text-slate-400 mt-0.5">{sim.sales} x {fmt(commissionLiquid)}</div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-2xs text-slate-400 font-bold uppercase mb-1.5">
              <TrendingUp size={11} /> ROI
            </div>
            <div className={`text-2xl font-black tabular-nums ${sim.roi >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {sim.roi.toFixed(1)}%
            </div>
            <div className={`text-2xs mt-0.5 font-semibold ${sim.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {sim.profit >= 0 ? '+' : ''}{fmt(sim.profit)}
            </div>
          </div>
        </div>
      </div>

      {/* ══ STEP 3 — PONTO DE EQUILIBRIO ══ */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 pt-5 pb-0">
          <StepHeader
            step={2}
            title="Ponto de Equilibrio (Break-Even)"
            subtitle="O minimo que voce precisa para nao perder dinheiro"
            color="violet"
          />
        </div>

        <div className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Cliques Totais',
                value: breakEven.totalClicks.toLocaleString('pt-BR'),
                sub: `${fmt(validBudget)} ÷ ${fmt(validCpc)}`,
                color: 'violet'
              },
              {
                label: 'CR Necessaria',
                value: `${breakEven.requiredCR.toFixed(2)}%`,
                sub: 'Minimo para empatar',
                color: 'violet'
              },
              {
                label: 'Vendas Necessarias',
                value: breakEven.salesNeeded.toString(),
                sub: `${breakEven.salesNeeded} vendas para zerar`,
                color: 'violet'
              },
              {
                label: 'Receita Break-Even',
                value: fmt(breakEven.revenueAtBreakEven),
                sub: 'Igual ao investimento',
                color: 'green'
              },
            ].map(item => (
              <div
                key={item.label}
                className={`p-4 rounded-2xl border ${
                  item.color === 'green'
                    ? 'bg-green-50 border-green-100'
                    : 'bg-violet-50 border-violet-100'
                }`}
              >
                <div className="text-2xs text-slate-500 font-bold uppercase tracking-widest mb-1">{item.label}</div>
                <div className={`text-xl font-bold tabular-nums ${
                  item.color === 'green' ? 'text-green-700' : 'text-violet-700'
                }`}>{item.value}</div>
                <div className="text-2xs text-slate-400 mt-0.5 leading-snug">{item.sub}</div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
            <AlertCircle size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              Com <strong className="text-slate-800">{fmt(validBudget)}</strong> e CPC de{' '}
              <strong className="text-slate-800">{fmt(validCpc)}</strong>, voce tera{' '}
              <strong className="text-slate-800">{breakEven.totalClicks} cliques</strong>. Para empatar precisa de CR{' '}
              <strong className="text-slate-800">{breakEven.requiredCR.toFixed(2)}%</strong> —{' '}
              qualquer conversao acima disso e lucro puro.
            </span>
          </div>
        </div>
      </div>

      {/* ══ STEP 3 — CENARIOS ══ */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-700 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">Cenarios de Conversao</p>
            <p className="text-[11px] text-slate-400">O que acontece com diferentes taxas de CR</p>
          </div>
          <span className="text-[11px] text-slate-400 ml-auto">Base: {fmt(validBudget)} / CPC {fmt(validCpc)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-wider">CR (%)</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Cliques</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Vendas</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Receita</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Resultado</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-wider">ROI</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, i) => {
                const isBreakEvenRow = Math.abs(s.profit) < 1;
                const isCurrentCR = Math.abs(s.cr - validCr) < 0.3;
                return (
                  <tr
                    key={i}
                    className={`border-b border-slate-50 transition-colors ${
                      isCurrentCR
                        ? 'bg-blue-50/60 font-semibold'
                        : isBreakEvenRow
                          ? 'bg-yellow-50/60'
                          : s.profit >= 0
                            ? 'hover:bg-green-50/30'
                            : 'bg-red-50/30 hover:bg-red-50/50'
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-slate-800 tabular-nums">
                      {s.cr.toFixed(1)}%
                      {isCurrentCR && <span className="ml-1.5 text-2xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">atual</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums">{s.clicks.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 tabular-nums">{s.sales}</td>
                    <td className="px-4 py-3 font-semibold text-green-700 tabular-nums">{fmt(s.revenue)}</td>
                    <td className={`px-4 py-3 font-bold tabular-nums ${s.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {s.profit >= 0 ? '+' : ''}{fmt(s.profit)}
                    </td>
                    <td className={`px-4 py-3 font-bold tabular-nums ${s.roi >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {s.roi.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React from 'react';
import {
  ArrowRight, TrendingUp, MousePointer2, Target, Info,
  Flame, CheckCircle, AlertTriangle, XCircle, Minus
} from 'lucide-react';
import type { Product } from '../../../types';

interface FichaTecnicaProps {
  product: Product;
}

const fmt = (v?: number) =>
  v != null ? `R$ ${v.toFixed(2)}` : '—';

/* ── Inline hint badge ── */
const Hint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
    <Info size={10} />
    {children}
  </span>
);

/* ── Status pill ── */
const StatusPill: React.FC<{ label: string; color: 'green' | 'yellow' | 'orange' | 'red' }> = ({ label, color }) => {
  const styles = {
    green:  'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red:    'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${styles[color]}`}>
      {label}
    </span>
  );
};

export const FichaTecnica: React.FC<FichaTecnicaProps> = ({ product }) => {
  const commission = product.commissionLiquid ?? 0;
  // commissionGross may not be persisted — calculate fallback
  const commissionGross = (product.commissionGross != null && product.commissionGross > 0)
    ? product.commissionGross
    : (product.price ?? 0) * ((product.commissionPct ?? 0) / 100);
  const cpcBom    = product.cpcBom ?? 0;
  const cpcInter  = product.cpcInter ?? 0;
  const cpcApert  = product.cpcApert ?? 0;
  const cpcRuim   = product.cpcRuim ?? 0;
  const cr        = product.requiredCR ?? 0;
  const clicks    = product.clicksPurchasable ?? 0;
  const benchCPC  = product.manualBenchmarkCPC ?? product.cpcSuggested ?? 0;

  /* CPC market benchmark classification */
  const cpcStatus: 'green' | 'yellow' | 'orange' | 'red' =
    benchCPC <= cpcBom   ? 'green' :
    benchCPC <= cpcInter ? 'yellow' :
    benchCPC <= cpcApert ? 'orange' : 'red';

  const cpcStatusLabel = {
    green: 'Excelente', yellow: 'Intermediario', orange: 'Apertado', red: 'Critico'
  }[cpcStatus];

  /* CR viability */
  const crIsGood = cr <= 2;

  return (
    <div className="space-y-5">

      {/* ── 1. FLUXO DE COMISSAO ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-2xs font-bold flex items-center justify-center">1</div>
          <h3 className="text-sm font-bold text-slate-700">Fluxo de Comissao</h3>
          <Hint>quanto voce recebe por cada venda</Hint>
        </div>

        {/* Visual flow: Preco → % → Bruta → -plat → Liquida */}
        <div className="flex items-stretch gap-3 flex-wrap md:flex-nowrap">
          {/* Preco do Produto */}
          <div className="flex-1 min-w-[110px] bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-2xs font-bold uppercase tracking-widest text-slate-400 mb-2">Preco do Produto</p>
            <p className="text-lg font-bold text-slate-800 tabular-nums font-mono" style={{ fontVariantNumeric: 'tabular-nums slashed-zero' }}>
              {fmt(product.price)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1.5">Valor que o cliente paga</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center text-slate-300 flex-shrink-0 self-center">
            <ArrowRight size={16} strokeWidth={1.5} />
          </div>

          {/* Comissao Bruta */}
          <div className="flex-1 min-w-[110px] bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-2xs font-bold uppercase tracking-widest text-slate-400 mb-2">Comissao Bruta</p>
            <p className="text-lg font-bold text-slate-800 tabular-nums font-mono" style={{ fontVariantNumeric: 'tabular-nums slashed-zero' }}>
              {fmt(commissionGross)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1.5">{product.commissionPct ?? 0}% do preco</p>
          </div>

          {/* Minus operator */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 self-center gap-0.5">
            <Minus size={12} className="text-slate-300" />
            <span className="text-2xs text-slate-400 font-semibold leading-none">plat.</span>
          </div>

          {/* Voce Recebe — highlighted with emerald border accent, no gradient */}
          <div className="flex-1 min-w-[120px] bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-2xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Voce Recebe</p>
            <p className="text-lg font-bold tabular-nums font-mono" style={{ color: 'var(--num-positive)', fontVariantNumeric: 'tabular-nums slashed-zero' }}>
              {fmt(product.commissionLiquid)}
            </p>
            <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
              <CheckCircle size={10} /> Liquido por venda
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. ZONAS DE CPC ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-2xs font-bold flex items-center justify-center">2</div>
          <h3 className="text-sm font-bold text-slate-700">Zonas de CPC</h3>
          <Hint>custo por clique — quanto pagar por cada visita</Hint>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Barra de gradiente visual */}
          <div className="flex h-2.5">
            <div className="flex-1 bg-green-400 rounded-tl-2xl" />
            <div className="flex-1 bg-yellow-400" />
            <div className="flex-1 bg-orange-400" />
            <div className="flex-1 bg-red-400 rounded-tr-2xl" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {[
              {
                key: 'bom', label: 'CPC Bom', value: cpcBom,
                sub: 'Meta ideal — lucro garantido',
                color: 'text-green-700', bg: 'bg-green-50',
                icon: <CheckCircle size={14} className="text-green-500" />,
                tip: '4% da comissao bruta'
              },
              {
                key: 'inter', label: 'CPC Intermediario', value: cpcInter,
                sub: 'Zona de atencao — monitore',
                color: 'text-yellow-700', bg: 'bg-yellow-50',
                icon: <AlertTriangle size={14} className="text-yellow-500" />,
                tip: '5.56% da comissao bruta'
              },
              {
                key: 'apert', label: 'CPC Apertado', value: cpcApert,
                sub: 'Margem fina — otimize ja',
                color: 'text-orange-700', bg: 'bg-orange-50',
                icon: <AlertTriangle size={14} className="text-orange-500" />,
                tip: '6.67% da comissao bruta'
              },
              {
                key: 'ruim', label: 'CPC Ruim', value: cpcRuim,
                sub: 'Prejuizo — pause a campanha',
                color: 'text-red-700', bg: 'bg-red-50',
                icon: <XCircle size={14} className="text-red-500" />,
                tip: '10% da comissao bruta'
              },
            ].map(zone => (
              <div key={zone.key} className={`p-4 ${zone.bg}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  {zone.icon}
                  <span className="text-2xs font-bold uppercase tracking-widest text-slate-500">{zone.label}</span>
                </div>
                <p className={`text-xl font-bold tabular-nums ${zone.color}`}>{fmt(zone.value)}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">{zone.sub}</p>
                <p className="text-2xs text-slate-400 mt-2 font-medium">{zone.tip}</p>
              </div>
            ))}
          </div>

          {/* Benchmark de mercado */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <TrendingUp size={14} className="text-blue-500" />
              <span className="font-medium">Benchmark de Mercado:</span>
              <span className="font-black text-slate-800 tabular-nums">{fmt(benchCPC)}</span>
            </div>
            <StatusPill label={`Zona: ${cpcStatusLabel}`} color={cpcStatus} />
          </div>
        </div>
      </section>

      {/* ── 3. METRICAS DE VIABILIDADE ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-2xs font-bold flex items-center justify-center">3</div>
          <h3 className="text-sm font-bold text-slate-700">Viabilidade da Campanha</h3>
          <Hint>o produto compensa anunciar?</Hint>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Poder de Fogo */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Flame size={16} className="text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Poder de Fogo</p>
                  <p className="text-[11px] text-slate-400">cliques por comissao</p>
                </div>
              </div>
              <StatusPill
                label={clicks >= 50 ? 'Otimo' : clicks >= 25 ? 'Bom' : clicks >= 10 ? 'Regular' : 'Baixo'}
                color={clicks >= 50 ? 'green' : clicks >= 25 ? 'yellow' : clicks >= 10 ? 'orange' : 'red'}
              />
            </div>

            <p className="text-5xl font-black text-cyan-600 tabular-nums mb-1">{clicks}</p>
            <p className="text-sm text-slate-500 mb-4">cliques no CPC Bom</p>

            <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-600">Como calcular:</p>
              <p>{fmt(commissionGross)} (bruta) ÷ {fmt(cpcBom)} (CPC Bom) ≈ <strong className="text-slate-700">{clicks} cliques</strong></p>
              <p className="text-slate-400 mt-1">Quanto maior, mais margem voce tem para testar antes de ter prejuizo.</p>
            </div>
          </div>

          {/* Meta de Conversao */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Meta de Conversao</p>
                  <p className="text-[11px] text-slate-400">CR minimo para empatar</p>
                </div>
              </div>
              <StatusPill
                label={crIsGood ? 'Viavel' : 'Exigente'}
                color={crIsGood ? 'green' : 'orange'}
              />
            </div>

            <p className="text-5xl font-black text-purple-600 tabular-nums mb-1">{cr.toFixed(2)}%</p>
            <p className="text-sm text-slate-500 mb-4">taxa de conversao necessaria</p>

            <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-600">O que isso significa:</p>
              <p>A cada <strong className="text-slate-700">{clicks} cliques</strong> voce precisa de <strong className="text-slate-700">1 venda</strong> para empatar.</p>
              <p className={`mt-1 font-medium ${crIsGood ? 'text-green-600' : 'text-orange-600'}`}>
                {crIsGood
                  ? `CR de ${cr.toFixed(2)}% esta abaixo de 2% — dentro da media de mercado.`
                  : `CR de ${cr.toFixed(2)}% e acima de 2% — campanha mais desafiadora.`}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

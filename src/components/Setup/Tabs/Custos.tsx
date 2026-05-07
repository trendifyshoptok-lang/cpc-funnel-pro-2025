import React from 'react';
import {
  Layers, Package, Calendar, Info, TrendingDown,
  Plus, ChevronRight, Lightbulb
} from 'lucide-react';
import { CostsManager } from '../../shared/CostsManager';
import type { Product, OperationalCosts } from '../../../types';

interface CustosProps {
  product: Product;
  globalCosts: OperationalCosts;
  activeProductsCount: number;
  onUpdateProduct: (field: string, value: any) => void;
}

const EMPTY_COSTS: OperationalCosts = { items: [], total: 0 };

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ── Step Header ── */
const StepHeader: React.FC<{
  step: number;
  title: string;
  subtitle: string;
  color: 'blue' | 'orange' | 'slate';
}> = ({ step, title, subtitle, color }) => {
  const ring = {
    blue:   'bg-blue-600 text-white',
    orange: 'bg-orange-500 text-white',
    slate:  'bg-slate-700 text-white',
  }[color];
  return (
    <div className="flex items-center gap-3 mb-4">
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

/* ── Example chip ── */
const ExChip: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-medium">
    <Plus size={9} className="text-slate-400" />
    {label}
  </span>
);

/* ── Info callout ── */
const Callout: React.FC<{ children: React.ReactNode; color?: 'blue' | 'amber' }> = ({ children, color = 'blue' }) => {
  const style = color === 'amber'
    ? 'bg-amber-50 border-amber-200 text-amber-800'
    : 'bg-blue-50 border-blue-200 text-blue-800';
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${style}`}>
      <Lightbulb size={13} className="flex-shrink-0 mt-0.5 opacity-70" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
};

export const Custos: React.FC<CustosProps> = ({
  product,
  globalCosts,
  activeProductsCount,
  onUpdateProduct,
}) => {
  const count = Math.max(1, activeProductsCount);
  const globalRateado = (globalCosts.total ?? 0) / count;
  const specificTotal = product.specificCosts?.total ?? 0;
  const totalMensal = globalRateado + specificTotal;
  const totalDiario = totalMensal / 30;
  const hasGlobalItems = (globalCosts.items?.length ?? 0) > 0;

  const handleSetSpecificCosts = (costs: OperationalCosts) => {
    onUpdateProduct('specificCosts', costs);
  };

  return (
    <div className="space-y-6">

      {/* ══ STEP 1 — CUSTOS GLOBAIS ══ */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <StepHeader
            step={1}
            title="Custos Globais Rateados"
            subtitle="O que voce paga todo mes independente de qual produto esta rodando"
            color="blue"
          />

          <Callout>
            <strong>O que sao custos globais?</strong> Sao despesas fixas do seu negocio, como assinaturas de ferramentas,
            hospedagem, dominio, etc. Como voce tem <strong>{count} produto{count !== 1 ? 's' : ''} ativo{count !== 1 ? 's' : ''}</strong>,
            cada um assume <strong>1/{count} desse custo</strong>. Configure esses custos na secao "Configuracoes Globais" no topo da pagina.
          </Callout>
        </div>

        {/* Lista de itens globais */}
        {!hasGlobalItems ? (
          <div className="mx-5 mb-5 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Info size={16} className="text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-600">Nenhum custo global cadastrado ainda</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Role a pagina para cima e adicione seus custos fixos na secao "Configuracoes Globais".
              </p>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-4 space-y-2">
            {(globalCosts.items ?? []).map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-sm text-slate-700 flex-1 truncate">{item.name}</span>
                <div className="flex items-center gap-3 text-right flex-shrink-0">
                  <span className="text-[11px] text-slate-400 tabular-nums hidden sm:block">
                    Total {fmt(item.value)} ÷ {count}
                  </span>
                  <ChevronRight size={12} className="text-slate-300 hidden sm:block" />
                  <span className="text-sm font-bold text-blue-700 tabular-nums min-w-[68px] text-right">
                    {fmt(item.value / count)}
                  </span>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-100 mt-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Sua cota mensal</span>
              <span className="text-base font-bold text-blue-700 tabular-nums">{fmt(globalRateado)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ══ STEP 2 — CUSTOS ESPECIFICOS ══ */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <StepHeader
            step={2}
            title="Custos Especificos deste Produto"
            subtitle={`Despesas que existem SOMENTE por causa de "${product.name}"`}
            color="orange"
          />

          <Callout color="amber">
            <strong>Quando usar?</strong> Se voce paga por algo que so existe por causa deste produto especifico —
            como uma landing page exclusiva, ferramenta de rastreamento, ou criativo terceirizado — adicione aqui.
            Esses custos nao sao divididos com outros produtos.
          </Callout>

          {/* Exemplos */}
          <div className="mt-3 mb-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Exemplos comuns:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Landing Page',
                'Ferramenta de tracking',
                'Criativo (designer)',
                'Copy especializada',
                'Pagina de captura',
                'Redirecionador de link',
                'A/B test tool',
              ].map(ex => (
                <ExChip key={ex} label={ex} />
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 border-t border-slate-50 pt-4">
          <CostsManager
            costs={product.specificCosts ?? EMPTY_COSTS}
            setCosts={handleSetSpecificCosts}
            label=""
          />

          {specificTotal === 0 && (
            <p className="text-xs text-slate-400 mt-3 text-center">
              Nenhum custo especifico adicionado — tudo certo! So adicione se houver despesas exclusivas deste produto.
            </p>
          )}
        </div>
      </div>

      {/* ══ STEP 3 — RESUMO FINAL ══ */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <StepHeader
            step={3}
            title="Resumo de Custos do Produto"
            subtitle="Total que voce precisa cobrir antes de ter lucro real"
            color="slate"
          />
        </div>

        <div className="px-5 pb-5 space-y-3">
          {/* Linha global rateado */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Layers size={14} className="text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Custos globais rateados</p>
                <p className="text-[11px] text-slate-500">{fmt(globalCosts.total ?? 0)} total / {count} produto{count !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-200 tabular-nums">{fmt(globalRateado)}</span>
          </div>

          {/* Linha especificos */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2.5">
              <Package size={14} className="text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Custos especificos</p>
                <p className="text-[11px] text-slate-500">
                  {(product.specificCosts?.items?.length ?? 0) > 0
                    ? `${product.specificCosts!.items!.length} item${product.specificCosts!.items!.length !== 1 ? 's' : ''} cadastrado${product.specificCosts!.items!.length !== 1 ? 's' : ''}`
                    : 'Nenhum cadastrado'}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-200 tabular-nums">{fmt(specificTotal)}</span>
          </div>

          {/* Separador */}
          <div className="h-px bg-white/10 mx-1" />

          {/* Total mensal */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/10 rounded-xl border border-white/10">
            <div className="flex items-center gap-2.5">
              <TrendingDown size={16} className="text-white" />
              <p className="text-base font-bold text-white">Custo Total Mensal</p>
            </div>
            <span className="text-xl font-bold text-white tabular-nums">{fmt(totalMensal)}</span>
          </div>

          {/* Custo diario */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={13} />
              <span className="text-sm">Custo diario medio</span>
            </div>
            <span className="text-sm font-bold text-slate-300 tabular-nums">{fmt(totalDiario)}</span>
          </div>

          {/* Interpretacao */}
          {totalMensal > 0 && (
            <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Interpretacao:</strong> Voce precisa gerar pelo menos{' '}
              <strong className="text-white">{fmt(totalMensal)}</strong> em comissoes liquidas por mes
              so para cobrir os custos deste produto. Cada comissao de{' '}
              <strong className="text-white">{fmt(product.commissionLiquid ?? 0)}</strong> contribui para isso.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

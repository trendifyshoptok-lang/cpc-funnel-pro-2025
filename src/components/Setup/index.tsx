import React, { useState } from 'react';
import { Save, Settings2, Briefcase, FileText, DollarSign, Calculator, Zap, ChevronDown, Package, ChevronRight, TrendingUp, Target, Flame, BadgePercent } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Product, Keyword, Ad, OperationalCosts } from '../../types';
import { CostsManager } from '../shared/CostsManager';

// Tabs
import { FichaTecnica } from './Tabs/FichaTecnica';
import { Custos } from './Tabs/Custos';
import { BreakEven } from './Tabs/BreakEven';
import { KeywordsSection } from './KeywordsSection';
import { NegativesSection } from './NegativesSection';
import { AdsSection } from './AdsSection';

interface SetupProps {
  product: Product | null;
  onUpdate: (product: Product) => void;
  fixedCosts: OperationalCosts;
  setFixedCosts: (costs: OperationalCosts) => void;
  globalFixedCostsTotal?: number;
  activeProductsCount?: number;
  monthlyTarget?: number;
  setMonthlyTarget?: (v: number) => void;
  onChangeTab?: (tab: string) => void;
  allProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
}

type ActiveTab = 'info' | 'custos' | 'breakeven' | 'keysads';

const Setup: React.FC<SetupProps> = ({
  product,
  onUpdate,
  fixedCosts,
  setFixedCosts,
  activeProductsCount = 1,
  monthlyTarget = 10000,
  setMonthlyTarget,
  onChangeTab,
  allProducts = [],
  onSelectProduct,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');
  const [keywords, setKeywords] = useState<Keyword[]>(product?.keywords || []);
  const [negativeKeywords, setNegativeKeywords] = useState<string>(product?.negativeKeywords || '');
  const [ads, setAds] = useState<Ad[]>(product?.ads || []);
  const [showProductPicker, setShowProductPicker] = useState(false);

  const handleSave = () => {
    if (!product) return;
    onUpdate({
      ...product,
      keywords,
      negativeKeywords,
      ads,
    } as Product);
    alert('Configuracao salva com sucesso!');
  };

  const handleProductUpdate = (field: string, value: any) => {
    if (!product) return;
    onUpdate({ ...product, [field]: value } as Product);
  };

  const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'info',      label: 'Info',       icon: <FileText size={15} /> },
    { id: 'custos',    label: 'Custos',     icon: <DollarSign size={15} /> },
    { id: 'breakeven', label: 'Break-Even', icon: <Calculator size={15} /> },
    { id: 'keysads',   label: 'Keys & Ads', icon: <Zap size={15} /> },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-20">

      {/* ══ ZONA 1 — CONFIGURACOES GLOBAIS ══ */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 size={15} className="text-blue-500" />
            <span className="text-sm font-bold text-slate-800">Configuracoes Globais</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Aplicado a todos os produtos</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Meta de Lucro Mensal</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                <input
                  type="number"
                  value={monthlyTarget}
                  onChange={e => setMonthlyTarget?.(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="10000"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">Usado no Dashboard para medir seu ritmo e gerar alertas</p>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Total Custos Fixos Globais</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl h-[42px]">
                <span className="text-xs text-slate-400 font-bold">R$</span>
                <span className="text-sm font-bold text-slate-800 tabular-nums">{(fixedCosts.total ?? 0).toFixed(2)}</span>
                <span className="text-2xs text-slate-400 ml-auto">mensal</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">Calculado automaticamente pelos itens abaixo</p>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <CostsManager costs={fixedCosts} setCosts={setFixedCosts} label="Custos Fixos Mensais" />
          </div>
        </div>
      </div>

      {/* ══ ZONA 2 — PRODUTO ATIVO ══ */}
      {!product ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center">
          <Briefcase size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-700 text-base mb-1">Nenhum produto selecionado</p>
          <p className="text-sm text-slate-400 mb-5">Selecione um produto no Portfolio para configurar os detalhes</p>
          <Button
            variant="primary"
            size="md"
            onClick={() => onChangeTab?.('portfolio')}
          >
            Ir para Portfolio
          </Button>
        </div>
      ) : (
        <>
          {/* ── Product Active Card — Dark Navy ── */}
          <div className="rounded-2xl overflow-hidden border border-slate-700/40 shadow-xl">

            {/* Dark navy header */}
            <div
              className="relative px-5 py-5 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #0E2233 50%, #0A1628 100%)' }}
            >
              {/* Dot matrix overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(34,211,238,0.06) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Content */}
              <div className="relative flex items-start justify-between gap-4 flex-wrap">
                {/* Left: label + name */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.25)' }}
                    >
                      <Package size={12} style={{ color: '#22D3EE' }} />
                    </div>
                    <span className="text-2xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(34,211,238,0.70)' }}>
                      Produto Ativo
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white leading-tight truncate">{product.name}</h2>

                  {/* Tags row */}
                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                    {product.nicho && (
                      <span
                        className="text-2xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        {product.nicho}
                      </span>
                    )}
                    {product.type && (
                      <span
                        className="text-2xs font-bold px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(34,211,238,0.10)', color: 'rgba(34,211,238,0.80)', border: '1px solid rgba(34,211,238,0.20)' }}
                      >
                        {product.type}
                      </span>
                    )}
                    {product.funnelStage && (
                      <span
                        className="text-2xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide"
                        style={{ background: 'rgba(139,92,246,0.15)', color: 'rgba(167,139,250,0.90)', border: '1px solid rgba(139,92,246,0.25)' }}
                      >
                        {product.funnelStage} de Funil
                      </span>
                    )}
                    {(product as any).platform && (
                      <span
                        className="text-2xs font-bold px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.10)' }}
                      >
                        {(product as any).platform}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Trocar button */}
                {allProducts.length > 1 && (
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowProductPicker(p => !p)}
                      className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      Trocar <ChevronDown size={11} />
                    </button>
                    {showProductPicker && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] min-w-[240px] max-h-72 overflow-y-auto">
                        {allProducts.map(p => (
                          <button
                            key={p.id}
                            onClick={() => { onSelectProduct?.(p); setShowProductPicker(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 ${p.id === product.id ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                          >
                            <span className="truncate">{p.name}</span>
                            {p.id === product.id && (
                              <span className="text-2xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Ativo</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Quick Stats row — inside dark card ── */}
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                {[
                  {
                    icon: <BadgePercent size={12} />,
                    label: 'Comissao',
                    value: `R$ ${product.commissionLiquid?.toFixed(2) || '0.00'}`,
                    accent: '#22D3EE',
                    accentBg: 'rgba(34,211,238,0.10)',
                    accentBorder: 'rgba(34,211,238,0.20)',
                  },
                  {
                    icon: <TrendingUp size={12} />,
                    label: 'CPC Bom',
                    value: `R$ ${product.cpcBom?.toFixed(2) || '0.00'}`,
                    accent: '#60A5FA',
                    accentBg: 'rgba(96,165,250,0.10)',
                    accentBorder: 'rgba(96,165,250,0.20)',
                  },
                  {
                    icon: <Flame size={12} />,
                    label: 'Poder de Fogo',
                    value: `${product.clicksPurchasable || 0} cliques`,
                    accent: '#F472B6',
                    accentBg: 'rgba(244,114,182,0.10)',
                    accentBorder: 'rgba(244,114,182,0.20)',
                  },
                  {
                    icon: <Target size={12} />,
                    label: 'Meta CR',
                    value: `${product.requiredCR?.toFixed(2) || '0.00'}%`,
                    accent: '#A78BFA',
                    accentBg: 'rgba(167,139,250,0.10)',
                    accentBorder: 'rgba(167,139,250,0.20)',
                  },
                ].map(s => (
                  <div
                    key={s.label}
                    className="rounded-xl px-3 py-2.5"
                    style={{ background: s.accentBg, border: `1px solid ${s.accentBorder}` }}
                  >
                    <div className="flex items-center gap-1.5 mb-1" style={{ color: s.accent }}>
                      {s.icon}
                      <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
                    </div>
                    <p className="text-sm font-bold tabular-nums" style={{ color: s.accent }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ ZONA 3 — TABS ══ */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Tab Nav */}
            <div className="border-b border-slate-200 bg-slate-50">
              <div className="flex overflow-x-auto scrollbar-hide">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-5 py-3.5 font-bold text-sm transition-all flex items-center gap-2 border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'info' && (
                <FichaTecnica product={product} />
              )}

              {activeTab === 'custos' && (
                <Custos
                  product={product}
                  globalCosts={fixedCosts}
                  activeProductsCount={activeProductsCount}
                  onUpdateProduct={handleProductUpdate}
                />
              )}

              {activeTab === 'breakeven' && (
                <BreakEven product={product} />
              )}

              {activeTab === 'keysads' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-full">
                      <KeywordsSection
                        keywords={keywords}
                        setKeywords={setKeywords}
                        product={product}
                      />
                      <NegativesSection
                        negativeKeywords={negativeKeywords}
                        setNegativeKeywords={setNegativeKeywords}
                        product={product}
                      />
                    </div>
                    <AdsSection
                      ads={ads}
                      setAds={setAds}
                      product={product}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              variant="save"
              size="lg"
              onClick={handleSave}
              iconLeft={<Save size={16} strokeWidth={2.5} />}
            >
              Salvar Configuracao
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export { Setup };
export default Setup;

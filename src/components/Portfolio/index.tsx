import React, { useState, useMemo, useEffect } from 'react';
import {
  Package, DollarSign, Target, TrendingUp, Award, AlertTriangle,
  Search, Filter, Download, LayoutGrid, Table2, X, Trash2,
  BarChart3, PieChart,
} from 'lucide-react';
import type { PortfolioProps, EnrichedProduct } from '../../types';
import { SegmentedControl } from '../ui';
import { enrichProducts, computePareto, exportToCSV, fmt, fmtPct } from './helpers';
import { ProductCard } from './ProductCard';
import { ProductSlideOver } from './ProductSlideOver';
import { PortfolioOptimizer } from './PortfolioOptimizer';
import { MiniSparkline } from './MiniSparkline';
import { ParetoModal } from './ParetoModal';

type SortField = 'name' | 'profit' | 'roi' | 'spend' | 'revenue' | 'campaignCount';
type SortDir = 'asc' | 'desc';
type FilterStatus = 'all' | 'profitable' | 'negative' | 'neutral';
type ActivityFilter = 'all' | 'active' | 'idle' | 'dormant' | 'never';

/* ── KPI card ── */
const KPICard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
  accent?: string;
}> = ({ icon, label, value, sub, color = 'text-slate-900', accent = 'bg-blue-100 text-blue-600' }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5">
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
    <div className={`text-3xl font-black tabular-nums leading-none ${color}`}>{value}</div>
    {sub && <div className="text-[11px] text-slate-400 mt-1.5">{sub}</div>}
  </div>
);

/* ── Sort button ── */
const SortBtn: React.FC<{
  label: string;
  field: SortField;
  current: SortField;
  dir: SortDir;
  onClick: (f: SortField) => void;
}> = ({ label, field, current, dir, onClick }) => (
  <button
    onClick={() => onClick(field)}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
      current === field
        ? 'bg-blue-600 text-white'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`}
  >
    {label} {current === field ? (dir === 'asc' ? '↑' : '↓') : ''}
  </button>
);

export const Portfolio: React.FC<PortfolioProps & { fixedCostsTotal?: number }> = ({
  products,
  history,
  onDeleteProduct,
  onSelectProductForAnalysis,
}) => {
  /* ── Tags & Notes (persisted in localStorage) ── */
  const [productTags, setProductTags] = useState<Record<string, string[]>>(() => {
    try { return JSON.parse(localStorage.getItem('portfolio_tags') ?? '{}'); } catch { return {}; }
  });
  const [productNotes, setProductNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('portfolio_notes') ?? '{}'); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('portfolio_tags', JSON.stringify(productTags));
  }, [productTags]);
  useEffect(() => {
    localStorage.setItem('portfolio_notes', JSON.stringify(productNotes));
  }, [productNotes]);

  /* ── UI state ── */
  const [slideOverId, setSlideOverId] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('profit');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterNicho, setFilterNicho] = useState('all');
  const [filterActivity, setFilterActivity] = useState<ActivityFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [paretoModalOpen, setParetoModalOpen] = useState(false);

  /* ── Enriched data ── */
  const enriched = useMemo(() => enrichProducts(products, history), [products, history]);
  const pareto = useMemo(() => computePareto(enriched), [enriched]);

  /* ── Pareto top products ── */
  const paretoProducts = useMemo(() => {
    const profitable = enriched
      .filter(p => p.profit > 0)
      .sort((a, b) => b.profit - a.profit);
    const count = Math.max(1, Math.ceil(profitable.length * 0.2));
    return profitable.slice(0, count);
  }, [enriched]);

  /* ── Global metrics ── */
  const totalSpend    = history.reduce((a, c) => a + c.spend, 0);
  const totalRevenue  = history.reduce((a, c) => a + c.revenue, 0);
  const totalFixedCosts = enriched.reduce((a, p) => a + (p.campaignCount > 0 ? p.fixedCosts : 0), 0);
  const totalProfit   = totalRevenue - totalSpend - totalFixedCosts;
  const totalInvestment = totalSpend + totalFixedCosts;
  const avgROI = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
  const totalCampaigns = history.length;

  /* ── Filtered + sorted list ── */
  const filtered = useMemo(() => {
    let list = enriched;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.nicho.toLowerCase().includes(q) ||
        (p.market ?? '').toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      if (filterStatus === 'profitable') list = list.filter(p => p.profit > 0);
      if (filterStatus === 'negative')   list = list.filter(p => p.profit < 0);
      if (filterStatus === 'neutral')    list = list.filter(p => p.profit === 0);
    }
    if (filterNicho !== 'all')           list = list.filter(p => p.nicho === filterNicho);
    if (filterActivity !== 'all')        list = list.filter(p => p.activityStatus === filterActivity);

    list = [...list].sort((a, b) => {
      const av = a[sortField as keyof EnrichedProduct] as string | number;
      const bv = b[sortField as keyof EnrichedProduct] as string | number;
      if (typeof av === 'string' && typeof bv === 'string')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc'
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });

    return list;
  }, [enriched, searchTerm, filterStatus, filterNicho, filterActivity, sortField, sortDir]);

  const uniqueNichos = Array.from(new Set(products.map(p => p.nicho)));
  const top3    = [...enriched].sort((a, b) => b.profit - a.profit).slice(0, 3);
  const bottom3 = [...enriched].sort((a, b) => a.profit - b.profit).slice(0, 3);
  const slideProduct = enriched.find(p => p.id === slideOverId) ?? null;

  /* ── Handlers ── */
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const toggleBulk = (id: string) => {
    setBulkSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Excluir ${bulkSelected.size} produto(s)? Esta acao nao pode ser desfeita.`)) return;
    bulkSelected.forEach(id => onDeleteProduct(id));
    setBulkSelected(new Set());
  };

  const addTag = (productId: string, tag: string) => {
    setProductTags(prev => ({
      ...prev,
      [productId]: [...(prev[productId] ?? []), tag],
    }));
  };
  const removeTag = (productId: string, tag: string) => {
    setProductTags(prev => ({
      ...prev,
      [productId]: (prev[productId] ?? []).filter(t => t !== tag),
    }));
  };
  const setNotes = (productId: string, notes: string) => {
    setProductNotes(prev => ({ ...prev, [productId]: notes }));
  };

  /* ────────────────────────────────────────── */

  /* ── scroll to top on mount ── */
  useEffect(() => {
    const el = document.querySelector('[data-scroll-area]') as HTMLElement | null;
    if (el) el.scrollTop = 0;
    else window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">

      {/* ══ ZONA 1 — KPIs ══ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard
          icon={<Package size={14} />}
          label="Produtos Ativos"
          value={products.length.toString()}
          sub={`${totalCampaigns} campanhas rodadas`}
          accent="bg-blue-100 text-blue-600"
        />
        <KPICard
          icon={<DollarSign size={14} />}
          label="Lucro Liquido"
          value={fmt(totalProfit)}
          sub={`Rec: ${fmt(totalRevenue)} | Ads: -${fmt(totalSpend)}`}
          color={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}
          accent="bg-green-100 text-green-600"
        />
        <KPICard
          icon={<Target size={14} />}
          label="ROI Medio"
          value={`${avgROI.toFixed(1)}%`}
          sub="Retorno sobre investimento"
          color={avgROI >= 0 ? 'text-blue-700' : 'text-red-600'}
          accent="bg-blue-100 text-blue-600"
        />
        <KPICard
          icon={<TrendingUp size={14} />}
          label="Investimento Total"
          value={fmt(totalInvestment)}
          sub={`Ads ${fmt(totalSpend)} + Fixos ${fmt(totalFixedCosts)}`}
          accent="bg-slate-100 text-slate-600"
        />
        {/* Pareto */}
        <div
          className={`bg-white rounded-2xl border p-5 col-span-2 md:col-span-1 transition-all duration-200 ${
            pareto.topCount > 0
              ? 'border-amber-200 cursor-pointer hover:border-amber-300 hover:shadow-[0_2px_12px_rgba(245,158,11,0.12)]'
              : 'border-slate-200'
          }`}
          onClick={() => pareto.topCount > 0 && setParetoModalOpen(true)}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <PieChart size={14} className="text-amber-600" />
            </div>
            <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">Concentração 80/20</span>
            {pareto.topCount > 0 && (
              <div className="ml-auto w-5 h-5 rounded-md border border-amber-200 flex items-center justify-center">
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                  <path d="M1 1L4 4L7 1" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
          {pareto.topCount > 0 ? (
            <>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                Top {pareto.topCount} produto{pareto.topCount !== 1 ? 's' : ''}
                <br />
                <span className="text-amber-600">→ {pareto.profitPct}% do lucro</span>
              </p>
              <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pareto.profitPct}%` }}
                />
              </div>
              <p className="text-2xs text-slate-400 mt-1">
                {pareto.topPct}% dos produtos · clique para detalhar
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Sem dados de lucro ainda</p>
          )}
        </div>
      </div>

      {/* ══ ZONA 2 — TOP / BOTTOM ══ */}
      {enriched.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-green-50 border-b border-green-100 flex items-center gap-2">
              <Award size={15} className="text-amber-500" />
              <span className="text-sm font-bold text-slate-800">Top Performers</span>
              <span className="text-[11px] text-slate-400 ml-auto">por lucro total</span>
            </div>
            <div className="p-4 space-y-2">
              {top3.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-green-50 transition-colors cursor-pointer border border-transparent hover:border-green-100"
                  onClick={() => setSlideOverId(p.id)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    i === 0 ? 'bg-amber-400 text-amber-900' :
                    i === 1 ? 'bg-slate-300 text-slate-700' :
                              'bg-orange-300 text-orange-800'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.nicho}</p>
                  </div>
                  <MiniSparkline data={p.sparklineData} width={52} height={22} />
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-green-600 tabular-nums">{fmt(p.profit)}</p>
                    <p className="text-[11px] text-slate-500">{fmtPct(p.roi)} ROI</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" />
              <span className="text-sm font-bold text-slate-800">Precisam Atencao</span>
              <span className="text-[11px] text-slate-400 ml-auto">menor desempenho</span>
            </div>
            <div className="p-4 space-y-2">
              {bottom3.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-100"
                  onClick={() => setSlideOverId(p.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-sm text-red-600 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.nicho}</p>
                  </div>
                  <MiniSparkline data={p.sparklineData} width={52} height={22} />
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold tabular-nums ${p.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fmt(p.profit)}
                    </p>
                    <p className="text-[11px] text-slate-500">{fmtPct(p.roi)} ROI</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ ZONA 3 — CONTROL BAR ══ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        {/* Row 1: search + view toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Buscar produto, nicho, mercado..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-300"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
              showFilters || filterStatus !== 'all' || filterNicho !== 'all' || filterActivity !== 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter size={13} /> Filtros
          </button>

          {/* View mode */}
          <SegmentedControl
            options={[
              { value: 'grid',  label: 'Grid',  icon: <LayoutGrid size={13} />, title: 'Visualização em grade' },
              { value: 'table', label: 'Lista',  icon: <Table2    size={13} />, title: 'Visualização em lista' },
            ]}
            value={viewMode}
            onChange={(v) => setViewMode(v as 'grid' | 'table')}
          />

          {/* Sort buttons */}
          <div className="flex gap-1.5 flex-wrap">
            <SortBtn label="Lucro"   field="profit"         current={sortField} dir={sortDir} onClick={handleSort} />
            <SortBtn label="ROI"     field="roi"            current={sortField} dir={sortDir} onClick={handleSort} />
            <SortBtn label="Camps."  field="campaignCount"  current={sortField} dir={sortDir} onClick={handleSort} />
            <SortBtn label="Nome"    field="name"           current={sortField} dir={sortDir} onClick={handleSort} />
          </div>
        </div>

        {/* Filters row */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as FilterStatus)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="all">Todos os Status</option>
              <option value="profitable">Lucrativos</option>
              <option value="negative">No Prejuizo</option>
              <option value="neutral">Neutros</option>
            </select>

            <select
              value={filterNicho}
              onChange={e => setFilterNicho(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="all">Todos os Nichos</option>
              {uniqueNichos.map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <select
              value={filterActivity}
              onChange={e => setFilterActivity(e.target.value as ActivityFilter)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="all">Toda Atividade</option>
              <option value="active">Ativo (ultimos 7d)</option>
              <option value="idle">Ocioso (8-30d)</option>
              <option value="dormant">Dormindo (30d+)</option>
              <option value="never">Nunca Rodou</option>
            </select>

            <button
              onClick={() => { setFilterStatus('all'); setFilterNicho('all'); setFilterActivity('all'); setSearchTerm(''); }}
              className="text-xs text-slate-500 hover:text-red-500 font-semibold flex items-center gap-1 transition-colors"
            >
              <X size={12} /> Limpar filtros
            </button>
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50 flex-wrap gap-2">
          <span className="text-[11px] text-slate-400">
            Mostrando <strong className="text-slate-700">{filtered.length}</strong> de{' '}
            <strong className="text-slate-700">{products.length}</strong> produtos
          </span>
          <div className="flex items-center gap-2">
            {bulkSelected.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 transition-colors"
              >
                <Trash2 size={12} /> Excluir {bulkSelected.size} selecionado{bulkSelected.size !== 1 ? 's' : ''}
              </button>
            )}
            <button
              onClick={() => exportToCSV(filtered)}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-200 transition-all disabled:opacity-40"
            >
              <Download size={12} /> Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* ══ ZONA 4 — LISTA ══ */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              isSelected={slideOverId === p.id}
              tags={productTags[p.id] ?? []}
              bulkSelected={bulkSelected.has(p.id)}
              onBulkToggle={() => toggleBulk(p.id)}
              onClick={() => setSlideOverId(id => id === p.id ? null : p.id)}
              onAnalyze={() => onSelectProductForAnalysis(p, 'analysis')}
              onSetup={() => onSelectProductForAnalysis(p, 'setup')}
              onDelete={() => onDeleteProduct(p.id)}
              onAddTag={tag => addTag(p.id, tag)}
              onRemoveTag={tag => removeTag(p.id, tag)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <BarChart3 size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-slate-500 mb-1">
                {products.length === 0 ? 'Sua pasta esta vazia' : 'Nenhum produto encontrado'}
              </p>
              <p className="text-sm text-slate-400">
                {products.length === 0
                  ? 'Va em "Mapeamento" para cadastrar seu primeiro produto'
                  : 'Tente ajustar os filtros ou a busca'}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── Table view ── */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="w-8 px-4 py-3">
                    <div className="w-4 h-4 rounded border-2 border-slate-300" />
                  </th>
                  {['Produto', 'Status', 'Lucro', 'ROI', 'ROAS', 'CR', 'Campanhas', 'Atividade', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSlideOverId(id => id === p.id ? null : p.id)}
                  >
                    <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleBulk(p.id); }}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer ${
                        bulkSelected.has(p.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                      }`}>
                        {bulkSelected.has(p.id) && <span className="text-white text-[9px] font-bold">✓</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800 truncate max-w-[180px]">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.nicho}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'excellent' ? 'bg-green-100 text-green-700' :
                        p.status === 'good'      ? 'bg-blue-100 text-blue-700' :
                        p.status === 'warning'   ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.status === 'excellent' ? 'Excelente' :
                         p.status === 'good'      ? 'Bom' :
                         p.status === 'warning'   ? 'Atencao' : 'Critico'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-black tabular-nums ${p.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fmt(p.profit)}
                    </td>
                    <td className={`px-4 py-3 font-bold tabular-nums ${p.roi >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                      {p.roi.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-slate-700 tabular-nums font-medium">{p.roas.toFixed(2)}x</td>
                    <td className="px-4 py-3 text-slate-700 tabular-nums font-medium">{p.cr.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-slate-700 tabular-nums">{p.campaignCount}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-[11px] font-bold ${
                        p.activityStatus === 'active'  ? 'text-green-600' :
                        p.activityStatus === 'idle'    ? 'text-yellow-600' :
                        p.activityStatus === 'dormant' ? 'text-orange-500' :
                        'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.activityStatus === 'active'  ? 'bg-green-500' :
                          p.activityStatus === 'idle'    ? 'bg-yellow-400' :
                          p.activityStatus === 'dormant' ? 'bg-orange-400' : 'bg-slate-300'
                        }`} />
                        {p.activityStatus === 'active' ? 'Ativo' :
                         p.activityStatus === 'idle'   ? 'Ocioso' :
                         p.activityStatus === 'dormant'? 'Dormindo' : 'Nunca Rodou'}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onSelectProductForAnalysis(p, 'analysis')}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Analise
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1 rounded-lg transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">
                Nenhum produto encontrado
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ZONA 5 — OTIMIZADOR ══ */}
      <div className="pt-4">
        {/* Section divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">
            Otimizador de Budget
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <PortfolioOptimizer products={products} history={history} />
      </div>

      {/* ══ SLIDE-OVER ══ */}
      {slideOverId && (
        <ProductSlideOver
          product={slideProduct}
          tags={productTags[slideOverId] ?? []}
          notes={productNotes[slideOverId] ?? ''}
          onClose={() => setSlideOverId(null)}
          onAnalyze={() => { onSelectProductForAnalysis(slideProduct!, 'analysis'); setSlideOverId(null); }}
          onSetup={() => { onSelectProductForAnalysis(slideProduct!, 'setup'); setSlideOverId(null); }}
          onAddTag={tag => addTag(slideOverId, tag)}
          onRemoveTag={tag => removeTag(slideOverId, tag)}
          onNotesChange={v => setNotes(slideOverId, v)}
        />
      )}

      {/* ══ PARETO MODAL ══ */}
      <ParetoModal
        isOpen={paretoModalOpen}
        paretoProducts={paretoProducts}
        topCount={pareto.topCount}
        profitPct={pareto.profitPct}
        topPct={pareto.topPct}
        onClose={() => setParetoModalOpen(false)}
        onProductClick={setSlideOverId}
      />

    </div>
  );
};

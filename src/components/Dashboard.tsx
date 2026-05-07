import React, { useState, useEffect, useMemo } from 'react';
import type { Campaign, Product } from '../types';
import { Card } from './ui/Card';
import { useAppMode } from '../contexts/AppModeContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
  PieChart,
  Pie,
} from 'recharts';
import {
  DollarSign,
  Activity,
  Target,
  FolderOpen,
  Filter,
  Wallet,
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  Search,
  Zap,
  AlertCircle,
  Users,
  ShoppingCart,
  Percent,
  MousePointer2,
  BarChart3,
  PieChart as PieIcon,
  Clock,
  RefreshCw,
  Crown,
  ChevronDown,
  FlaskConical,
  Trash2,
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  history: Campaign[];
  fixedCostsTotal?: number;
  monthlyTarget?: number;
  onLoadSeedData?: () => void;
  onClearSeedData?: () => void;
  hasSeedData?: boolean;
}

type PeriodFilter = 'today' | '7days' | '30days' | 'custom' | 'all';
type SortField = 'name' | 'campaignCount' | 'spend' | 'revenue' | 'profit' | 'roi';
type SortDirection = 'asc' | 'desc';

interface ProductPerformance {
  name: string;
  nicho: string;
  campaignCount: number;
  spend: number;
  revenue: number;
  profit: number;
  roi: number;
  conversions: number;
  clicks: number;
  cr: number;
  cpc: number;
}

interface TimelinePoint {
  date: string;
  revenue: number;
  spend: number;
  profit: number;
}

interface CalculationsResult {
  allProductPerformance: ProductPerformance[];
  totalAdsSpend: number;
  totalAdsRevenue: number;
  totalRevenueGlobal: number;
  totalSpendGlobal: number;
  netProfitGlobal: number;
  globalROI: number;
  globalCR: number;
  globalCPC: number;
  avgTicket: number;
  marginPercent: number;
  totalConversions: number;
  totalClicks: number;
  revenueGrowth: number;
  spendGrowth: number;
  profitGrowth: number;
  timelineData: TimelinePoint[];
  burnRate: number;
  projectedRevenue: number;
  projectedSpend: number;
  projectedProfit: number;
  healthScore: number;
}

// Helper: comparar mesmo dia (ignora horário)
const isSameDay = (d1: Date, d2: Date): boolean =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

// Memoizar componentes de gráfico (pequena otimização)
const MemoAreaChart = React.memo(AreaChart);
const MemoBarChart = React.memo(BarChart);
const MemoPieChart = React.memo(PieChart);

export const Dashboard: React.FC<DashboardProps> = ({
  products,
  history,
  fixedCostsTotal = 0,
  monthlyTarget = 10000,
  onLoadSeedData,
  onClearSeedData,
  hasSeedData,
}) => {
  const { isPro, toggleMode } = useAppMode();

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('7days');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('profit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // UI state
  const [showSecondaryMetrics, setShowSecondaryMetrics] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [perfChartTab, setPerfChartTab] = useState<'revenue' | 'profit' | 'roi'>('profit');
  const [expandedCharts, setExpandedCharts] = useState<Record<string, boolean>>({ timeline: true, performance: true });
  const toggleChart = (id: string) => setExpandedCharts(p => ({ ...p, [id]: !p[id] }));

  // --- FILTRO DE PERÍODO (filtra history) ---
  const filteredHistory = useMemo(() => {
    const now = new Date();

    const getDateDaysAgo = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date;
    };

    return history.filter((campaign) => {
      const campaignDate = new Date(campaign.date);

      switch (periodFilter) {
        case 'today':
          return isSameDay(campaignDate, now);

        case '7days':
          return campaignDate >= getDateDaysAgo(7);

        case '30days':
          return campaignDate >= getDateDaysAgo(30);

        case 'custom': {
          if (!customDateStart || !customDateEnd) return true;
          const start = new Date(customDateStart);
          const end = new Date(customDateEnd);
          end.setHours(23, 59, 59, 999);
          return campaignDate >= start && campaignDate <= end;
        }

        case 'all':
        default:
          return true;
      }
    });
  }, [history, periodFilter, customDateStart, customDateEnd]);

  // --- CÁLCULOS PRINCIPAIS (otimizados) ---
  const calculations: CalculationsResult = useMemo(() => {
    // Determinar quantos dias tem o período selecionado (para projeções, burn rate, etc.)
    const now = new Date();

    let periodDays: number;

    switch (periodFilter) {
      case 'today':
        periodDays = 1;
        break;

      case '7days':
        periodDays = 7;
        break;

      case '30days':
        periodDays = 30;
        break;

      case 'custom': {
        if (customDateStart && customDateEnd) {
          const start = new Date(customDateStart);
          const end = new Date(customDateEnd);
          const diffMs = end.getTime() - start.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
          periodDays = Math.max(diffDays, 1);
        } else {
          periodDays = 7;
        }
        break;
      }

      case 'all':
      default: {
        if (filteredHistory.length === 0) {
          periodDays = 7;
        } else {
          const dates = filteredHistory.map((c) => new Date(c.date));
          const minDate = new Date(
            Math.min.apply(
              null,
              dates.map((d) => d.getTime()),
            ),
          );
          const maxDate = new Date(
            Math.max.apply(
              null,
              dates.map((d) => d.getTime()),
            ),
          );
          const diffMs = maxDate.getTime() - minDate.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
          periodDays = Math.max(diffDays, 1);
        }
        break;
      }
    }

    // Totais de campanhas do período filtrado
    const totalAdsSpend = filteredHistory.reduce((acc, c) => acc + c.spend, 0);
    const totalAdsRevenue = filteredHistory.reduce(
      (acc, c) => acc + c.revenue,
      0,
    );
    const totalConversions = filteredHistory.reduce(
      (acc, c) => acc + c.conversions,
      0,
    );
    const totalClicks = filteredHistory.reduce((acc, c) => acc + c.clicks, 0);

    // Agregação por produto (otimizada)
    const aggregationMap = new Map<
      string,
      {
        spend: number;
        revenue: number;
        conversions: number;
        clicks: number;
        campaignCount: number;
      }
    >();

    for (const campaign of filteredHistory) {
      const key = campaign.productId;
      const current =
        aggregationMap.get(key) || {
          spend: 0,
          revenue: 0,
          conversions: 0,
          clicks: 0,
          campaignCount: 0,
        };

      current.spend += campaign.spend;
      current.revenue += campaign.revenue;
      current.conversions += campaign.conversions;
      current.clicks += campaign.clicks;
      current.campaignCount += 1;

      aggregationMap.set(key, current);
    }

    // Performance por produto
    const allProductPerformance: ProductPerformance[] = products.map((p) => {
      const agg =
        aggregationMap.get(p.id) || {
          spend: 0,
          revenue: 0,
          conversions: 0,
          clicks: 0,
          campaignCount: 0,
        };

      const profit = agg.revenue - agg.spend;
      const roi = agg.spend > 0 ? (profit / agg.spend) * 100 : 0;
      const cr = agg.clicks > 0 ? (agg.conversions / agg.clicks) * 100 : 0;
      const cpc = agg.clicks > 0 ? agg.spend / agg.clicks : 0;

      return {
        name: p.name,
        nicho: p.nicho,
        campaignCount: agg.campaignCount,
        spend: agg.spend,
        revenue: agg.revenue,
        profit,
        roi,
        conversions: agg.conversions,
        clicks: agg.clicks,
        cr,
        cpc,
      };
    });

    // Totais globais
    const totalRevenueGlobal = totalAdsRevenue;
    const totalSpendGlobal = totalAdsSpend + fixedCostsTotal; //  ALTERADO AQUI
    const netProfitGlobal = totalRevenueGlobal - totalSpendGlobal;

    const globalROI =
      totalSpendGlobal > 0 ? (netProfitGlobal / totalSpendGlobal) * 100 : 0;
    const globalCR =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const globalCPC = totalClicks > 0 ? totalAdsSpend / totalClicks : 0;
    const avgTicket =
      totalConversions > 0 ? totalAdsRevenue / totalConversions : 0;
    const marginPercent =
      totalRevenueGlobal > 0
        ? (netProfitGlobal / totalRevenueGlobal) * 100
        : 0;

    // Comparação com período anterior
    const previousPeriodHistory = history.filter((c) => {
      const date = new Date(c.date);
      const diffMs = now.getTime() - date.getTime();
      const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return daysAgo >= periodDays && daysAgo < periodDays * 2;
    });

    const prevRevenue = previousPeriodHistory.reduce(
      (acc, c) => acc + c.revenue,
      0,
    );
    const prevSpend = previousPeriodHistory.reduce(
      (acc, c) => acc + c.spend,
      0,
    );
    const prevProfit = prevRevenue - prevSpend;

    const revenueGrowth =
      prevRevenue > 0 ? ((totalAdsRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const spendGrowth =
      prevSpend > 0 ? ((totalAdsSpend - prevSpend) / prevSpend) * 100 : 0;

    const profitGrowth =
      prevProfit !== 0
        ? ((netProfitGlobal - prevProfit) / Math.abs(prevProfit)) * 100
        : 0;

    // Timeline: últimos "periodDays"
    const timelineData: TimelinePoint[] = [];
    for (let i = 0; i < periodDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (periodDays - 1 - i));

      const dayCampaigns = filteredHistory.filter((c) =>
        isSameDay(new Date(c.date), date),
      );

      const dayRevenue = dayCampaigns.reduce(
        (sum, c) => sum + c.revenue,
        0,
      );
      const daySpend = dayCampaigns.reduce((sum, c) => sum + c.spend, 0);
      const dayProfit = dayRevenue - daySpend;

      timelineData.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        revenue: dayRevenue,
        spend: daySpend,
        profit: dayProfit,
      });
    }

    // Burn rate (gasto médio por dia)
    const burnRate = periodDays > 0 ? totalAdsSpend / periodDays : 0;

    // Projeção mensal usando o mês real
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const projectedRevenue =
      periodDays > 0
        ? (totalAdsRevenue / periodDays) * daysInMonth
        : 0;

    const projectedSpend =
      periodDays > 0
        ? (totalAdsSpend / periodDays) * daysInMonth
        : 0;

    const projectedProfit = projectedRevenue - projectedSpend - fixedCostsTotal; //  ALTERADO AQUI

    // Health Score (0-100)
    let healthScore = 50;

    if (globalROI > 50) healthScore += 20;
    else if (globalROI > 20) healthScore += 10;
    else if (globalROI < 0) healthScore -= 20;

    if (netProfitGlobal > 0) healthScore += 15;
    else healthScore -= 15;

    if (globalCR > 2) healthScore += 15;
    else if (globalCR > 1) healthScore += 5;

    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      allProductPerformance: allProductPerformance,
      totalAdsSpend,
      totalAdsRevenue,
      totalRevenueGlobal,
      totalSpendGlobal,
      netProfitGlobal,
      globalROI,
      globalCR,
      globalCPC,
      avgTicket,
      marginPercent,
      totalConversions,
      totalClicks,
      revenueGrowth,
      spendGrowth,
      profitGrowth,
      timelineData,
      burnRate,
      projectedRevenue,
      projectedSpend,
      projectedProfit,
      healthScore,
    };
  }, [
    filteredHistory,
    products,
    fixedCostsTotal,
    periodFilter,
    history,
    customDateStart,
    customDateEnd,
  ]);

  // --- FILTRO E ORDENAÇÃO DE PRODUTOS (sem mutar array original) ---
  const displayedProducts = useMemo(() => {
    let filtered: ProductPerformance[] = [...calculations.allProductPerformance];

    if (selectedProducts.length > 0) {
      filtered = filtered.filter((p) => selectedProducts.includes(p.name));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.nicho.toLowerCase().includes(term),
      );
    }

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      const numA = Number(aVal) || 0;
      const numB = Number(bVal) || 0;

      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return filtered;
  }, [calculations.allProductPerformance, selectedProducts, searchTerm, sortField, sortDirection]);

 // --- INSIGHTS INTELIGENTES ---
  const insights = useMemo(() => {
    const alerts: Array<{
      type: 'danger' | 'warning' | 'success' | 'info';
      message: string;
    }> = [];

    const negativeProducts = calculations.allProductPerformance.filter(
      (p) => p.profit < 0,
    );
    if (negativeProducts.length > 0) {
      alerts.push({
        type: 'danger',
        message: `${negativeProducts.length} produto(s) operando no vermelho: ${negativeProducts
          .map((p) => p.name)
          .join(', ')}`,
      });
    }

    const excellentProducts = calculations.allProductPerformance.filter(
      (p) => p.roi > 100,
    );
    if (excellentProducts.length > 0) {
      alerts.push({
        type: 'success',
        message: `${excellentProducts.length} produto(s) com ROI acima de 100%! Considere escalar: ${excellentProducts
          .map((p) => p.name)
          .join(', ')}`,
      });
    }

    if (calculations.profitGrowth < -20) {
      alerts.push({
        type: 'warning',
        message: `Lucro caiu ${Math.abs(
          calculations.profitGrowth,
        ).toFixed(1)}% comparado ao período anterior`,
      });
    }

    if (calculations.spendGrowth > 50) {
      alerts.push({
        type: 'warning',
        message: `Atenção: Gastos aumentaram ${calculations.spendGrowth.toFixed(
          1,
        )}% neste período`,
      });
    }

    const daysElapsed = new Date().getDate();
    const expectedRevenue = (monthlyTarget / 30) * daysElapsed;

    if (
      expectedRevenue > 0 &&
      calculations.totalRevenueGlobal < expectedRevenue * 0.7
    ) {
      alerts.push({
        type: 'warning',
        message: `Receita está ${(
          (1 - calculations.totalRevenueGlobal / expectedRevenue) *
          100
        ).toFixed(0)}% abaixo do esperado para atingir a meta mensal`,
      });
    }

    if (calculations.globalCPC > 5) {
      alerts.push({
        type: 'info',
        message: `CPC médio de R$ ${calculations.globalCPC.toFixed(
          2,
        )} está elevado. Revise palavras-chave e segmentação`,
      });
    }

    return alerts;
  }, [calculations, monthlyTarget]);

  // Top 3 e Bottom 3
  const top3Products = [...calculations.allProductPerformance]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 3);

  const bottom3Products = [...calculations.allProductPerformance]
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 3);

  // Dados para gráfico de pizza
  const pieData = calculations.allProductPerformance.map((p) => ({
    name: p.name,
    value: p.spend,
  }));

  // --- HANDLERS ---
  const toggleProductFilter = (productName: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productName)
        ? prev.filter((n) => n !== productName)
        : [...prev, productName],
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Produto',
      'Nicho',
      'Campanhas',
      'Gasto',
      'Receita',
      'Lucro',
      'ROI%',
      'Conversões',
      'CR%',
      'CPC',
    ];

    const rows = displayedProducts.map((p) => [
      p.name,
      p.nicho,
      p.campaignCount,
      p.spend.toFixed(2),
      p.revenue.toFixed(2),
      p.profit.toFixed(2),
      p.roi.toFixed(1),
      p.conversions,
      p.cr.toFixed(2),
      p.cpc.toFixed(2),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'num-positive';
    if (score >= 60) return 'num-warning';
    if (score >= 40) return 'num-warning';
    return 'num-negative';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getInsightStyles = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-red-50 border-red-500';
      case 'warning': return 'bg-yellow-50 border-yellow-500';
      case 'success': return 'bg-green-50 border-green-500';
      default: return 'bg-blue-50 border-blue-500';
    }
  };

  const progressPercent =
    monthlyTarget > 0
      ? (calculations.projectedProfit / monthlyTarget) * 100
      : 0;

  const progressPercentClamped = Math.min(
    100,
    Math.max(0, progressPercent),
  );

  // Cores do health score
  const healthColor = calculations.healthScore >= 80 ? '#10B981'
    : calculations.healthScore >= 60 ? '#F59E0B'
    : calculations.healthScore >= 40 ? '#F97316'
    : '#EF4444';

  const healthLabel = calculations.healthScore >= 80 ? 'Excelente'
    : calculations.healthScore >= 60 ? 'Bom'
    : calculations.healthScore >= 40 ? 'Atencao'
    : 'Critico';

  // Dados do gráfico de performance por produto
  const perfChartData = displayedProducts.slice(0, 8).map(p => ({
    name: p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name,
    value: perfChartTab === 'revenue' ? p.revenue
         : perfChartTab === 'profit'  ? p.profit
         : p.roi,
    isNeg: perfChartTab !== 'revenue' && (perfChartTab === 'profit' ? p.profit < 0 : p.roi < 0),
  }));

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - new Date().getDate();

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          ZONE 0 —” TOPBAR: Plano · Período · Health · Ações
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="flex flex-wrap items-center gap-2 justify-between">

        {/* Badge de plano —” esquerda */}
        {isPro ? (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.20)",
            }}
          >
            <Zap size={12} style={{ color: "#7C3AED" }} />
            <span className="text-[11px] font-bold uppercase" style={{ color: "#7C3AED", letterSpacing: "0.06em" }}>
              Plano Pro
            </span>
            <span className="text-[11px]" style={{ color: "rgba(124,58,237,0.70)" }}>
              —” Analise completa ativa
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: "rgba(245,158,11,0.07)",
              border: "1px solid rgba(245,158,11,0.22)",
            }}
          >
            <Zap size={12} style={{ color: "#F59E0B" }} />
            <span className="text-[11px] font-bold uppercase" style={{ color: "#F59E0B", letterSpacing: "0.06em" }}>
              Plano Free
            </span>
            <span className="text-[11px]" style={{ color: "rgba(245,158,11,0.80)" }}>
              —” Analise, Simulador e Comparador bloqueados.
            </span>
            <button
              onClick={toggleMode}
              className="text-[11px] font-bold underline"
              style={{ color: "#7C3AED" }}
            >
              Fazer upgrade Pro
            </button>
          </div>
        )}

        {/* Chips de período —” centro */}
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { value: 'today',  label: 'Hoje' },
            { value: '7days',  label: '7 dias' },
            { value: '30days', label: '30 dias' },
            { value: 'all',    label: 'Tudo' },
            { value: 'custom', label: 'Custom' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodFilter(p.value as PeriodFilter)}
              className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: periodFilter === p.value ? "var(--accent)" : "var(--bg-subtle)",
                color: periodFilter === p.value ? "#fff" : "var(--text-muted)",
                border: `1px solid ${periodFilter === p.value ? "var(--accent)" : "var(--border-subtle)"}`,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Health pill + settings + export —” direita */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: `${healthColor}18`, border: `1px solid ${healthColor}40` }}
          >
            <Activity size={11} style={{ color: healthColor }} />
            <span className="text-[11px] font-bold tnum" style={{ color: healthColor }}>
              {calculations.healthScore} {healthLabel}
            </span>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Download size={11} />
            CSV
          </button>
        </div>
      </div>

      {/* Datas customizadas */}
      {periodFilter === 'custom' && (
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={13} style={{ color: "var(--text-muted)" }} />
          <input
            type="date"
            value={customDateStart}
            onChange={(e) => setCustomDateStart(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}
          />
          <span style={{ fontSize: 12 }}>ate</span>
          <input
            type="date"
            value={customDateEnd}
            onChange={(e) => setCustomDateEnd(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}
          />
        </div>
      )}


      {/* Banner seed data */}
      {products.length === 0 && onLoadSeedData && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.10) 0%, rgba(14,116,144,0.06) 100%)", border: "1px solid rgba(6,182,212,0.22)" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FlaskConical size={16} style={{ color: "#06B6D4", flexShrink: 0 }} />
              <div>
                <p className="text-[13px] font-semibold text-slate-900">Sem dados ainda</p>
                <p className="text-[11px] mt-0.5 text-slate-500">Carregue dados de demonstracao para ver todos os graficos</p>
              </div>
            </div>
            <button
              onClick={onLoadSeedData}
              className="px-4 py-2 rounded-xl text-[12px] font-bold flex-shrink-0 hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", color: "#fff", boxShadow: "0 2px 8px rgba(6,182,212,0.30)" }}
            >
              Carregar exemplo
            </button>
          </div>
        </div>
      )}
      {hasSeedData && onClearSeedData && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
          <div className="flex items-center gap-2">
            <CheckCircle size={12} style={{ color: "#10B981" }} />
            <span className="text-[11px] text-slate-600">Dados de exemplo ativos</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onLoadSeedData} className="text-[11px] px-2 py-0.5 rounded" style={{ color: "#10B981", background: "rgba(16,185,129,0.10)" }}>Recarregar</button>
            <button onClick={onClearSeedData} className="text-[11px] px-2 py-0.5 rounded" style={{ color: "#EF4444", background: "rgba(239,68,68,0.08)" }}>Limpar</button>
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          ZONE 1 —” HEADLINE: Lucro + Projeção
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Card Lucro Líquido Real */}
        <div
          className="rounded-[18px] p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0A0E1A 0%, #0E2233 55%, #0A1628 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(34,211,238,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative">
            <p className="text-2xs font-bold uppercase mb-3" style={{ color: "rgba(34,211,238,0.60)", letterSpacing: "0.14em" }}>
              Lucro Liquido Real
            </p>
            <p
              className="tnum text-[2rem] font-black leading-none"
              style={{ color: calculations.netProfitGlobal >= 0 ? "#34d399" : "#f87171" }}
            >
              R$ {calculations.netProfitGlobal.toFixed(2)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {calculations.profitGrowth >= 0
                ? <TrendingUp size={12} style={{ color: "#34d399" }} />
                : <TrendingDown size={12} style={{ color: "#f87171" }} />}
              <span className="tnum text-[12px] font-bold" style={{ color: calculations.profitGrowth >= 0 ? "#34d399" : "#f87171" }}>
                {calculations.profitGrowth >= 0 ? '+' : ''}{calculations.profitGrowth.toFixed(1)}%
              </span>
              <span className="text-[11px]" style={{ color: "rgba(250,250,249,0.35)" }}>vs período anterior</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <p className="text-2xs font-bold uppercase" style={{ color: "rgba(250,250,249,0.35)", letterSpacing: "0.10em" }}>Margem</p>
                <p className="tnum text-[14px] font-bold mt-0.5" style={{ color: "#FFFFFF" }}>{calculations.marginPercent.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase" style={{ color: "rgba(250,250,249,0.35)", letterSpacing: "0.10em" }}>Receita</p>
                <p className="tnum text-[14px] font-bold mt-0.5" style={{ color: "#34d399" }}>R$ {calculations.totalRevenueGlobal.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase" style={{ color: "rgba(250,250,249,0.35)", letterSpacing: "0.10em" }}>Custo</p>
                <p className="tnum text-[14px] font-bold mt-0.5" style={{ color: "#f87171" }}>R$ {calculations.totalSpendGlobal.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Projeção */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-2xs font-bold uppercase" style={{ letterSpacing: "0.14em" }}>
              Projecao Fim do Mes
            </p>
            <span className="text-[11px] text-slate-500">
              {daysRemaining}d restantes
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="metric-label">Receita Proj.</p>
              <p className="tnum text-[15px] font-bold mt-0.5" style={{ color: "var(--success)" }}>R$ {calculations.projectedRevenue.toFixed(0)}</p>
            </div>
            <div>
              <p className="metric-label">Custo Proj.</p>
              <p className="tnum text-[15px] font-bold mt-0.5" style={{ color: "var(--danger)" }}>R$ {calculations.projectedSpend.toFixed(0)}</p>
            </div>
            <div>
              <p className="metric-label">Lucro Proj.</p>
              <p className="tnum text-[15px] font-bold mt-0.5" style={{ color: calculations.projectedProfit >= 0 ? "var(--success)" : "var(--danger)" }}>R$ {calculations.projectedProfit.toFixed(0)}</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="metric-label">Meta: R$ {monthlyTarget.toFixed(0)}</p>
              <p className="tnum text-[12px] font-bold" style={{ color: progressPercent >= 100 ? "var(--success)" : "var(--accent)" }}>
                {progressPercent.toFixed(0)}%
              </p>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: "var(--bg-subtle)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPercentClamped}%`,
                  background: progressPercent >= 100 ? "var(--success)" : "linear-gradient(90deg, var(--accent), #06B6D4)",
                }}
              />
            </div>
          </div>
          {insights.length > 0 && (
            <button
              onClick={() => setShowInsights(s => !s)}
              className="flex items-center gap-1.5 mt-3 pt-3 w-full transition-all"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <span
                className="flex items-center justify-center w-4 h-4 rounded-full text-2xs font-bold flex-shrink-0"
                style={{ background: insights.some(i => i.type === 'danger') ? "#EF4444" : insights.some(i => i.type === 'warning') ? "#F59E0B" : "#10B981", color: "#fff" }}
              >
                {insights.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                {showInsights ? 'Ocultar alertas' : `Ver ${insights.length} alerta${insights.length > 1 ? 's' : ''}`}
              </span>
              <ChevronDown size={12} className={`ml-auto transition-transform ${showInsights ? 'rotate-180' : ''}`} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>
      </div>

      {/* Alertas expandidos */}
      {showInsights && insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{
                background: insight.type === 'danger' ? "rgba(239,68,68,0.06)"
                  : insight.type === 'warning' ? "rgba(245,158,11,0.06)"
                  : insight.type === 'success' ? "rgba(16,185,129,0.06)"
                  : "rgba(59,130,246,0.06)",
                border: `1px solid ${insight.type === 'danger' ? "rgba(239,68,68,0.20)"
                  : insight.type === 'warning' ? "rgba(245,158,11,0.20)"
                  : insight.type === 'success' ? "rgba(16,185,129,0.20)"
                  : "rgba(59,130,246,0.20)"}`,
              }}
            >
              {insight.type === 'danger' && <AlertTriangle size={14} style={{ color: "#EF4444", flexShrink: 0, marginTop: 2 }} />}
              {insight.type === 'warning' && <AlertCircle size={14} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 2 }} />}
              {insight.type === 'success' && <CheckCircle size={14} style={{ color: "#10B981", flexShrink: 0, marginTop: 2 }} />}
              {insight.type === 'info' && <Activity size={14} style={{ color: "#3B82F6", flexShrink: 0, marginTop: 2 }} />}
              <p className="text-[12px]" style={{ lineHeight: 1.5 }}>{insight.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          ZONE 2 —” 4 KPI CARDS ESSENCIAIS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Receita Global",
            value: `R$ ${calculations.totalRevenueGlobal.toFixed(2)}`,
            delta: calculations.revenueGrowth,
            icon: DollarSign,
            color: "var(--num-volume)",
            colorSoft: "var(--bg-subtle)",
          },
          {
            label: "Custo Total",
            value: `R$ ${calculations.totalSpendGlobal.toFixed(2)}`,
            delta: -calculations.spendGrowth,
            icon: Activity,
            color: "var(--danger)",
            colorSoft: "var(--danger-soft)",
          },
          {
            label: "ROI Global",
            value: `${calculations.globalROI.toFixed(1)}%`,
            delta: calculations.globalROI,
            icon: Target,
            color: "#7C3AED",
            colorSoft: "rgba(124,58,237,0.10)",
          },
          {
            label: "Conv. Rate",
            value: `${calculations.globalCR.toFixed(2)}%`,
            delta: calculations.globalCR - 1,
            icon: Percent,
            color: "var(--accent)",
            colorSoft: "rgba(14,116,144,0.10)",
          },
        ].map(({ label, value, delta, icon: Icon, color, colorSoft }) => (
          <div key={label} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="metric-label">{label}</p>
              <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: colorSoft, color }}>
                <Icon size={14} />
              </div>
            </div>
            <p className="tnum text-[1.35rem] font-black leading-none" style={{ color }}>
              {value}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {delta >= 0
                ? <TrendingUp size={11} style={{ color: "var(--success)" }} />
                : <TrendingDown size={11} style={{ color: "var(--danger)" }} />}
              <span className="tnum text-2xs font-bold" style={{ color: delta >= 0 ? "var(--success)" : "var(--danger)" }}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
              </span>
              <span className="text-2xs text-slate-500">vs anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Métricas operacionais (colapsável) */}
      <div>
        <button
          onClick={() => setShowSecondaryMetrics(s => !s)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl transition-all hover:opacity-80"
          style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }}
        >
          <span className="text-[11px] font-semibold text-slate-500">
            Metricas Operacionais
          </span>
          <span className="text-2xs px-1.5 py-0.5 rounded ml-1" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            CPC · CR · Ticket · Conversoes · Cliques · Burn
          </span>
          <ChevronDown size={12} className={`ml-auto transition-transform ${showSecondaryMetrics ? 'rotate-180' : ''}`} style={{ color: "var(--text-muted)" }} />
        </button>
        {showSecondaryMetrics && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
            {[
              { label: "CPC Medio",    value: `R$${calculations.globalCPC.toFixed(2)}`,       icon: MousePointer2, color: "var(--accent)" },
              { label: "Ticket Medio", value: `R$${calculations.avgTicket.toFixed(2)}`,        icon: ShoppingCart,  color: "var(--success)" },
              { label: "Conversoes",   value: `${calculations.totalConversions}`,              icon: Target,        color: "#7C3AED" },
              { label: "Cliques",      value: `${calculations.totalClicks}`,                   icon: MousePointer2, color: "var(--accent)" },
              { label: "Burn/Dia",     value: `R$${calculations.burnRate.toFixed(0)}`,         icon: Clock,         color: "var(--warn)" },
              { label: "Campanhas",    value: `${filteredHistory.length}`,                     icon: BarChart3,     color: "var(--danger)" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={10} style={{ color }} />
                  <p className="metric-label truncate">{label}</p>
                </div>
                <p className="tnum text-[14px] font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          ZONE 3 —” GRÁFICOS (sempre abertos)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Evolução Temporal */}
        <div className="card overflow-hidden">
          <button
            onClick={() => toggleChart('timeline')}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-700 flex items-center justify-center flex-shrink-0">
                <Activity size={13} className="text-white" />
              </div>
              <div className="text-left">
                <p className="section-title leading-none">Evolução Temporal</p>
                <p className="metric-label mt-0.5">Receita e gasto dia a dia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-500">Receita:</span>
                <span className="tnum font-bold text-cyan-700">
                  R$ {calculations.timelineData.reduce((s, d) => s + d.revenue, 0).toFixed(0)}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">Gasto:</span>
                <span className="tnum font-bold num-negative">
                  R$ {calculations.timelineData.reduce((s, d) => s + d.spend, 0).toFixed(0)}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${expandedCharts['timeline'] ? 'rotate-180' : ''}`}
              />
            </div>
          </button>
          {expandedCharts['timeline'] && (
            <div className="px-5 pb-5 border-t border-slate-100">
              <div className="h-[220px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <MemoAreaChart data={calculations.timelineData}>
                    <defs>
                      <linearGradient id="grRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0E7490" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#0E7490" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="grSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tick={{ fill: "var(--text-muted)" }} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tick={{ fill: "var(--text-muted)" }} />
                    <Tooltip
                      formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']}
                      contentStyle={{ borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#0E7490" strokeWidth={1.5} fill="url(#grRevenue)" name="Receita" />
                    <Area type="monotone" dataKey="spend"   stroke="#DC2626" strokeWidth={1.5} fill="url(#grSpend)"   name="Gasto" />
                  </MemoAreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Performance por Produto (tabbed) */}
        <div className="card overflow-hidden">
          <button
            onClick={() => toggleChart('performance')}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={13} className="text-white" />
              </div>
              <div className="text-left">
                <p className="section-title leading-none">Performance por Produto</p>
                <p className="metric-label mt-0.5">{perfChartData.length} produto{perfChartData.length !== 1 ? 's' : ''} · {perfChartTab === 'roi' ? 'ROI %' : perfChartTab === 'profit' ? 'Lucro' : 'Receita'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Tab pills — always visible in header */}
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                {([
                  { id: 'profit',  label: 'Lucro' },
                  { id: 'revenue', label: 'Receita' },
                  { id: 'roi',     label: 'ROI %' },
                ] as { id: 'profit' | 'revenue' | 'roi'; label: string }[]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setPerfChartTab(tab.id); setExpandedCharts(p => ({ ...p, performance: true })); }}
                    className="px-2.5 py-1 rounded-lg text-2xs font-semibold transition-all"
                    style={{
                      background: perfChartTab === tab.id ? "var(--accent)" : "var(--bg-subtle)",
                      color: perfChartTab === tab.id ? "#fff" : "var(--text-muted)",
                      border: `1px solid ${perfChartTab === tab.id ? "var(--accent)" : "var(--border-subtle)"}`,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${expandedCharts['performance'] ? 'rotate-180' : ''}`}
              />
            </div>
          </button>
          {expandedCharts['performance'] && (
            <div className="px-5 pb-5 border-t border-slate-100">
              <div className="h-[220px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <MemoBarChart data={perfChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-subtle)" />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tick={{ fill: "var(--text-muted)" }} />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={10} width={90} tick={{ fill: "var(--text-muted)" }} />
                    <Tooltip
                      formatter={(value) => [perfChartTab === 'roi' ? `${Number(value).toFixed(1)}%` : `R$ ${Number(value).toFixed(2)}`, '']}
                      contentStyle={{ borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', fontSize: 11 }}
                    />
                    <Bar dataKey="value" name={perfChartTab === 'roi' ? 'ROI %' : perfChartTab === 'profit' ? 'Lucro' : 'Receita'} radius={[0, 4, 4, 0]}>
                      {perfChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isNeg ? '#DC2626' : '#0E7490'} />
                      ))}
                    </Bar>
                  </MemoBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Produtos —” lista ranqueada */}
      {calculations.allProductPerformance.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown size={14} style={{ color: "#F59E0B" }} />
              <p className="section-title">Ranking de Produtos</p>
            </div>
            <span className="text-[11px] text-slate-500">
              {calculations.allProductPerformance.length} produto{calculations.allProductPerformance.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {[...calculations.allProductPerformance]
              .sort((a, b) => b.profit - a.profit)
              .slice(0, 5)
              .map((p, idx) => {
                const maxProfit = Math.max(...calculations.allProductPerformance.map(x => Math.abs(x.profit)), 1);
                const barW = Math.abs(p.profit) / maxProfit * 100;
                const isPos = p.profit >= 0;
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold flex-shrink-0"
                      style={{
                        background: idx === 0 ? "#F59E0B" : idx === 1 ? "#94A3B8" : idx === 2 ? "#CD7C2F" : "var(--bg-subtle)",
                        color: idx < 3 ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[12px] font-semibold truncate text-slate-900">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="tnum text-[12px] font-bold" style={{ color: isPos ? "var(--success)" : "var(--danger)" }}>
                            {isPos ? '+' : ''}R$ {p.profit.toFixed(0)}
                          </span>
                          <span className="tnum text-2xs px-1.5 py-0.5 rounded" style={{ background: isPos ? "var(--success-soft)" : "var(--danger-soft)", color: isPos ? "var(--success)" : "var(--danger)" }}>
                            {p.roi.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "var(--bg-subtle)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barW}%`, background: isPos ? "var(--success)" : "var(--danger)" }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          ZONE 4 —” DETALHE: Tabela colapsável
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div>
        <button
          onClick={() => setShowTable(s => !s)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-2xl transition-all"
          style={{
            background: showTable ? "var(--bg-card)" : "var(--bg-subtle)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <FolderOpen size={14} style={{ color: "var(--accent)" }} />
          <span className="text-[12px] font-semibold text-slate-900">
            Detalhamento por Produto
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded ml-1" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }}>
            {calculations.allProductPerformance.length} produto{calculations.allProductPerformance.length > 1 ? 's' : ''}
          </span>
          <ChevronDown size={13} className={`ml-auto transition-transform ${showTable ? 'rotate-180' : ''}`} style={{ color: "var(--text-muted)" }} />
        </button>

        {showTable && (
          <div className="mt-2 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
            {/* Barra de busca e export */}
            <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar produto ou nicho..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-2 rounded-lg w-full text-[12px] outline-none"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1">
                <button
                  onClick={() => setSelectedProducts([])}
                  className="px-2.5 py-1 rounded-full text-2xs font-semibold transition-all"
                  style={{
                    background: selectedProducts.length === 0 ? "var(--accent)" : "var(--bg-subtle)",
                    color: selectedProducts.length === 0 ? "#fff" : "var(--text-muted)",
                    border: `1px solid ${selectedProducts.length === 0 ? "var(--accent)" : "var(--border-subtle)"}`,
                  }}
                >
                  Todos
                </button>
                {calculations.allProductPerformance.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => toggleProductFilter(p.name)}
                    className="px-2.5 py-1 rounded-full text-2xs font-semibold transition-all"
                    style={{
                      background: selectedProducts.includes(p.name) ? "var(--accent)" : "var(--bg-subtle)",
                      color: selectedProducts.includes(p.name) ? "#fff" : "var(--text-muted)",
                      border: `1px solid ${selectedProducts.includes(p.name) ? "var(--accent)" : "var(--border-subtle)"}`,
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold flex-shrink-0 hover:opacity-80 transition-all"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                <Download size={12} />
                CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead style={{ background: "var(--bg-subtle)" }}>
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-bold cursor-pointer hover:opacity-80 text-slate-600" onClick={() => handleSort('name')}>
                      Produto {sortField === 'name' && (sortDirection === 'asc' ? 'â†‘' : 'â†“')}
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-center text-slate-600">Nicho</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-right cursor-pointer hover:opacity-80 text-slate-600" onClick={() => handleSort('spend')}>
                      Gasto {sortField === 'spend' && (sortDirection === 'asc' ? 'â†‘' : 'â†“')}
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-right cursor-pointer hover:opacity-80 text-slate-600" onClick={() => handleSort('revenue')}>
                      Receita {sortField === 'revenue' && (sortDirection === 'asc' ? 'â†‘' : 'â†“')}
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-right cursor-pointer hover:opacity-80 text-slate-600" onClick={() => handleSort('profit')}>
                      Lucro {sortField === 'profit' && (sortDirection === 'asc' ? 'â†‘' : 'â†“')}
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-center cursor-pointer hover:opacity-80 text-slate-600" onClick={() => handleSort('roi')}>
                      ROI {sortField === 'roi' && (sortDirection === 'asc' ? 'â†‘' : 'â†“')}
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-center text-slate-600">CR%</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-center text-slate-600">CPC</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map((p, idx) => (
                    <tr key={idx} className="transition-colors" style={{ borderTop: "1px solid var(--border-subtle)" }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-subtle)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = ""}
                    >
                      <td className="px-5 py-3 text-[13px] font-bold text-slate-900">{p.name}</td>
                      <td className="px-5 py-3 text-[11px] text-center text-slate-500">{p.nicho}</td>
                      <td className="px-5 py-3 text-[12px] text-right tnum" style={{ color: "var(--danger)" }}>R$ {p.spend.toFixed(2)}</td>
                      <td className="px-5 py-3 text-[12px] text-right tnum" style={{ color: "var(--success)" }}>R$ {p.revenue.toFixed(2)}</td>
                      <td className="px-5 py-3 text-[13px] text-right tnum font-bold" style={{ color: p.profit >= 0 ? "var(--success)" : "var(--danger)" }}>
                        R$ {p.profit.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className="tnum text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: p.roi >= 50 ? "var(--success-soft)" : p.roi >= 0 ? "rgba(59,130,246,0.10)" : "var(--danger-soft)",
                            color: p.roi >= 50 ? "var(--success)" : p.roi >= 0 ? "#3B82F6" : "var(--danger)",
                          }}
                        >
                          {p.roi.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-center tnum text-slate-600">{p.cr.toFixed(2)}%</td>
                      <td className="px-5 py-3 text-[12px] text-center tnum text-slate-600">R$ {p.cpc.toFixed(2)}</td>
                    </tr>
                  ))}
                  {displayedProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-[12px] text-slate-500">
                        Nenhum produto corresponde aos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

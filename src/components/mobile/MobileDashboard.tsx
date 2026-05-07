import React, { useState, useRef } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Package,
  BarChart3,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MobileDashboardProps {
  totalRevenue: number;
  totalSpend: number;
  netProfit: number;
  roi: number;
  revenueGrowth: number;
  spendGrowth: number;
  profitGrowth: number;
  totalCampaigns: number;
  totalProducts: number;
  onRefresh?: () => void | Promise<void>;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  totalRevenue,
  totalSpend,
  netProfit,
  roi,
  revenueGrowth,
  spendGrowth,
  profitGrowth,
  totalCampaigns,
  totalProducts,
  onRefresh
}) => {
  const [showDetails, setShowDetails] = useState(true);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  
  const touchStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pull to Refresh Logic
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;
      
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
        setIsPulling(true);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(0);
      
      try {
        await onRefresh?.();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setIsPulling(false);
        }, 500);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  // KPI Cards Configuration
  const kpiCards = [
    {
      id: 1,
      title: 'Receita Total',
      value: totalRevenue,
      prefix: 'R$ ',
      suffix: '',
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      growth: revenueGrowth,
      growthLabel: 'vs período anterior',
      details: [
        { label: 'Crescimento', value: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%` },
        { label: 'Status', value: revenueGrowth >= 0 ? ' Crescendo' : ' Reduzindo' }
      ]
    },
    {
      id: 2,
      title: 'Custo Total',
      value: totalSpend,
      prefix: 'R$ ',
      suffix: '',
      icon: Activity,
      gradient: 'from-red-500 to-orange-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      growth: spendGrowth,
      growthLabel: 'vs período anterior',
      details: [
        { label: 'Variação', value: `${spendGrowth >= 0 ? '+' : ''}${spendGrowth.toFixed(1)}%` },
        { label: 'Status', value: spendGrowth > 0 ? '️ Aumentando' : ' Controlado' }
      ]
    },
    {
      id: 3,
      title: 'Lucro Líquido',
      value: netProfit,
      prefix: 'R$ ',
      suffix: '',
      icon: Target,
      gradient: netProfit >= 0 ? 'from-blue-500 to-cyan-600' : 'from-red-500 to-pink-600',
      textColor: netProfit >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: netProfit >= 0 ? 'bg-blue-50' : 'bg-red-50',
      borderColor: netProfit >= 0 ? 'border-blue-200' : 'border-red-200',
      growth: profitGrowth,
      growthLabel: 'vs período anterior',
      details: [
        { label: 'Margem', value: totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : '0%' },
        { label: 'Status', value: netProfit >= 0 ? ' Lucrativo' : ' Prejuízo' }
      ]
    },
    {
      id: 4,
      title: 'ROI Global',
      value: roi,
      prefix: '',
      suffix: '%',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      growth: null,
      growthLabel: 'Retorno sobre investimento',
      details: [
        { label: 'Performance', value: roi >= 50 ? ' Excelente' : roi >= 0 ? ' Positivo' : ' Negativo' },
        { label: 'Classificação', value: roi >= 100 ? 'Top 10%' : roi >= 50 ? 'Acima da média' : 'Atenção' }
      ]
    }
  ];

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto pb-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-20 flex justify-center transition-all duration-200"
        style={{ 
          transform: `translateY(${isPulling || isRefreshing ? pullDistance : -60}px)`,
          opacity: isPulling || isRefreshing ? 1 : 0
        }}
      >
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-b-2xl px-6 py-3 flex items-center gap-3">
          <RefreshCw 
            size={20} 
            className={`${isRefreshing ? 'animate-spin text-indigo-600' : 'text-gray-600'}`}
          />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {isRefreshing ? 'Atualizando...' : pullDistance > 80 ? 'Solte para atualizar' : 'Puxe para atualizar'}
          </span>
        </div>
      </div>

      {/* Header Compact */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900 text-white p-4 rounded-b-3xl shadow-lg mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black mb-1">Dashboard</h1>
            <p className="text-xs text-indigo-100">Visão geral do negócio</p>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors active:scale-95"
          >
            {showDetails ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="opacity-80" />
              <span className="text-xs opacity-80 font-semibold">Produtos</span>
            </div>
            <div className="text-2xl font-black">{totalProducts}</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="opacity-80" />
              <span className="text-xs opacity-80 font-semibold">Campanhas</span>
            </div>
            <div className="text-2xl font-black">{totalCampaigns}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-4 space-y-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          const isExpanded = expandedCard === card.id;
          
          return (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Gradient Top Bar */}
              <div className={`h-1.5 bg-gradient-to-r ${card.gradient}`} />
              
              {/* Card Content */}
              <div 
                className="p-5 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
                onClick={() => setExpandedCard(isExpanded ? null : card.id)}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      {card.title}
                    </p>
                    <h3 className={`text-3xl font-black ${card.textColor} dark:opacity-90`}>
                      {card.prefix}{Math.abs(card.value).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}{card.suffix}
                    </h3>
                  </div>
                  
                  <div className={`p-3 rounded-xl ${card.bgColor} dark:bg-opacity-20`}>
                    <Icon size={28} className={card.textColor} />
                  </div>
                </div>

                {/* Growth Indicator */}
                {showDetails && card.growth !== null && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      {card.growth >= 0 ? (
                        <TrendingUp size={16} className="text-green-500" />
                      ) : (
                        <TrendingDown size={16} className="text-red-500" />
                      )}
                      <span className={`text-sm font-bold ${
                        card.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {card.growth >= 0 ? '+' : ''}{card.growth.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{card.growthLabel}</span>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                )}

                {showDetails && card.growth === null && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{card.growthLabel}</span>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && showDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 animate-in fade-in duration-200">
                    {card.details.map((detail, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{detail.label}</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      {showDetails && (
        <div className="px-4 mt-6 mb-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <TrendingUp size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1"> Insight Rápido</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {netProfit >= 0 
                    ? `Seu negócio está lucrando R$ ${netProfit.toFixed(2)}! Continue assim.`
                    : `Atenção: Prejuízo de R$ ${Math.abs(netProfit).toFixed(2)}. Revise custos.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
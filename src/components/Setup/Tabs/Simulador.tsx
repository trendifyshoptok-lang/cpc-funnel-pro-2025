import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Target, Zap, DollarSign, MousePointer, ShoppingCart, Percent, Info } from 'lucide-react';
import { calculateProductMetrics } from '../../../services/logic';

interface Product {
  name?: string;
  price?: number;
  commissionPct?: number;
  commissionGross?: number;
  commissionLiquid?: number;
  cpcBom?: number;
  cpcInter?: number;
  cpcApert?: number;
  cpcRuim?: number;
  requiredCR?: number;
}

interface SimuladorProps {
  product: Product;
}

// Componente Tooltip inline
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Simulador: React.FC<SimuladorProps> = ({ product }) => {
  // Estados dos inputs
  const [budget, setBudget] = useState(100);
  const [cpc, setCpc] = useState(product.cpcBom || 1);
  const [cr, setCR] = useState(product.requiredCR || 2);

  // Validação de entrada
  const validBudget = Math.max(0, budget);
  const validCpc = Math.max(0.01, cpc);
  const validCr = Math.max(0, Math.min(100, cr));

  // CÁLCULO DINÂMICO: Quanto preciso converter AGORA para pagar esse CPC?
  const dynamicRequiredCR = (product.commissionLiquid && cpc > 0) 
    ? (cpc / product.commissionLiquid) * 100 
    : 0;

  // Calcular métricas
  const metrics = useMemo(() => {
  const commissionLiquid = product.commissionLiquid || 0;
  const clicks = Math.floor(validBudget / validCpc);
  const sales = Math.floor(clicks * (validCr / 100));
  const revenue = sales * commissionLiquid;
  const profit = revenue - validBudget;
  const roi = validBudget > 0 ? (profit / validBudget) * 100 : 0;
  
  return { clicks, sales, revenue, profit, roi };
}, [product, validBudget, validCpc, validCr]);

  // Determinar status (lucro/prejuízo/empate)
  const status = useMemo(() => {
    if (metrics.profit > 0) return 'profit';
    if (metrics.profit < 0) return 'loss';
    return 'breakeven';
  }, [metrics.profit]);

  const statusConfig = {
    profit: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-300',
      text: 'text-green-700',
      icon: '',
      message: 'Cenário lucrativo!'
    },
    loss: {
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-300',
      text: 'text-red-700',
      icon: '️',
      message: 'Cenário de prejuízo'
    },
    breakeven: {
      bg: 'from-yellow-50 to-amber-50',
      border: 'border-yellow-300',
      text: 'text-yellow-700',
      icon: '️',
      message: 'Break-even (empate)'
    }
  };

  const currentStatus = statusConfig[status];

  // Resetar para valores do produto
  const resetToDefaults = () => {
    setBudget(100);
    setCpc(product.cpcBom || 1);
    setCR(product.requiredCR || 2);
  };

  return (
    <div className="space-y-6">
      
      {/* Header com ícone */}
      <div className="bg-slate-800 text-white p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Calculator size={28} className="text-cyan-400" />
          <h2 className="text-2xl font-bold">Simulador de Break-Even</h2>
        </div>
        <p className="text-slate-400">
          Ajuste os parâmetros abaixo e veja o resultado em tempo real
        </p>
      </div>

      {/* Controles de Simulação */}
      <div className="bg-white p-6 rounded-xl border-2 border-slate-200 ">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-yellow-600" /> Parâmetros da Simulação
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Investimento */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              Investimento (R$)
              <Tooltip text="Quanto você vai investir em anúncios">
                <Info size={14} className="text-slate-400 cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-base font-bold transition-colors"
              min="0"
              step="10"
            />
            <div className="mt-1 text-xs text-slate-500">
              Exemplo: R$ 100, R$ 500, R$ 1000
            </div>
          </div>

          {/* CPC */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <MousePointer size={16} className="text-blue-600" />
              CPC (R$)
              <Tooltip text="Custo por clique que você espera pagar">
                <Info size={14} className="text-slate-400 cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={cpc}
              onChange={(e) => setCpc(Number(e.target.value))}
              className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-base font-bold transition-colors"
              min="0.01"
              step="0.01"
            />
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded font-bold ${
                cpc <= (product.cpcBom || 0) ? 'bg-green-100 text-green-700' :
                cpc <= (product.cpcInter || 0) ? 'bg-yellow-100 text-yellow-700' :
                cpc <= (product.cpcApert || 0) ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {cpc <= (product.cpcBom || 0) ? '✓ Bom' :
                 cpc <= (product.cpcInter || 0) ? ' Intermediário' :
                 cpc <= (product.cpcApert || 0) ? ' Apertado' : '✗ Ruim'}
              </span>
              <span className="text-slate-500">
                Ref: R$ {(product.cpcBom || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* CR - VERSÃO FINAL COM CORREÇÃO DE ORÇAMENTO */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Percent size={16} className="text-purple-600" />
              Taxa de Conversão (%)
              <Tooltip text="Percentual de cliques que viram vendas">
                <Info size={14} className="text-slate-400 cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={cr}
              onChange={(e) => setCR(Number(e.target.value))}
              className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-base font-bold transition-colors"
              min="0"
              max="100"
              step="0.1"
            />
            
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded font-bold ${
                // 1. Taxa ruim (matemática não fecha)
                cr < dynamicRequiredCR ? 'bg-red-100 text-red-700' : 
                
                // 2. CORREÇÃO: Taxa boa, mas Orçamento acabou antes da venda (Prejuízo Real)
                metrics.profit < 0 ? 'bg-orange-100 text-orange-800' :
                
                // 3. Lucro apertado
                cr < dynamicRequiredCR * 1.2 ? 'bg-yellow-100 text-yellow-700' : 
                
                // 4. Lucro Real
                'bg-green-100 text-green-700'
              }`}>
                {
                  cr < dynamicRequiredCR ? '️ Taxa Insuficiente' : 
                  metrics.profit < 0 ? ' Falta Orçamento' : 
                  cr < dynamicRequiredCR * 1.2 ? '️ Margem Apertada' : ' Lucro Real'
                }
              </span>
              
              <span className="text-slate-500">
                Min Teórico: {dynamicRequiredCR.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Botão Reset */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <Target size={16} />
            Restaurar Valores Padrão
          </button>
        </div>
      </div>

      {/* Resultado da Simulação */}
      <div className={`bg-gradient-to-br ${currentStatus.bg} p-6 rounded-xl border-2 ${currentStatus.border} shadow-lg`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">{currentStatus.icon}</div>
          <div>
            <h3 className={`text-xl font-bold ${currentStatus.text}`}>
              {currentStatus.message}
            </h3>
            <p className="text-sm text-slate-600">
              Resultado baseado nos parâmetros informados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Cliques */}
          <div className="bg-white p-4 rounded-lg border border-slate-200  hover: transition-shadow">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase mb-2">
              <MousePointer size={14} />
              Cliques
            </div>
            <div className="text-3xl font-black text-slate-900">
              {metrics.clicks}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              R$ {validBudget} ÷ R$ {validCpc.toFixed(2)}
            </div>
          </div>

          {/* Vendas */}
          <div className="bg-white p-4 rounded-lg border border-slate-200  hover: transition-shadow">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase mb-2">
              <ShoppingCart size={14} />
              Vendas
            </div>
            <div className="text-3xl font-black num-volume tabular-nums">
              {metrics.sales}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {metrics.clicks} × {validCr.toFixed(1)}%
            </div>
          </div>

          {/* Receita */}
          <div className="bg-white p-4 rounded-lg border border-slate-200  hover: transition-shadow">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase mb-2">
              <DollarSign size={14} />
              Receita
            </div>
            <div className="text-3xl font-black num-volume tabular-nums">
              R$ {metrics.revenue.toFixed(2)}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {metrics.sales} × R$ {(product.commissionLiquid || 0).toFixed(2)}
            </div>
          </div>

          {/* ROI */}
          <div className="bg-white p-4 rounded-lg border border-slate-200  hover: transition-shadow">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase mb-2">
              <TrendingUp size={14} />
              ROI
            </div>
            <div className={`text-3xl font-black tabular-nums ${
              metrics.roi >= 0 ? 'num-positive' : 'num-negative'
            }`}>
              {metrics.roi.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Lucro ÷ Investimento
            </div>
          </div>
        </div>

        {/* Resumo Final */}
        <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-start gap-3">
            <Calculator className={`flex-shrink-0 mt-0.5 ${currentStatus.text}`} size={20} />
            <div className="text-sm text-slate-800">
              <strong>Resumo:</strong> Com um investimento de <strong>R$ {validBudget.toFixed(2)}</strong>, 
              CPC de <strong>R$ {validCpc.toFixed(2)}</strong> e CR de <strong>{validCr.toFixed(1)}%</strong>, 
              você terá <strong>{metrics.clicks} cliques</strong>, gerando <strong>{metrics.sales} venda(s)</strong> e 
              receita de <strong className="num-volume tabular-nums">R$ {metrics.revenue.toFixed(2)}</strong>.
              {' '}Seu lucro será de{' '}
              <strong className={`tabular-nums ${metrics.profit >= 0 ? 'num-positive' : 'num-negative'}`}>
                R$ {metrics.profit.toFixed(2)}
              </strong>
              {' '}com ROI de{' '}
              <strong className={`tabular-nums ${metrics.roi >= 0 ? 'num-positive' : 'num-negative'}`}>
                {metrics.roi.toFixed(1)}%
              </strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Dicas */}
      <div className={`border-l-4 p-5 rounded-r-lg mt-6 transition-colors ${
        metrics.profit >= 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
      }`}>
        <h4 className={`font-bold mb-2 flex items-center gap-2 ${
          metrics.profit >= 0 ? 'text-green-900' : 'text-red-900'
        }`}>
          {metrics.profit >= 0 ? ' Cenário Lucrativo' : ' Cenário de Prejuízo'}
        </h4>
        
        <ul className={`text-sm space-y-2 ${metrics.profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
          <li>
            <strong>• Realidade do CPC:</strong> Com CPC de <b>R$ {validCpc.toFixed(2)}</b>, você precisa converter acima de <b>{dynamicRequiredCR.toFixed(2)}%</b> para empatar.
          </li>

          {dynamicRequiredCR > 2.5 ? (
            <li>
              <strong>• Alerta de Risco:</strong> Sua meta de conversão ({dynamicRequiredCR.toFixed(2)}%) está muito alta para e-commerce. Foque em baixar o CPC urgente!
            </li>
          ) : (
            <li>
              <strong>• Viabilidade:</strong> A meta de conversão ({dynamicRequiredCR.toFixed(2)}%) está dentro da média de mercado (1% a 2.5%). Sinal verde para testar.
            </li>
          )}

          <li>
             <strong>• Retorno:</strong> Cada R$ 1,00 investido está voltando 
             <strong> R$ {(metrics.revenue / (validBudget || 1)).toFixed(2)}</strong>.
          </li>
        </ul>
      </div>

    </div>
  );
};
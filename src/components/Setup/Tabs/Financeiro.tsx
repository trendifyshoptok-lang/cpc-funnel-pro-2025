import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Target, Calculator } from 'lucide-react';
import { calculateProductMetrics } from '../../../services/logic';

// Adaptador local para manter compatibilidade
const calculateBreakEvenLocal = (
  product: Product,
  budget: number,
  cpc: number
) => {
  const commissionLiquid = product.commissionLiquid || 0;
  
  if (cpc <= 0 || commissionLiquid <= 0) {
    return {
      totalClicks: 0,
      requiredCR: 0,
      salesNeeded: 0,
      revenueAtBreakEven: 0
    };
  }
  
  const totalClicks = Math.floor(budget / cpc);
  const salesNeeded = Math.ceil(budget / commissionLiquid);
  const requiredCR = totalClicks > 0 ? (salesNeeded / totalClicks) * 100 : 0;
  const revenueAtBreakEven = salesNeeded * commissionLiquid;
  
  return {
    totalClicks,
    requiredCR,
    salesNeeded,
    revenueAtBreakEven
  };
};

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

interface FinanceiroProps {
  product: Product;
  onUpdate: (field: string, value: any) => void;
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

export const Financeiro: React.FC<FinanceiroProps> = ({ product, onUpdate }) => {
  const [customBudget, setCustomBudget] = useState(100);
  const [customCPC, setCustomCPC] = useState(product.cpcBom || 0);

  // Calcular break-even
  const breakEvenData = useMemo(() => {
  return calculateBreakEvenLocal(product, customBudget, customCPC);
}, [product, customBudget, customCPC]);

  // Cenários de CR
  const scenarios = useMemo(() => {
    const commissionLiquid = product.commissionLiquid || 0;
    const crValues = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
    
    return crValues.map(cr => {
      const clicks = Math.floor(customBudget / customCPC);
      const sales = Math.floor(clicks * (cr / 100));
      const revenue = sales * commissionLiquid;
      const profit = revenue - customBudget;
      const roi = customBudget > 0 ? ((profit / customBudget) * 100) : 0;
      
      return { cr, clicks, sales, revenue, profit, roi };
    });
  }, [product.commissionLiquid, customBudget, customCPC]);

  return (
    <div className="space-y-6">
      
      {/* Seção de Investimento */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 ">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-green-600" /> Configuração de Investimento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Orçamento Mensal (R$)
              <Tooltip text="Quanto você pretende investir por mês neste produto">
                <AlertCircle size={14} className="inline ml-1 text-slate-400 cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={customBudget}
              onChange={(e) => setCustomBudget(Number(e.target.value))}
              className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-bold"
              min="0"
              step="10"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              CPC Estimado (R$)
              <Tooltip text="Custo por clique que você pretende trabalhar">
                <AlertCircle size={14} className="inline ml-1 text-slate-400 cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={customCPC}
              onChange={(e) => setCustomCPC(Number(e.target.value))}
              className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-bold"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Métricas de Break-Even */}
      <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target size={18} className="text-slate-600" /> Ponto de Equilíbrio (Break-Even)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Cliques Totais</div>
            <div className="text-2xl font-black num-volume tabular-nums">
              {breakEvenData.totalClicks}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              R$ {customBudget} ÷ R$ {customCPC.toFixed(2)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1 flex items-center gap-1">
              CR Necessária
              <Tooltip text="Taxa de conversão para empatar">
                <AlertCircle size={12} className="text-slate-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-2xl font-black num-warning tabular-nums">
              {breakEvenData.requiredCR.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Para break-even
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Vendas Necessárias</div>
            <div className="text-2xl font-black num-volume tabular-nums">
              {breakEvenData.salesNeeded}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Para empatar
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Receita Break-Even</div>
            <div className="text-2xl font-black num-volume tabular-nums">
              R$ {breakEvenData.revenueAtBreakEven.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              = Investimento
            </div>
          </div>
        </div>

        {/* Interpretação */}
        <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-start gap-3">
            <Calculator className="text-slate-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-slate-700">
              <strong>Interpretação:</strong> Com um investimento de R$ {customBudget} e CPC de R$ {customCPC.toFixed(2)}, 
              você terá {breakEvenData.totalClicks} cliques. Para empatar (break-even), precisa converter{' '}
              <strong>{breakEvenData.requiredCR.toFixed(2)}%</strong> desses cliques em vendas, 
              gerando {breakEvenData.salesNeeded} venda(s) e receita de R$ {breakEvenData.revenueAtBreakEven.toFixed(2)}.
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Cenários */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 ">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-600" /> Cenários de Conversão
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="text-left p-3 font-bold text-slate-700">CR (%)</th>
                <th className="text-left p-3 font-bold text-slate-700">Cliques</th>
                <th className="text-left p-3 font-bold text-slate-700">Vendas</th>
                <th className="text-left p-3 font-bold text-slate-700">Receita</th>
                <th className="text-left p-3 font-bold text-slate-700">Resultado</th>
                <th className="text-left p-3 font-bold text-slate-700">ROI</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b border-slate-100 hover:bg-slate-50 ${
                    scenario.profit >= 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <td className="p-3 font-bold">{scenario.cr.toFixed(1)}%</td>
                  <td className="p-3">{scenario.clicks}</td>
                  <td className="p-3 font-bold">{scenario.sales}</td>
                  <td className="p-3 num-volume font-bold tabular-nums">
                    R$ {scenario.revenue.toFixed(2)}
                  </td>
                  <td className={`p-3 font-bold tabular-nums ${
                    scenario.profit >= 0 ? 'num-positive' : 'num-negative'
                  }`}>
                    R$ {scenario.profit.toFixed(2)}
                  </td>
                  <td className={`p-3 font-bold tabular-nums ${
                    scenario.roi >= 0 ? 'num-positive' : 'num-negative'
                  }`}>
                    {scenario.roi.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-800">
              <strong> Análise de Viabilidade:</strong> Considerando o orçamento e CPC definidos acima, sua taxa mínima de conversão para não ter prejuízo (Break-Even) é de <strong>{breakEvenData.requiredCR.toFixed(2)}%</strong>. 
              Qualquer conversão acima deste valor gerará <strong>resultado positivo</strong>.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
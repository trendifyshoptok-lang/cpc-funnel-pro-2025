// @ts-nocheck
import React from 'react';
import { Calculator, Wallet, HelpCircle, Percent, AlertCircle, CheckCircle2, TrendingDown, DollarSign, Activity, MousePointer2, Target } from 'lucide-react';
import { Tooltip } from '../shared/Tooltip';
import type { OperationalCosts, Product } from '../../types';
import { calculateFinancialMetrics } from '../../services/logic';

interface CostsSectionProps {
  costs: OperationalCosts;
  setCosts: (costs: OperationalCosts) => void;
  estimatedCR: number;
  setEstimatedCR: (cr: number) => void;
  product: Product;
}

export const CostsSection: React.FC<CostsSectionProps> = ({
  costs,
  setCosts,
  estimatedCR,
  setEstimatedCR,
  product
}) => {
  // Usa o total calculado pela estrutura moderna (items[])
  const currentTotal = costs.total ?? 0;

  //  Cria um objeto temporário com o total atualizado
  const costsWithRealTimeTotal = {
    ...costs,
    total: currentTotal
  };

  //  Usa o objeto com total atualizado para os cálculos
  const financialMetrics = calculateFinancialMetrics(
    costsWithRealTimeTotal,
    product.commissionLiquid,
    product.manualBenchmarkCPC || product.cpcSuggested,
    estimatedCR
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Calculator size={20} className="text-indigo-600" /> Análise Financeira & Break-Even
        </h3>
        <div className="text-sm font-bold bg-white px-3 py-1 rounded border border-indigo-200 text-indigo-600">
          CF Total: <span className="text-slate-900">R$ {currentTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-6">
        {/* ESTADOS VAZIOS */}
        {currentTotal === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
            <Wallet size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">Preencha os custos fixos acima para ver a análise completa</p>
          </div>
        )}

        {/* ANÁLISE COMPLETA */}
        {financialMetrics && currentTotal > 0 && (
          <div className="space-y-6">
            {/* INDICADORES CRÍTICOS */}
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
              <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                <AlertCircle size={18} />
                ️ Indicadores Críticos
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Tooltip text="CR Mínima Necessária: A menor taxa de conversão que você precisa atingir para não ter prejuízo. Calculada como: (CPC ÷ Comissão) × 100. Se sua CR real for menor que isso, cada venda gera prejuízo!">
                  <div className="bg-white p-5 rounded-lg border-2 border-red-400 cursor-help">
                    <div className="text-xs text-red-600 font-bold mb-1 flex items-center gap-1">
                      <Percent size={12} />
                      CR MÍNIMA PARA NÃO TER PREJUÍZO
                    </div>
                    <div className="text-4xl font-black text-red-700">{financialMetrics.crMinimaParaBreakEven.toFixed(2)}%</div>
                    <div className="text-xs text-slate-700 mt-2 font-medium">
                      ️ Se sua CR for menor, você perde dinheiro a cada venda!
                    </div>
                  </div>
                </Tooltip>

                <Tooltip text="CPA Máximo: O valor máximo que você pode gastar para adquirir 1 cliente sem ter prejuízo. É igual à sua comissão líquida. Se gastar mais que isso por cliente, você perde dinheiro.">
                  <div className="bg-white p-5 rounded-lg border-2 border-purple-400 cursor-help">
                    <div className="text-xs text-purple-600 font-bold mb-1 flex items-center gap-1">
                      <Target size={12} />
                      CPA MÁXIMO (LIMITE)
                    </div>
                    <div className="text-4xl font-black text-purple-700">R$ {financialMetrics.cpaMaximo.toFixed(2)}</div>
                    <div className="text-xs text-slate-700 mt-2 font-medium">
                       Não gaste mais que isso por cliente!
                    </div>
                  </div>
                </Tooltip>
              </div>
            </div>

            {/* CAMPO CR OPCIONAL */}
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5">
              <label className="block text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                <Percent size={16} />
                Sua CR Esperada (Taxa de Conversão)
                <Tooltip text="Digite qual taxa de conversão você espera conseguir. Exemplo: 2% significa que a cada 100 cliques, você faz 2 vendas. Com base nisso, vamos calcular se é viável e quanto você precisa investir.">
                  <HelpCircle size={14} className="text-green-600 cursor-help" />
                </Tooltip>
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-green-400 rounded-lg text-lg bg-white text-green-900 font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="Ex: 2.5"
                    value={estimatedCR || ''}
                    onChange={e => setEstimatedCR(parseFloat(e.target.value) || 0)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 font-bold">%</span>
                </div>
                <div className="text-xs text-green-800 flex-1 font-medium">
                  <p className="font-bold mb-1"> Como definir?</p>
                  <p>Use dados do Mapeamento ou histórico. Fundo de funil geralmente converte mais!</p>
                </div>
              </div>
            </div>

            {/* ESTADO: CR NÃO INFORMADA */}
            {(!estimatedCR || estimatedCR === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-green-300 rounded-xl bg-green-50">
                <Percent size={40} className="mx-auto text-green-400 mb-3" />
                <p className="text-green-800 font-bold mb-1">Digite a CR esperada acima</p>
                <p className="text-green-700 text-sm">Vamos calcular todos os indicadores de break-even!</p>
              </div>
            )}

            {/* BREAK-EVEN COMPLETO */}
            {financialMetrics.crFornecida && financialMetrics.crFornecida > 0 && (
              <>
                {financialMetrics.isViable ? (
                  <div className="space-y-6">
                    {/* KPIs PRINCIPAIS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Tooltip text="CV (Custo Variável por Venda): Quanto você gasta em anúncios para conseguir 1 venda. Cálculo: CPC ÷ CR. Exemplo: CPC R$2,00 ÷ CR 2% = R$100,00 por venda.">
                        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 cursor-help hover:shadow-lg transition-shadow">
                          <div className="flex items-center gap-2 text-xs text-red-700 font-bold mb-2">
                            <TrendingDown size={14} />
                            CV (Custo por Venda)
                          </div>
                          <div className="text-3xl font-black text-red-800">
                            R$ {financialMetrics.custoVariavelPorVenda?.toFixed(2)}
                          </div>
                          <div className="text-2xs text-slate-700 mt-1 font-medium">
                            Gasto em ads por venda
                          </div>
                        </div>
                      </Tooltip>

                      <Tooltip text="MC (Margem de Contribuição): Quanto sobra de lucro em cada venda após pagar os anúncios. Cálculo: Comissão - CV. Exemplo: R$150 - R$100 = R$50 de margem.">
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 cursor-help hover:shadow-lg transition-shadow">
                          <div className="flex items-center gap-2 text-xs text-green-700 font-bold mb-2">
                            <DollarSign size={14} />
                            MC (Margem)
                          </div>
                          <div className="text-3xl font-black text-green-800">
                            R$ {financialMetrics.margemContribuicao?.toFixed(2)}
                          </div>
                          <div className="text-2xs text-slate-700 mt-1 font-medium">
                            Lucro por venda (após ads)
                          </div>
                        </div>
                      </Tooltip>

                      <Tooltip text="CPA Real: Custo real para adquirir 1 cliente com a CR que você informou. Igual ao CV. Se for maior que a Comissão, você tem prejuízo.">
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 cursor-help hover:shadow-lg transition-shadow">
                          <div className="flex items-center gap-2 text-xs text-orange-700 font-bold mb-2">
                            <Activity size={14} />
                            CPA Real
                          </div>
                          <div className="text-3xl font-black text-orange-800">
                            R$ {financialMetrics.cpaReal?.toFixed(2)}
                          </div>
                          <div className="text-2xs text-slate-700 mt-1 font-medium">
                            Custo por aquisição
                          </div>
                        </div>
                      </Tooltip>

                      <Tooltip text="CPC Máximo: O CPC máximo que você pode pagar com essa CR sem ter prejuízo. Cálculo: Comissão × CR. Se o CPC de mercado for maior, você precisa de uma CR melhor.">
                        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 cursor-help hover:shadow-lg transition-shadow">
                          <div className="flex items-center gap-2 text-xs text-purple-700 font-bold mb-2">
                            <MousePointer2 size={14} />
                            CPC Máximo
                          </div>
                          <div className="text-3xl font-black text-purple-800">
                            R$ {financialMetrics.cpcMaximo?.toFixed(2)}
                          </div>
                          <div className="text-2xs text-slate-700 mt-1 font-medium">
                            Limite de CPC viável
                          </div>
                        </div>
                      </Tooltip>
                    </div>

                    {/* BREAK-EVEN CARD */}
                    <div className="bg-slate-900 text-white rounded-xl p-6 shadow-2xl border-2 border-slate-700">
                      <div className="flex items-center gap-2 mb-4 text-yellow-400">
                        <Calculator size={22} />
                        <span className="text-base font-semibold uppercase tracking-widest">Break-Even (Ponto de Equilíbrio)</span>
                      </div>

                      <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700">
                        <p className="text-sm text-slate-300 leading-relaxed">
                          <strong className="text-white">Break-even</strong> é quando sua receita iguala seus gastos totais.
                          Após atingir esse ponto, <strong className="text-green-400">todo o resto é lucro puro</strong>! 
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <Tooltip text="Vendas Necessárias: Quantas vendas você precisa fazer para cobrir todos os custos fixos. Cálculo: Custos Fixos ÷ Margem de Contribuição.">
                          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 cursor-help hover:bg-slate-700/70 transition-colors">
                            <div className="text-xs text-slate-400 mb-2 font-bold uppercase">Vendas Necessárias</div>
                            <div className="text-4xl font-black text-white">{Math.ceil(financialMetrics.breakEvenVendas || 0)}</div>
                            <div className="text-xs text-slate-400 mt-2">vendas para empatar</div>
                          </div>
                        </Tooltip>

                        <Tooltip text="Cliques Necessários: Quantos cliques você precisa receber para atingir o break-even. Cálculo: Vendas Necessárias ÷ CR.">
                          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 cursor-help hover:bg-slate-700/70 transition-colors">
                            <div className="text-xs text-slate-400 mb-2 font-bold uppercase">Cliques Necessários</div>
                            <div className="text-4xl font-black text-white">{Math.ceil(financialMetrics.breakEvenCliques || 0).toLocaleString()}</div>
                            <div className="text-xs text-slate-400 mt-2">cliques totais</div>
                          </div>
                        </Tooltip>

                        <Tooltip text="Investimento em Anúncios: Quanto você vai gastar em Google Ads para atingir o break-even. Cálculo: Cliques Necessários × CPC.">
                          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 cursor-help hover:bg-slate-700/70 transition-colors">
                            <div className="text-xs text-slate-400 mb-2 font-bold uppercase">Gasto em Ads</div>
                            <div className="text-4xl font-black text-white">R$ {financialMetrics.gastoTotal?.toFixed(2)}</div>
                            <div className="text-xs text-slate-400 mt-2">investimento necessário</div>
                          </div>
                        </Tooltip>
                      </div>

                      <div className="bg-green-900/30 border-2 border-green-600 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 size={24} className="text-green-400 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-sm text-slate-200 font-bold mb-1"> O QUE ACONTECE APÓS O BREAK-EVEN?</p>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              A partir da venda <strong className="text-white text-lg">#{Math.ceil(financialMetrics.breakEvenVendas || 0) + 1}</strong>,
                              cada venda gera <strong className="text-green-400 text-lg">R$ {financialMetrics.margemContribuicao?.toFixed(2)}</strong> de
                              <strong className="text-green-300"> lucro líquido</strong> direto no seu bolso! 
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <Tooltip text="Investimento Total: Soma de todos os custos (fixos + anúncios) até o break-even.">
                            <div className="bg-slate-800/50 p-3 rounded cursor-help">
                              <span className="text-slate-400">Investimento Total:</span>
                              <span className="text-white font-black ml-2">R$ {((financialMetrics.gastoTotal || 0) + currentTotal).toFixed(2)}</span>
                            </div>
                          </Tooltip>
                          <Tooltip text="Receita no Break-Even: Quanto você vai faturar quando atingir o break-even (vendas × comissão).">
                            <div className="bg-slate-800/50 p-3 rounded cursor-help">
                              <span className="text-slate-400">Receita no BE:</span>
                              <span className="text-white font-black ml-2">R$ {((financialMetrics.breakEvenVendas || 0) * financialMetrics.comissao).toFixed(2)}</span>
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  //  INVIÁVEL
                  <div className="bg-red-900 text-white rounded-xl p-6 shadow-xl border-2 border-red-600">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-700 p-3 rounded-full flex-shrink-0">
                        <AlertCircle size={32} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black mb-3">️ INVIÁVEL COM CR {financialMetrics.crFornecida}%</h3>
                        <div className="bg-red-800/50 p-4 rounded-lg space-y-3 text-sm">
                          <p className="font-bold text-lg"> PROBLEMA IDENTIFICADO:</p>
                          <p>
                            O <strong>CPA Real (R$ {financialMetrics.cpaReal?.toFixed(2)})</strong> é
                            <strong> MAIOR</strong> que a <strong>Comissão (R$ {financialMetrics.comissao.toFixed(2)})</strong>
                          </p>
                          <p>
                            <strong>Margem de Contribuição:</strong> R$ {financialMetrics.margemContribuicao?.toFixed(2)}
                            <span className="text-yellow-300"> (NEGATIVA!)</span>
                          </p>
                          <div className="pt-3 border-t border-red-700">
                            <p className="font-bold mb-2"> ISSO SIGNIFICA:</p>
                            <p className="text-red-200">
                              Cada venda que você fizer vai gerar um <strong>prejuízo de R$ {Math.abs(financialMetrics.margemContribuicao || 0).toFixed(2)}</strong>!
                            </p>
                          </div>
                          <div className="pt-3 border-t border-red-700">
                            <p className="font-bold mb-2"> SOLUÇÃO:</p>
                            <p>
                              Aumente sua CR para <strong className="text-yellow-300 text-lg">no mínimo {financialMetrics.crMinimaParaBreakEven.toFixed(2)}%</strong>
                              {' '}ou reduza o CPC para viabilizar o produto.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
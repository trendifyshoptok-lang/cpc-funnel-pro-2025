import React from "react";
import { Target, Lightbulb, TrendingUp } from "lucide-react";
import type { Product, OperationalCosts } from "../../../types";

interface EstrategiaProps {
  product: Product;
  fixedCosts: OperationalCosts;
  fixedCostsTotal: number;
}

export const Estrategia: React.FC<EstrategiaProps> = ({
  product,
  fixedCosts,
  fixedCostsTotal,
}) => {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const dailyBreakEven =
    product.breakEven?.investmentAds
      ? product.breakEven.investmentAds / 30
      : null;

  const tips = [
    product.cpcBom > 0
      ? `Mantenha o CPC abaixo de ${fmt(product.cpcBom)} para manter lucratividade.`
      : null,
    product.viabilityStatus === "APROVADO"
      ? "Produto aprovado — bom potencial de escala."
      : product.viabilityStatus === "REPROVADO"
      ? "Produto reprovado — revise a comissao ou o CPC alvo."
      : "Produto em zona de risco — monitore de perto.",
    dailyBreakEven
      ? `Investimento diario minimo para break-even: ${fmt(dailyBreakEven)}.`
      : null,
    fixedCostsTotal > 0
      ? `Custos fixos mensais de ${fmt(fixedCostsTotal)} devem ser cobertos pelo lucro.`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Metas Sugeridas</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
              CPC Maximo
            </p>
            <p className="text-sm font-bold text-emerald-600 tabular-nums">
              {fmt(product.cpcBom)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
              Comissao Liquida
            </p>
            <p className="text-sm font-bold text-blue-600 tabular-nums">
              {fmt(product.commissionLiquid ?? product.commissionValue)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
              CR Minima
            </p>
            <p className="text-sm font-bold text-violet-600 tabular-nums">
              {product.requiredCR?.toFixed(2) ?? "—"}%
            </p>
          </div>
        </div>
      </div>

      {tips.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">Dicas Estrategicas</h3>
          </div>
          <ul className="space-y-2.5">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <TrendingUp size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

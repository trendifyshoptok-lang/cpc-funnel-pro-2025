import React from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../ui';
import type { EnrichedProduct } from '../../types';
import { fmt, fmtPct } from './helpers';

interface ParetoModalProps {
  isOpen: boolean;
  paretoProducts: EnrichedProduct[];
  topCount: number;
  profitPct: number;
  topPct: number;
  onClose: () => void;
  onProductClick: (productId: string) => void;
}

export const ParetoModal: React.FC<ParetoModalProps> = ({
  isOpen,
  paretoProducts,
  topCount,
  profitPct,
  topPct,
  onClose,
  onProductClick,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200"
        style={{ animation: 'slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Concentração 80/20
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Produtos que movem seu portfolio
            </p>
          </div>
          <IconButton icon={<X size={18}/>} label="Fechar" variant="ghost" size="md" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Summary bar */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-black text-amber-600">{topCount}</span>
              <span className="text-sm text-slate-600">
                produto{topCount !== 1 ? 's' : ''} = {profitPct}% do lucro
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${profitPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {topPct}% do catálogo gerando {profitPct}% dos lucros
            </p>
          </div>

          {/* Product list */}
          <div className="space-y-3">
            {paretoProducts.map((p, i) => (
              <div
                key={p.id}
                className="group p-4 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  onProductClick(p.id);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">{p.nicho}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-green-600 tabular-nums">
                      {fmt(p.profit)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {fmtPct(p.roi)}% ROI
                    </p>
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xs text-slate-400 uppercase font-bold">Campanhas</p>
                    <p className="text-sm font-semibold text-slate-700">{p.campaignCount}</p>
                  </div>
                  <div>
                    <p className="text-2xs text-slate-400 uppercase font-bold">Receita</p>
                    <p className="text-sm font-semibold text-blue-600">{fmt(p.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-2xs text-slate-400 uppercase font-bold">Custo</p>
                    <p className="text-sm font-semibold text-slate-700">{fmt(p.spend)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer stats */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400">
              Clique em um produto para visualizar detalhes completos
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
};

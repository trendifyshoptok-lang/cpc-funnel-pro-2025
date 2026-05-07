import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { OperationalCosts, CostItem } from "../../types";

interface CostsManagerProps {
  costs: OperationalCosts;
  setCosts: (costs: OperationalCosts) => void;
  label?: string;
}

export const CostsManager: React.FC<CostsManagerProps> = ({
  costs,
  setCosts,
  label = "Custos Operacionais",
}) => {
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");

  const addItem = () => {
    const val = parseFloat(newValue);
    if (!newName.trim() || isNaN(val) || val <= 0) return;
    const item: CostItem = {
      id: `cost_${Date.now()}`,
      name: newName.trim(),
      value: val,
    };
    const items = [...(costs.items ?? []), item];
    setCosts({ items, total: items.reduce((s, i) => s + i.value, 0) });
    setNewName("");
    setNewValue("");
  };

  const removeItem = (id: string) => {
    const items = (costs.items ?? []).filter((i) => i.id !== id);
    setCosts({ items, total: items.reduce((s, i) => s + i.value, 0) });
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <div className="space-y-1.5">
        {(costs.items ?? []).map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm text-slate-700 flex-1">{item.name}</span>
            <span className="text-sm font-semibold text-slate-800 tabular-nums">{fmt(item.value)}</span>
            <button onClick={() => removeItem(item.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome do custo"
          className="flex-1 input text-sm"
        />
        <input
          type="number"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Valor"
          className="w-24 input text-sm"
          min="0"
          step="0.01"
        />
        <button onClick={addItem} className="btn-sm btn-primary flex-shrink-0">
          <Plus size={13} />
        </button>
      </div>
      {(costs.items?.length ?? 0) > 0 && (
        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</span>
          <span className="text-sm font-bold text-slate-800 tabular-nums">{fmt(costs.total ?? 0)}</span>
        </div>
      )}
    </div>
  );
};

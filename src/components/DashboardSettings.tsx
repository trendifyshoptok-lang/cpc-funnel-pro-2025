import React, { useState } from "react";
import { Settings, X, Save } from "lucide-react";

interface DashboardSettingsProps {
  onClose?: () => void;
}

export const DashboardSettings: React.FC<DashboardSettingsProps> = ({ onClose }) => {
  const [showCharts, setShowCharts] = useState(true);
  const [showHealth, setShowHealth] = useState(true);
  const [showProjection, setShowProjection] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(
      "dashboard_settings",
      JSON.stringify({ showCharts, showHealth, showProjection })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-blue-600" />
          <h3 className="text-base font-bold text-slate-800">Configuracoes do Dashboard</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {[
          { label: "Exibir Graficos", value: showCharts, set: setShowCharts },
          { label: "Exibir Score de Saude", value: showHealth, set: setShowHealth },
          { label: "Exibir Projecao Mensal", value: showProjection, set: setShowProjection },
        ].map(({ label, value, set }) => (
          <label key={label} className="flex items-center justify-between gap-3 py-2 cursor-pointer">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button
              type="button"
              onClick={() => set((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-slate-200"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0"}`}
              />
            </button>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        className={`mt-5 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
          saved ? "bg-emerald-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        <Save size={14} />
        {saved ? "Salvo!" : "Salvar preferencias"}
      </button>
    </div>
  );
};

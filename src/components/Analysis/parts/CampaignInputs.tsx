import React, { useState } from 'react';
import { MousePointer2, Wallet, Save, TrendingUp, Activity, Edit3, Upload, CheckCircle2 } from 'lucide-react';
import { Button, SegmentedControl } from '../../ui';
import { GoogleAdsImporter } from '../../GoogleAdsImporter';
import type { GoogleAdsRow } from '../../GoogleAdsImporter';
import type { CampaignStatus } from '../../../types';
import type { RealData } from '../hooks';
import { fmt, fmtPct } from '../helpers';

type InputMode = 'manual' | 'csv';

interface Props {
  realData: RealData;
  onChange: (d: RealData) => void;
  campaignStatus: CampaignStatus;
  onStatusChange: (s: CampaignStatus) => void;
  revenue: number;
  ctr: number;
  product: { commissionLiquid: number };
  onSave: () => void;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  accent = 'blue',
  prefix,
}: {
  label: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  accent?: string;
  prefix?: string;
}) {
  const focusRing: Record<string, string> = {
    blue:   'focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100',
    red:    'focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100',
    purple: 'focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100',
    slate:  'focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100',
  };
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      <div className={`relative flex items-center bg-white rounded-xl border border-slate-200 transition-all ${focusRing[accent] ?? focusRing.blue}`}>
        {prefix && (
          <span className="pl-3 pr-1 text-sm font-bold text-slate-500 select-none">{prefix}</span>
        )}
        <input
          type="number"
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          className="w-full px-3 py-2.5 text-sm font-semibold text-slate-800 bg-transparent outline-none placeholder-slate-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </div>
  );
}

export const CampaignInputs: React.FC<Props> = ({
  realData, onChange, campaignStatus, onStatusChange,
  revenue, ctr, product, onSave,
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  /** Shown briefly after a CSV import to confirm which campaigns were aggregated */
  const [importBanner, setImportBanner] = useState<string | null>(null);

  const set = (key: keyof RealData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...realData, [key]: parseFloat(e.target.value) || 0 });

  /**
   * Aggregate all imported rows into a single RealData object.
   * Sums impressions, clicks, cost → spend, conversions across all campaigns.
   * Revenue is derived by the parent (conversions × commissionLiquid), so we
   * intentionally do NOT write to the global state here — only local inputs.
   */
  const handleImport = (rows: GoogleAdsRow[]) => {
    const agg = rows.reduce(
      (acc, r) => ({
        impressions: acc.impressions + r.impressions,
        clicks:      acc.clicks + r.clicks,
        spend:       acc.spend + r.cost,
        conversions: acc.conversions + r.conversions,
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    );

    // Fill the form inputs — no global save triggered
    onChange(agg);

    // Show confirmation banner and switch back to manual review
    const campaignNames = rows.length === 1
      ? `"${rows[0].campaign}"`
      : `${rows.length} campanhas`;
    setImportBanner(`Dados de ${campaignNames} preenchidos. Revise e clique em Salvar.`);
    setInputMode('manual');
  };

  const ctrColor = ctr >= 5 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : ctr >= 2 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-red-500 bg-red-50 border-red-200';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 leading-none">Dados da Campanha</div>
            <div className="text-2xs text-slate-400 mt-0.5 font-medium">Google Ads</div>
          </div>
        </div>

        {/* Status select — only visible in manual mode */}
        {inputMode === 'manual' && (
          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-widest">Status</span>
            <select
              value={campaignStatus}
              onChange={e => onStatusChange(e.target.value as CampaignStatus)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="aprendizado">Aprendizado</option>
              <option value="qualificada">Qualificada</option>
            </select>
          </div>
        )}
      </div>

      {/* ── Mode toggle ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
        <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest">Origem dos dados</span>
        <SegmentedControl
          options={[
            { value: 'manual', label: 'Manual', icon: <Edit3 size={11} />, title: 'Preencher manualmente' },
            { value: 'csv',    label: 'Importar CSV', icon: <Upload size={11} />, title: 'Importar do Google Ads' },
          ]}
          value={inputMode}
          onChange={(v) => {
            setInputMode(v as InputMode);
            // Clear banner when switching back to csv mode
            if (v === 'csv') setImportBanner(null);
          }}
          size="sm"
        />
      </div>

      {/* ── Body ── */}
      <div className="p-5">

        {/* ── Import success banner ── */}
        {importBanner && inputMode === 'manual' && (
          <div className="flex items-start gap-2.5 mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-2xs text-emerald-800 font-medium leading-relaxed">{importBanner}</p>
            <button
              onClick={() => setImportBanner(null)}
              className="ml-auto text-emerald-400 hover:text-emerald-600 transition-colors flex-shrink-0"
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        )}

        {/* ── MANUAL MODE ── */}
        {inputMode === 'manual' && (
          <>
            <div className="grid grid-cols-2 gap-5">

              {/* ── Left: Tráfego ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-2xs font-bold text-slate-500 uppercase tracking-widest">
                  <MousePointer2 size={10} strokeWidth={2.5} />
                  Trafego
                </div>

                <InputField label="Impressoes" value={realData.impressions} onChange={set('impressions')} placeholder="1000" accent="slate" />
                <InputField label="Cliques" value={realData.clicks} onChange={set('clicks')} placeholder="0" accent="blue" />

                {/* CTR Computed badge */}
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-slate-500 uppercase tracking-widest">CTR Calculado</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${ctrColor} tabular-nums`}>
                    {fmtPct(ctr)}
                  </span>
                </div>
              </div>

              {/* ── Right: Financeiro ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-2xs font-bold text-slate-500 uppercase tracking-widest">
                  <Wallet size={10} strokeWidth={2.5} />
                  Financeiro
                </div>

                <InputField label="Gasto (R$)" value={realData.spend} onChange={set('spend')} placeholder="0,00" accent="red" />
                <InputField label="Conversoes" value={realData.conversions} onChange={set('conversions')} placeholder="0" accent="purple" />

                {/* Revenue computed */}
                <div className="rounded-xl border p-3 bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1 text-2xs font-bold uppercase tracking-widest text-slate-500">
                      <TrendingUp size={9} />
                      Receita
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${revenue > 0 ? 'num-volume' : 'num-neutral'}`}>
                      {fmt(revenue)}
                    </span>
                  </div>
                  {realData.conversions > 0 && (
                    <div className="text-2xs text-slate-500 font-semibold">
                      {realData.conversions} × {fmt(product.commissionLiquid)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Save ── */}
            <Button
              variant="save"
              size="md"
              iconLeft={<Save size={13} strokeWidth={2.5} />}
              onClick={onSave}
              className="mt-5 w-full"
            >
              Salvar
            </Button>
          </>
        )}

        {/* ── CSV MODE: inline importer (no CardShell wrapper) ── */}
        {inputMode === 'csv' && (
          <GoogleAdsImporter
            inline
            onImport={handleImport}
            onClose={() => setInputMode('manual')}
          />
        )}
      </div>
    </div>
  );
};

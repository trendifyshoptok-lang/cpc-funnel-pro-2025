import React, { useState } from 'react';
import {
  BarChart2, Settings2, Trash2, Plus, X,
  Clock, CheckCircle, AlertCircle, XCircle, Award,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { EnrichedProduct, ActivityStatus } from '../../types';
import { MiniSparkline } from './MiniSparkline';
import { fmt } from './helpers';

/* ── Activity badge ── */
const ACTIVITY_CONFIG: Record<ActivityStatus, { dot: string; text: string; label: string }> = {
  active:  { dot: 'bg-green-500',  text: 'text-green-700',  label: 'Ativo'       },
  idle:    { dot: 'bg-yellow-400', text: 'text-yellow-700', label: 'Ocioso'      },
  dormant: { dot: 'bg-orange-400', text: 'text-orange-700', label: 'Dormindo'    },
  never:   { dot: 'bg-slate-300',  text: 'text-slate-500',  label: 'Nunca Rodou' },
};

export const ActivityBadge: React.FC<{ status: ActivityStatus }> = ({ status }) => {
  const c = ACTIVITY_CONFIG[status];
  return (
    <span className="flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      <span className={`text-2xs font-bold ${c.text}`}>{c.label}</span>
    </span>
  );
};

/* ── Status icon ── */
const StatusIcon: React.FC<{ status: EnrichedProduct['status'] }> = ({ status }) => {
  const map = {
    excellent: <Award size={13} className="text-green-600" />,
    good:      <CheckCircle size={13} className="text-blue-500" />,
    warning:   <AlertCircle size={13} className="text-yellow-500" />,
    danger:    <XCircle size={13} className="text-red-500" />,
  };
  return map[status] ?? null;
};

/* ── Tag chip ── */
const TagChip: React.FC<{ label: string; onRemove?: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-0.5 text-2xs font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full border border-slate-200">
    {label}
    {onRemove && (
      <button onClick={e => { e.stopPropagation(); onRemove(); }} className="hover:text-red-500 transition-colors ml-0.5">
        <X size={9} />
      </button>
    )}
  </span>
);

/* ── Tag presets ── */
const TAG_PRESETS = ['escalar', 'favorito', 'testar', 'pausar', 'otimizar'];

/* ── Metric mini ── */
const Metric: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'text-slate-800' }) => (
  <div className="text-center">
    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</div>
    <div className={`text-sm font-bold tabular-nums leading-tight ${color}`}>{value}</div>
  </div>
);

/* ── Main ProductCard ── */
interface ProductCardProps {
  product: EnrichedProduct;
  isSelected: boolean;
  tags: string[];
  bulkSelected: boolean;
  onBulkToggle: () => void;
  onClick: () => void;
  onAnalyze: () => void;
  onSetup: () => void;
  onDelete: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product: p,
  isSelected,
  tags,
  bulkSelected,
  onBulkToggle,
  onClick,
  onAnalyze,
  onSetup,
  onDelete,
  onAddTag,
  onRemoveTag,
}) => {
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !tags.includes(clean)) onAddTag(clean);
    setTagInput('');
    setShowTagInput(false);
  };

  const profitColor = p.profit > 0 ? 'text-green-600' : p.profit < 0 ? 'text-red-600' : 'text-slate-600';

  return (
    <div
      className={`bg-white rounded-2xl border transition-all cursor-pointer select-none ${ isSelected ? 'border-blue-400 ring-2 ring-blue-100 ' : 'border-slate-200 hover:border-slate-300 hover:' }`}
      onClick={onClick}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        {/* Bulk checkbox */}
        <div
          className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${ bulkSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 hover:border-blue-400' }`}
          onClick={e => { e.stopPropagation(); onBulkToggle(); }}
        >
          {bulkSelected && <span className="text-white text-[9px] font-bold">✓</span>}
        </div>

        {/* Icon */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${ p.profit >= 0 ? 'bg-green-50' : 'bg-red-50' }`}>
          <StatusIcon status={p.status} />
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">{p.name}</h4>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-500">{p.nicho}</span>
            {p.market && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-400">{p.market}</span>
              </>
            )}
          </div>
        </div>

        {/* Activity badge */}
        <ActivityBadge status={p.activityStatus} />
      </div>

      {/* ── Metrics row ── */}
      <div className="px-4 pb-3 grid grid-cols-4 gap-2 border-t border-slate-50 pt-3">
        <Metric
          label="Lucro"
          value={p.profit >= 0 ? `+${fmt(p.profit)}` : fmt(p.profit)}
          color={profitColor}
        />
        <Metric
          label="ROI"
          value={`${p.roi.toFixed(0)}%`}
          color={p.roi >= 0 ? 'text-blue-700' : 'text-red-600'}
        />
        <Metric
          label="Camps."
          value={p.campaignCount.toString()}
          color="text-slate-700"
        />
        {/* Sparkline */}
        <div className="flex items-center justify-center">
          <MiniSparkline data={p.sparklineData} width={56} height={24} />
        </div>
      </div>

      {/* ── Tags ── */}
      <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap min-h-[28px]" onClick={e => e.stopPropagation()}>
        {tags.map(t => (
          <TagChip key={t} label={`#${t}`} onRemove={() => onRemoveTag(t)} />
        ))}

        {showTagInput ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddTag(tagInput);
                if (e.key === 'Escape') setShowTagInput(false);
              }}
              placeholder="nova tag..."
              className="text-[11px] border border-slate-200 rounded-full px-2 py-0.5 w-20 outline-none focus:ring-1 focus:ring-blue-400"
            />
            {/* Presets */}
            <div className="flex gap-0.5 flex-wrap">
              {TAG_PRESETS.filter(t => !tags.includes(t)).slice(0, 3).map(preset => (
                <button
                  key={preset}
                  onClick={() => handleAddTag(preset)}
                  className="text-2xs text-blue-600 hover:text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded-full"
                >
                  {preset}
                </button>
              ))}
            </div>
            <button onClick={() => setShowTagInput(false)} className="text-slate-300 hover:text-red-400">
              <X size={11} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="text-2xs text-slate-300 hover:text-blue-500 flex items-center gap-0.5 transition-colors"
          >
            <Plus size={10} /> tag
          </button>
        )}

        {/* Last campaign */}
        {p.lastCampaignDate && (
          <span className="ml-auto flex items-center gap-1 text-2xs text-slate-400">
            <Clock size={10} />
            {daysSince(p.lastCampaignDate)}
          </span>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="px-4 pb-3 pt-2.5 flex items-center justify-end gap-2 border-t border-slate-100" onClick={e => e.stopPropagation()}>
        <button
          onClick={onDelete}
          className="text-[13px] font-semibold bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 py-1.5 px-2.5 rounded-lg transition-colors border border-slate-200 hover:border-red-200"
          title="Remover produto"
        >
          <Trash2 size={13} />
        </button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onSetup}
          iconLeft={<Settings2 size={12} />}
        >
          Configurar
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onAnalyze}
          iconLeft={<BarChart2 size={12} />}
        >
          Análise
        </Button>
      </div>
    </div>
  );
};

/* ── helper ── */
function daysSince(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return 'hoje';
  if (diff === 1) return '1d atras';
  return `${diff}d atras`;
}

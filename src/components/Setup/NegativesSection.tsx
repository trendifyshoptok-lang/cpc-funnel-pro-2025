import React, { useState, useMemo } from 'react';
import {
  ShieldBan, Zap, ClipboardCopy, CheckCircle, Globe, Package,
  Sparkles, ChevronDown, ChevronUp, Trash2, RotateCcw
} from 'lucide-react';
import {
  NEGATIVE_KEYWORDS_PHYSICAL,
  NEGATIVE_KEYWORDS_DIGITAL,
  NEGATIVE_KEYWORDS_INTL,
} from '../../constants/negativeKeywords';
import type { Product } from '../../types';

interface NegativesSectionProps {
  negativeKeywords: string;
  setNegativeKeywords: (keywords: string) => void;
  product: Product;
}

/* ── helpers ── */
const countKeywords = (str: string) =>
  str.split(',').map(s => s.trim()).filter(s => s.length > 0).length;

const getPreviewTerms = (str: string, n = 8): string[] =>
  str.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, n);

/* ── detect product profile ── */
type Profile = 'br_digital' | 'br_physical' | 'international';

const detectProfile = (product: Product): Profile => {
  const market = product.market?.toUpperCase() || 'BR';
  const isBR = market === 'BR' || market === 'BRASIL';
  if (!isBR) return 'international';
  const isPhysical = product.type === 'fisico';
  return isPhysical ? 'br_physical' : 'br_digital';
};

const PROFILES: Record<Profile, {
  label: string;
  sublabel: string;
  keywords: string;
  color: {
    badge: string;
    ring: string;
    dot: string;
    bg: string;
    icon: string;
  };
}> = {
  br_digital: {
    label: 'Produto BR Digital',
    sublabel: 'Produto digital/curso vendido no Brasil',
    keywords: NEGATIVE_KEYWORDS_DIGITAL,
    color: {
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      ring: 'border-blue-300 bg-blue-50',
      dot: 'bg-blue-500',
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
    },
  },
  br_physical: {
    label: 'Produto BR Fisico',
    sublabel: 'Produto fisico vendido no Brasil',
    keywords: NEGATIVE_KEYWORDS_PHYSICAL,
    color: {
      badge: 'bg-orange-100 text-orange-700 border-orange-200',
      ring: 'border-orange-300 bg-orange-50',
      dot: 'bg-orange-500',
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
    },
  },
  international: {
    label: 'Produto Internacional (EN)',
    sublabel: 'Produto para mercado exterior (US/UK/EU/AU)',
    keywords: NEGATIVE_KEYWORDS_INTL,
    color: {
      badge: 'bg-violet-100 text-violet-700 border-violet-200',
      ring: 'border-violet-300 bg-violet-50',
      dot: 'bg-violet-500',
      bg: 'bg-violet-50',
      icon: 'text-violet-600',
    },
  },
};

/* ── Keyword chip preview ── */
const KeyChip: React.FC<{ term: string }> = ({ term }) => (
  <span className="inline-flex items-center text-[11px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
    {term}
  </span>
);

export const NegativesSection: React.FC<NegativesSectionProps> = ({
  negativeKeywords,
  setNegativeKeywords,
  product,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const profile = useMemo(() => detectProfile(product), [product.market, product.type]);
  const profileData = PROFILES[profile];
  const suggestionCount = useMemo(() => countKeywords(profileData.keywords), [profile]);
  const previewTerms = useMemo(() => getPreviewTerms(profileData.keywords), [profile]);
  const currentCount = useMemo(() => countKeywords(negativeKeywords), [negativeKeywords]);

  const handleApply = () => {
    setNegativeKeywords(profileData.keywords);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(negativeKeywords);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Palavras negativas copiadas para a area de transferencia!');
    }
  };

  const handleClear = () => {
    setNegativeKeywords('');
  };

  return (
    <div className="flex-1 border-t border-slate-100">

      {/* ── Header ── */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
        <div className="w-7 h-7 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <ShieldBan size={14} className="text-red-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">Palavras Negativas</p>
          <p className="text-[11px] text-slate-400">Bloqueia cliques ruins antes de gastar</p>
        </div>
        {currentCount > 0 && (
          <span className="ml-auto text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            {currentCount} termos
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">

        {/* ── Sugestao Inteligente ── */}
        <div className={`rounded-2xl border-2 overflow-hidden ${profileData.color.ring}`}>
          {/* Detection row */}
          <div className={`px-4 py-3 ${profileData.color.bg} flex items-center gap-2 flex-wrap`}>
            <Sparkles size={13} className={profileData.color.icon} />
            <span className="text-[11px] font-bold text-slate-700">Detectado automaticamente:</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${profileData.color.badge}`}>
              {profileData.label}
            </span>
            <span className="text-[11px] text-slate-400 ml-auto">{profileData.sublabel}</span>
          </div>

          {/* Stats + CTA */}
          <div className="px-4 py-4 bg-white flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">{suggestionCount}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">termos de bloqueio</p>
              </div>
              <div className="h-10 w-px bg-slate-100" />
              <div className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                Lista curada para reduzir cliques de baixa qualidade e desperdicio de orcamento
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setShowPreview(p => !p)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                {showPreview ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                Preview
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <Zap size={12} />
                Aplicar Sugestoes
              </button>
            </div>
          </div>

          {/* Preview expandable */}
          {showPreview && (
            <div className="px-4 pb-4 border-t border-slate-100 pt-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Primeiros termos da lista:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {previewTerms.map((term, i) => (
                  <KeyChip key={i} term={term} />
                ))}
                <span className="inline-flex items-center text-[11px] text-slate-400 px-2 py-0.5 font-medium">
                  +{suggestionCount - previewTerms.length} mais...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Produto Fisico + Digital ambos disponíveis ── */}
        {profile !== 'international' && (
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-1">
            <Globe size={11} />
            <span>
              Produto Internacional?{' '}
              <button
                onClick={() => {
                  const intl = PROFILES['international'];
                  setNegativeKeywords(negativeKeywords
                    ? `${negativeKeywords}\n\n--- Internacional ---\n${intl.keywords}`
                    : intl.keywords);
                }}
                className="text-violet-600 font-semibold hover:underline"
              >
                Adicionar termos EN tambem
              </button>
            </span>
          </div>
        )}

        {/* ── Textarea ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Lista Final (editavel)
            </label>
            <div className="flex gap-2">
              {negativeKeywords && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 font-semibold transition-colors"
                >
                  <Trash2 size={11} /> Limpar
                </button>
              )}
              <button
                onClick={handleCopy}
                disabled={!negativeKeywords}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40'
                }`}
              >
                {copied ? <CheckCircle size={11} /> : <ClipboardCopy size={11} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <textarea
            value={negativeKeywords}
            onChange={e => setNegativeKeywords(e.target.value)}
            placeholder="Clique em 'Aplicar Sugestoes' para gerar a lista automaticamente, ou digite manualmente..."
            className="w-full h-36 p-3.5 text-xs font-mono border border-slate-200 rounded-2xl bg-white text-slate-600 focus:ring-2 focus:ring-slate-400 outline-none resize-none placeholder-slate-300"
          />

          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
            <ClipboardCopy size={10} />
            Cole diretamente no campo de palavras negativas do Google Ads.
          </p>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Megaphone, Wand2, Trash2, Loader2, Globe, MoreVertical,
  Copy, CheckCircle, AlertCircle
} from 'lucide-react';
import type { Ad, Product } from '../../types';
import { Button } from '../ui';
import { generateAIResponse } from '../../services/gemini';

interface AdsSectionProps {
  ads: Ad[];
  setAds: (ads: Ad[]) => void;
  product: Product;
}

/* ── character count badge ── */
const CharBadge: React.FC<{ count: number; max: number }> = ({ count, max }) => {
  const pct = count / max;
  const color = pct > 1 ? 'text-red-600 bg-red-50 border-red-200' :
                pct > 0.85 ? 'text-orange-600 bg-orange-50 border-orange-200' :
                'text-slate-400 bg-slate-50 border-slate-200';
  return (
    <span className={`text-2xs font-bold px-1.5 py-0.5 rounded border ${color}`}>
      {count}/{max}
    </span>
  );
};

/* ── single ad card ── */
const AdCard: React.FC<{
  ad: Ad;
  idx: number;
  nicho: string;
  name: string;
  onRemove: () => void;
}> = ({ ad, idx, nicho, name, onRemove }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${ad.title}\n${ad.description}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const titleLen = ad.title?.length || 0;
  const descLen = ad.description?.length || 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:border-slate-300 transition-all hover:">

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-widest">
            Anuncio #{idx + 1}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CharBadge count={titleLen} max={30} />
          <CharBadge count={descLen} max={90} />
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-lg transition-all ml-1 ${ copied ? 'bg-green-100 text-green-600' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100' }`}
          >
            {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Ad preview — Google SERP style */}
      <div className="px-4 py-3.5">
        {/* Patrocinado + URL */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            Patrocinado
          </span>
          <MoreVertical size={11} className="text-slate-300" />
        </div>

        <div className="flex items-center gap-1 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
            <Globe size={9} className="text-slate-500" />
          </div>
          <span className="text-xs text-slate-600 truncate">
            www.oferta-{nicho?.toLowerCase().replace(/\s/g, '-') || 'produto'}.com.br
          </span>
          <span className="text-2xs text-slate-400">› {name}</span>
        </div>

        {/* Title */}
        <h3 className="text-[#1a0dab] text-[17px] font-normal leading-snug cursor-pointer hover:underline mb-1">
          {ad.title || <span className="text-slate-300 italic">Titulo vazio</span>}
        </h3>

        {/* Description */}
        <p className="text-[#4d5156] text-[13px] leading-relaxed">
          {ad.description || <span className="text-slate-300 italic">Descricao vazia</span>}
        </p>

        {/* Sitelinks fake */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex gap-4 overflow-hidden">
          <span className="text-[#1a0dab] text-xs hover:underline cursor-pointer opacity-70">Oferta Especial</span>
          <span className="text-[#1a0dab] text-xs hover:underline cursor-pointer opacity-70">Garantia 30 Dias</span>
          <span className="text-[#1a0dab] text-xs hover:underline cursor-pointer opacity-70">Como Funciona</span>
        </div>
      </div>

      {/* Warnings */}
      {(titleLen > 30 || descLen > 90) && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 p-2 bg-red-50 rounded-xl text-[11px] text-red-600 font-medium">
            <AlertCircle size={11} />
            {titleLen > 30 && <span>Titulo acima de 30 chars. </span>}
            {descLen > 90 && <span>Descricao acima de 90 chars.</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export const AdsSection: React.FC<AdsSectionProps> = ({ ads, setAds, product }) => {
  const [loadingAds, setLoadingAds] = useState(false);

  const handleGenerateAds = async () => {
    setLoadingAds(true);
    try {
      const prompt = `Crie 3 anuncios para Google Ads (Pesquisa) para o produto "${product.name}" (${product.nicho}).
Foco: ${product.funnelStage}.
Preco: R$ ${product.price}.
Retorne estritamente um JSON array neste formato (sem markdown):
[{"title": "Titulo Aqui (max 30 chars)", "description": "Descricao aqui (max 90 chars)"}]`;

      const response = await generateAIResponse(prompt, 'gemini-2.5-flash');
      let text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const generatedAds = JSON.parse(text);
        if (Array.isArray(generatedAds)) {
          setAds([...ads, ...generatedAds]);
        }
      } catch {
        console.error('Erro ao parsear JSON de ads');
      }
    } catch {
      console.error('Erro ao gerar anuncios');
    } finally {
      setLoadingAds(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-full">

      {/* ── Header ── */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
        <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Megaphone size={14} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">Anuncios</p>
          <p className="text-[11px] text-slate-400">Preview no estilo Google SERP</p>
        </div>
        {ads.length > 0 && (
          <span className="ml-auto text-[11px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {ads.length} anuncio{ads.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Generate button ── */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-50">
        <Button
          variant="ai"
          size="sm"
          fullWidth
          onClick={handleGenerateAds}
          disabled={loadingAds}
          loading={loadingAds}
          iconLeft={!loadingAds ? <Wand2 size={13}/> : undefined}
        >
          {loadingAds ? 'Criando anuncios...' : 'Gerar 3 Anuncios com IA'}
        </Button>
        <p className="text-[11px] text-slate-400 mt-1.5 text-center">
          Requer API Gemini configurada. Titulo max 30 · Descricao max 90.
        </p>
      </div>

      {/* ── Ads list ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[520px] scrollbar-thin">
        {ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Megaphone size={22} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Nenhum anuncio criado</p>
            <p className="text-xs text-slate-400 max-w-[200px]">
              Clique em "Gerar com IA" para criar anuncios otimizados automaticamente
            </p>
          </div>
        ) : (
          ads.map((ad, idx) => (
            <AdCard
              key={idx}
              ad={ad}
              idx={idx}
              nicho={product.nicho || 'produto'}
              name={product.name || ''}
              onRemove={() => setAds(ads.filter((_, i) => i !== idx))}
            />
          ))
        )}
      </div>

      {ads.length > 0 && (
        <div className="px-5 pb-4 border-t border-slate-50 pt-3">
          <button
            onClick={() => setAds([])}
            className="text-[11px] text-slate-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1"
          >
            <Trash2 size={11} /> Limpar todos
          </button>
        </div>
      )}

    </div>
  );
};

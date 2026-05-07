import React, { useState } from 'react';
import { Hash, Wand2, Plus, Trash2, Loader2, Tag } from 'lucide-react';
import type { Keyword, Product } from '../../types';
import { Button } from '../ui';
import { generateAIResponse } from '../../services/gemini';

interface KeywordsSectionProps {
  keywords: Keyword[];
  setKeywords: (keywords: Keyword[]) => void;
  product: Product;
}

const MATCH_TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  exata:    { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Exata'    },
  frase:    { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Frase'    },
  ampla:    { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Ampla'    },
  default:  { bg: 'bg-slate-100',  text: 'text-slate-600',  label: 'Frase'    },
};

const getMatchStyle = (type?: string) =>
  MATCH_TYPE_COLORS[type || ''] ?? MATCH_TYPE_COLORS['default'];

export const KeywordsSection: React.FC<KeywordsSectionProps> = ({
  keywords,
  setKeywords,
  product,
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [loadingKeywords, setLoadingKeywords] = useState(false);

  const handleGenerateKeywords = async () => {
    setLoadingKeywords(true);
    try {
      const stage = product.funnelStage === 'fundo'
        ? 'Fundo de Funil (Intencao de compra, nome do produto)'
        : 'Meio de Funil';
      const prompt = `Gere 10 palavras-chave de ${stage} para o produto "${product.name}" do nicho "${product.nicho}". Retorne apenas a lista separada por virgulas, sem numeracao.`;

      const response = await generateAIResponse(prompt);
      const text = response.text;
      if (text) {
        const terms = text.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
        const newKws: Keyword[] = terms.map((t: string) => ({
          term: t,
          type: 'frase',
          cpc: product.cpcSuggested || 0,
          intent: 'alta',
        }));
        setKeywords([...keywords, ...newKws]);
      }
    } catch {
      alert('Erro ao conectar com a IA. Verifique sua chave de API.');
    } finally {
      setLoadingKeywords(false);
    }
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    setKeywords([
      ...keywords,
      {
        term: newKeyword.trim(),
        type: 'frase',
        cpc: product.cpcSuggested || 0,
        intent: 'alta',
      },
    ]);
    setNewKeyword('');
  };

  const removeKeyword = (idx: number) =>
    setKeywords(keywords.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
        <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Hash size={14} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">Palavras-Chave</p>
          <p className="text-[11px] text-slate-400">Termos que ativam seu anuncio</p>
        </div>
        {keywords.length > 0 && (
          <span className="ml-auto text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {keywords.length} termos
          </span>
        )}
      </div>

      {/* ── Input ── */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-50">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={newKeyword}
              onChange={e => setNewKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddKeyword()}
              placeholder="Digite a palavra-chave e pressione Enter..."
              className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-300"
            />
          </div>
          <button
            onClick={handleAddKeyword}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-xl transition-colors flex items-center justify-center"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Generate AI button */}
        <Button
          variant="ai"
          size="sm"
          fullWidth
          onClick={handleGenerateKeywords}
          disabled={loadingKeywords}
          loading={loadingKeywords}
          iconLeft={!loadingKeywords ? <Wand2 size={13}/> : undefined}
          className="mt-2.5"
        >
          {loadingKeywords
            ? 'Gerando com IA...'
            : `Gerar ${product.funnelStage === 'fundo' ? 'Fundo de Funil' : 'Palavras-Chave'} com IA`
          }
        </Button>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-2 max-h-[260px] scrollbar-thin">
        {keywords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Hash size={18} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Nenhuma palavra-chave</p>
            <p className="text-xs text-slate-400">
              Adicione manualmente ou gere com IA acima
            </p>
          </div>
        ) : (
          keywords.map((kw, idx) => {
            const style = getMatchStyle(kw.type);
            return (
              <div
                key={idx}
                className="group flex items-center gap-3 px-3.5 py-2.5 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
              >
                <span className={`text-2xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
                <span className="text-sm text-slate-700 flex-1 truncate font-medium">{kw.term}</span>
                <button
                  onClick={() => removeKeyword(idx)}
                  className="text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {keywords.length > 0 && (
        <div className="px-5 pb-4 border-t border-slate-50 pt-3">
          <button
            onClick={() => setKeywords([])}
            className="text-[11px] text-slate-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1"
          >
            <Trash2 size={11} /> Limpar lista
          </button>
        </div>
      )}

    </div>
  );
};

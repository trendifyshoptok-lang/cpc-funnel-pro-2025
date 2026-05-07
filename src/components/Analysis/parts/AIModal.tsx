import React, { useState, useEffect } from 'react';
import { X, BrainCircuit, Zap, Send, Copy, Check, AlertCircle, Key, ChevronRight, Target, ArrowLeft, CheckCircle2, Settings } from 'lucide-react';
import { Button, IconButton } from '../../ui';
import type { Product, AIAnalysisResponse } from '../../../types';
import type { Metrics } from '../hooks';
import { fmt, fmtPct, fmtX } from '../helpers';
import { getApiKey, hasApiKey } from '../../../hooks/useApiKey';

interface Props {
  open: boolean;
  onClose: () => void;
  metrics: Metrics;
  product: Product;
  onReport: (r: AIAnalysisResponse) => void;
  aiReport: AIAnalysisResponse | null;
}

function buildPrompt(metrics: Metrics, product: Product): string {
  return `Voce e um especialista em trafego pago Google Ads para afiliados. Analise os dados abaixo e retorne APENAS JSON valido, sem markdown, sem texto extra.

PRODUTO: ${product.name} (${product.nicho})
COMISSAO LIQUIDA: ${fmt(product.commissionLiquid)}
META CR: ${fmtPct(product.requiredCR)}
META CPC BOM: ${fmt(product.cpcBom)}

METRICAS REAIS:
- CPC: ${fmt(metrics.cpc)}
- CTR: ${fmtPct(metrics.ctr)}
- CR: ${fmtPct(metrics.cr)}
- ROAS: ${fmtX(metrics.roas)}
- ROI: ${fmtPct(metrics.roi, 1)}
- CPA: ${fmt(metrics.cpa)}

Retorne EXATAMENTE este JSON:
{
  "diagnostico": "Diagnostico objetivo em 2-3 frases sobre o estado da campanha",
  "sugestoes": [
    {
      "priority": "ALTA",
      "area": "CPC",
      "action": "Acao especifica e mensuravel",
      "details": "Detalhes tecnicos de implementacao",
      "resultado": "Resultado esperado"
    }
  ]
}

Gere 3 a 5 sugestoes priorizadas por impacto. Prioridades validas: ALTA, MEDIA, BAIXA.`;
}

async function callAnthropicAPI(apiKey: string, prompt: string): Promise<AIAnalysisResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `Erro na API (${response.status})`);
  }

  const data = await response.json();
  const text: string = data?.content?.[0]?.text || '';
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.diagnostico || !Array.isArray(parsed.sugestoes)) {
    throw new Error('Formato de resposta inválido');
  }
  return parsed as AIAnalysisResponse;
}

const PRIORITY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  ALTA:      { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100'   },
  ALTISSIMA: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100'   },
  CRITICA:   { bg: 'bg-red-100',   text: 'text-red-800',    border: 'border-red-200'   },
  MEDIA:     { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100' },
  BAIXA:     { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200' },
};

export const AIModal: React.FC<Props> = ({
  open, onClose, metrics, product, onReport, aiReport,
}) => {
  // ── Key resolution: global store (header IA button) has priority ──
  const globalKey = getApiKey();
  const globalKeySet = hasApiKey();

  const [localKey, setLocalKey] = useState('');
  const [showLocalInput, setShowLocalInput] = useState(false);
  const [showKeyValue, setShowKeyValue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'main' | 'report'>(aiReport ? 'report' : 'main');

  // Reset view when modal opens/closes
  useEffect(() => {
    if (open) {
      setView(aiReport ? 'report' : 'main');
      setError(null);
    }
  }, [open, aiReport]);

  if (!open) return null;

  const prompt = buildPrompt(metrics, product);

  // Effective key to use: global key takes priority over local input
  const effectiveKey = globalKey || localKey;
  const canAnalyze = effectiveKey.trim().length > 10;

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      setError('Configure sua chave de API no botão "IA" no cabeçalho do aplicativo.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await callAnthropicAPI(effectiveKey.trim(), prompt);
      onReport(result);
      setView('report');
    } catch (e: any) {
      setError(e.message || 'Erro ao chamar a API');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-violet-100 bg-violet-50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--ai-accent)' }}>
              <BrainCircuit size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800">Análise com IA</span>
              <div className="text-2xs text-slate-400 font-medium">Diagnóstico profundo da campanha</div>
            </div>
          </div>
          <IconButton icon={<X size={16}/>} label="Fechar análise" variant="ghost" size="sm" onClick={onClose} />
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Main view ── */}
          {view === 'main' && (
            <div className="p-5 space-y-4">

              {/* Context metrics summary */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'CPC', value: fmt(metrics.cpc) },
                  { label: 'CTR', value: fmtPct(metrics.ctr) },
                  { label: 'CR',  value: fmtPct(metrics.cr) },
                  { label: 'ROAS', value: fmtX(metrics.roas) },
                  { label: 'ROI',  value: fmtPct(metrics.roi, 1) },
                  { label: 'CPA',  value: fmt(metrics.cpa) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                    <div className="text-2xs font-bold text-slate-500 uppercase">{label}</div>
                    <div className="text-xs font-bold text-slate-700 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>

              {/* ── API key section ── */}
              {globalKeySet ? (
                /* Global key is configured — show status, no form */
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-emerald-700">Chave de API configurada</p>
                    <p className="text-2xs text-emerald-600 mt-0.5">Configurada via botão "IA" no cabeçalho</p>
                  </div>
                  <button
                    onClick={() => setShowLocalInput(v => !v)}
                    className="text-2xs text-emerald-600 font-semibold hover:text-emerald-800 flex-shrink-0"
                  >
                    {showLocalInput ? 'Cancelar' : 'Substituir'}
                  </button>
                </div>
              ) : (
                /* No global key — direct to header or allow local entry */
                <div className="space-y-2">
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                    <Settings size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12px] font-bold text-amber-700">Chave de API não configurada</p>
                      <p className="text-2xs text-amber-600 mt-0.5">
                        Configure uma chave pelo botão <strong>"IA"</strong> no cabeçalho para usar esta e outras funções de IA no app.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLocalInput(v => !v)}
                    className="text-[11px] text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Key size={10} /> {showLocalInput ? 'Cancelar' : 'Usar chave temporária nesta sessão'}
                  </button>
                </div>
              )}

              {/* Local key input — shown only when "Substituir" or "Usar temporária" is clicked */}
              {showLocalInput && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    <Key size={10} /> Chave de API (sessão)
                  </label>
                  <div className="relative">
                    <input
                      type={showKeyValue ? 'text' : 'password'}
                      value={localKey}
                      onChange={e => setLocalKey(e.target.value)}
                      placeholder="Cole sua chave aqui..."
                      className="w-full px-3 py-2.5 pr-20 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-300"
                    />
                    <button
                      onClick={() => setShowKeyValue(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-2xs font-bold text-slate-500 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100"
                    >
                      {showKeyValue ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <p className="text-2xs text-slate-400">
                    Não salva — válida apenas para esta sessão. Para persistir, use o botão "IA" no cabeçalho.
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 border border-red-100 rounded-xl px-3 py-2.5 text-xs font-medium">
                  <AlertCircle size={13} className="flex-shrink-0 mt-px" />
                  <span>{error}</span>
                </div>
              )}

              {/* Analyze button */}
              <Button
                variant="ai"
                size="md"
                onClick={handleAnalyze}
                disabled={loading || !canAnalyze}
                loading={loading}
                iconLeft={!loading ? <Send size={14}/> : undefined}
                fullWidth
                className="py-3"
              >
                {loading ? 'Analisando...' : 'Analisar com IA'}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-2xs font-bold text-slate-300 uppercase">ou</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Copy prompt fallback */}
              <button
                onClick={handleCopyPrompt}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? 'Prompt copiado!' : 'Copiar prompt para outra IA'}
              </button>

              {/* View existing report */}
              {aiReport && (
                <button
                  onClick={() => setView('report')}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Ver último relatório <ChevronRight size={12} />
                </button>
              )}
            </div>
          )}

          {/* ── Report view ── */}
          {view === 'report' && aiReport && (
            <div className="p-5 space-y-4">
              {/* Diagnóstico */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={13} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Diagnóstico</span>
                </div>
                <p className="text-sm text-blue-900 leading-relaxed">{aiReport.diagnostico}</p>
              </div>

              {/* Sugestões */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Sugestões de Otimização</span>
                {aiReport.sugestoes.map((s, i) => {
                  const key = s.priority?.toUpperCase() || 'MEDIA';
                  const style = PRIORITY_STYLE[key] || PRIORITY_STYLE.MEDIA;
                  return (
                    <div key={i} className={`rounded-xl border p-3.5 ${style.bg} ${style.border}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-bold ${style.text}`}>{s.area}</span>
                        <span className={`text-2xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/60 ${style.text}`}>{s.priority}</span>
                      </div>
                      <p className={`text-xs font-semibold mb-1 ${style.text}`}>{s.action}</p>
                      <p className="text-[11px] text-slate-500 leading-snug">{s.details}</p>
                      {s.resultado && (
                        <div className="mt-2 flex items-center gap-1.5 text-2xs text-emerald-700 font-semibold">
                          <Target size={10} />
                          {s.resultado}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
          {view === 'report' ? (
            <Button variant="ghost" size="sm" iconLeft={<ArrowLeft size={12}/>} onClick={() => setView('main')}>
              Nova análise
            </Button>
          ) : (
            <div />
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
};

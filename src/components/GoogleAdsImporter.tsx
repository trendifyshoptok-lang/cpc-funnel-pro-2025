/**
 * GoogleAdsImporter
 *
 * Drag-and-drop / file picker for Google Ads CSV exports.
 * States: idle → parsing → preview → (confirm → done) | error
 *
 * Supported column aliases (pt-BR + en):
 *   campaign, impressions, clicks, cost, conversions, conversionValue
 *
 * Design System: uses CardShell, Button, IconButton, Money (Moneyness tokens)
 */
import React, { useState, useCallback, useRef } from 'react';
import type { DragEvent } from 'react';
import Papa from 'papaparse';
import {
  Upload,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  X,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  MousePointer,
  Eye,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import { CardShell, Button, IconButton, Money } from './ui';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GoogleAdsRow {
  /** Raw campaign name from Google Ads */
  campaign: string;
  impressions: number;
  clicks: number;
  /** Cost in BRL (or local currency) */
  cost: number;
  conversions: number;
  conversionValue: number;
  /** Derived */
  ctr: number;
  cpc: number;
  cr: number;
  roas: number;
}

interface ParseResult {
  rows: GoogleAdsRow[];
  /** Lines skipped due to parse errors */
  skippedCount: number;
  /** Unrecognized headers found (for debugging) */
  unknownHeaders: string[];
}

interface ErrorDetail {
  type: 'file-type' | 'encoding' | 'missing-columns' | 'empty' | 'parse';
  message: string;
  /** Specific missing columns if type === 'missing-columns' */
  missingColumns?: string[];
}

interface WarningDetail {
  message: string;
  skippedCount: number;
}

interface Props {
  onImport: (rows: GoogleAdsRow[]) => void;
  onClose?: () => void;
  /**
   * When true, renders without the outer CardShell (for embedding inside
   * another card, e.g. CampaignInputs). The header icon/title are omitted;
   * the close button is replaced by nothing (parent handles navigation).
   */
  inline?: boolean;
}

// ─── Column alias maps ─────────────────────────────────────────────────────────

const COLUMN_ALIASES: Record<keyof Omit<GoogleAdsRow, 'ctr' | 'cpc' | 'cr' | 'roas'>, string[]> = {
  campaign:        ['Campanha', 'Campaign', 'Nome da campanha', 'Campaign name'],
  impressions:     ['Impressões', 'Impressions', 'Impr.', 'Impressoes'],
  clicks:          ['Cliques', 'Clicks'],
  cost:            ['Custo', 'Cost', 'Custo (BRL)', 'Custo (R$)', 'Custo total', 'Cost (BRL)'],
  conversions:     ['Conversões', 'Conversions', 'Todas as conv.', 'Conv.', 'Conversoes'],
  conversionValue: ['Valor da conversão', 'Conv. value', 'Valor de conversão', 'Valor conv.', 'Conversion value', 'Valor da conversao'],
};

const REQUIRED_KEYS: Array<keyof typeof COLUMN_ALIASES> = [
  'campaign', 'impressions', 'clicks', 'cost', 'conversions',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Robustly parses Brazilian and US number strings.
 * "1.234,56" → 1234.56  |  "1,234.56" → 1234.56  |  "1234.56" → 1234.56
 * Strips currency symbols, whitespace.
 */
function parseNumber(raw: string | undefined | null): number {
  if (raw === undefined || raw === null) return 0;
  const s = String(raw).trim().replace(/[R$\s%]/g, '');
  if (s === '' || s === '--' || s === '-') return 0;

  // Detect pt-BR: has comma as decimal separator ("1.234,56" or "1,56")
  const hasPtBrDecimal = /,\d{1,2}$/.test(s) && s.includes(',');
  const hasUsDecimal   = /\.\d{1,2}$/.test(s) && s.includes('.');

  if (hasPtBrDecimal) {
    // Remove thousands dots, swap comma decimal
    return parseFloat(s.replace(/\./g, '').replace(',', '.'));
  }
  if (hasUsDecimal) {
    // Remove thousands commas
    return parseFloat(s.replace(/,/g, ''));
  }
  // Plain integer or decimal
  return parseFloat(s.replace(/,/g, '')) || 0;
}

/**
 * Normalize header: lowercase, remove accents, trim.
 * Used to build a case-insensitive lookup.
 */
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/**
 * Build a map from normalized-alias → field key.
 */
function buildAliasLookup(): Map<string, keyof typeof COLUMN_ALIASES> {
  const map = new Map<string, keyof typeof COLUMN_ALIASES>();
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      map.set(normalizeHeader(alias), key as keyof typeof COLUMN_ALIASES);
    }
  }
  return map;
}

const ALIAS_LOOKUP = buildAliasLookup();

/**
 * Map raw CSV headers to our field keys.
 * Returns { fieldMap, missingRequired, unknownHeaders }
 */
function mapHeaders(headers: string[]): {
  fieldMap: Record<string, keyof typeof COLUMN_ALIASES>;
  missingRequired: string[];
  unknownHeaders: string[];
} {
  const fieldMap: Record<string, keyof typeof COLUMN_ALIASES> = {};
  const mapped = new Set<keyof typeof COLUMN_ALIASES>();

  for (const h of headers) {
    const normalized = normalizeHeader(h);
    const key = ALIAS_LOOKUP.get(normalized);
    if (key) {
      fieldMap[h] = key;
      mapped.add(key);
    }
  }

  const missingRequired = REQUIRED_KEYS.filter(k => !mapped.has(k));
  const unknownHeaders = headers.filter(h => !fieldMap[h]);

  return { fieldMap, missingRequired, unknownHeaders };
}

/**
 * Convert a raw CSV row object → GoogleAdsRow.
 * Returns null if the row has no campaign name (blank separator row).
 */
function convertRow(
  raw: Record<string, string>,
  fieldMap: Record<string, keyof typeof COLUMN_ALIASES>
): GoogleAdsRow | null {
  const mapped: Partial<Record<keyof typeof COLUMN_ALIASES, string>> = {};

  for (const [header, field] of Object.entries(fieldMap)) {
    mapped[field] = raw[header] ?? '';
  }

  const campaign = (mapped.campaign ?? '').trim();
  if (!campaign) return null;

  const impressions     = parseNumber(mapped.impressions);
  const clicks          = parseNumber(mapped.clicks);
  const cost            = parseNumber(mapped.cost);
  const conversions     = parseNumber(mapped.conversions);
  const conversionValue = parseNumber(mapped.conversionValue);

  const ctr  = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc  = clicks > 0      ? cost / clicks              : 0;
  const cr   = clicks > 0      ? (conversions / clicks) * 100 : 0;
  const roas = cost > 0        ? conversionValue / cost      : 0;

  return { campaign, impressions, clicks, cost, conversions, conversionValue, ctr, cpc, cr, roas };
}

/** Parse full CSV text using PapaParse */
function parseCsv(text: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    // Google Ads sometimes wraps values in double quotes
    quoteChar: '"',
    // Strip BOM if present
    transform: (value) => value.trim(),
  });

  if (!result.meta.fields || result.meta.fields.length === 0) {
    throw { type: 'empty', message: 'Nenhuma coluna detectada no arquivo.' } as ErrorDetail;
  }

  const { fieldMap, missingRequired, unknownHeaders } = mapHeaders(result.meta.fields);

  if (missingRequired.length > 0) {
    throw {
      type: 'missing-columns',
      message: `Colunas obrigatórias não encontradas`,
      missingColumns: missingRequired,
    } as ErrorDetail;
  }

  let skippedCount = 0;
  const rows: GoogleAdsRow[] = [];

  for (const rawRow of result.data) {
    try {
      const row = convertRow(rawRow, fieldMap);
      if (row) rows.push(row);
      else skippedCount++; // blank separator rows
    } catch {
      skippedCount++;
    }
  }

  if (rows.length === 0) {
    throw { type: 'empty', message: 'Nenhuma linha de dados válida encontrada.' } as ErrorDetail;
  }

  return { rows, skippedCount, unknownHeaders };
}

// ─── Summary computation ───────────────────────────────────────────────────────

function computeSummary(rows: GoogleAdsRow[]) {
  return rows.reduce(
    (acc, r) => ({
      campaigns:       acc.campaigns + 1,
      impressions:     acc.impressions + r.impressions,
      clicks:          acc.clicks + r.clicks,
      cost:            acc.cost + r.cost,
      conversions:     acc.conversions + r.conversions,
      conversionValue: acc.conversionValue + r.conversionValue,
    }),
    { campaigns: 0, impressions: 0, clicks: 0, cost: 0, conversions: 0, conversionValue: 0 }
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const PREVIEW_LIMIT = 50;

function intFmt(n: number): string {
  return new Intl.NumberFormat('pt-BR').format(Math.round(n));
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconBg: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, iconBg }) => (
  <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-2xs text-slate-500 font-medium leading-none mb-1">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────

type UIState = 'idle' | 'parsing' | 'preview' | 'error';

export const GoogleAdsImporter: React.FC<Props> = ({ onImport, onClose, inline = false }) => {
  const [uiState, setUiState] = useState<UIState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<ErrorDetail | null>(null);
  const [warning, setWarning] = useState<WarningDetail | null>(null);
  const [rows, setRows] = useState<GoogleAdsRow[]>([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File processing ──────────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError({ type: 'file-type', message: 'Apenas arquivos .csv são suportados. Exporte do Google Ads em formato CSV.' });
      setUiState('error');
      return;
    }

    setFileName(file.name);
    setUiState('parsing');
    setError(null);
    setWarning(null);

    // Use FileReader to handle UTF-8 / UTF-16 BOM
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        if (!text || text.trim().length === 0) {
          throw { type: 'empty', message: 'O arquivo está vazio.' } as ErrorDetail;
        }

        const result = parseCsv(text);
        setRows(result.rows);

        // Warn if many rows skipped
        if (result.skippedCount > 0) {
          const pct = (result.skippedCount / (result.rows.length + result.skippedCount)) * 100;
          if (pct > 20) {
            setWarning({
              message: `${result.skippedCount} linha(s) ignorada(s) por dados inválidos (${pct.toFixed(0)}% do total). Verifique o formato do arquivo.`,
              skippedCount: result.skippedCount,
            });
          }
        }

        setUiState('preview');
      } catch (e) {
        if (e && typeof e === 'object' && 'type' in e) {
          setError(e as ErrorDetail);
        } else {
          setError({ type: 'parse', message: 'Não foi possível processar o arquivo. Verifique se não está corrompido.' });
        }
        setUiState('error');
      }
    };
    reader.onerror = () => {
      setError({ type: 'encoding', message: 'Erro ao ler o arquivo. Tente salvar novamente em UTF-8.' });
      setUiState('error');
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const reset = useCallback(() => {
    setUiState('idle');
    setError(null);
    setWarning(null);
    setRows([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ── Drag & drop ───────────────────────────────────────────────────────────────

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ── Confirm ───────────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    onImport(rows);
    onClose?.();
  };

  // ── Summary ───────────────────────────────────────────────────────────────────

  const summary = uiState === 'preview' ? computeSummary(rows) : null;
  const previewRows = rows.slice(0, PREVIEW_LIMIT);
  const hiddenCount = rows.length - previewRows.length;

  // ─── Render ───────────────────────────────────────────────────────────────────

  const body = (
    <>
      {/* ── IDLE ─────────────────────────────────────────────────────────────── */}
      {uiState === 'idle' && (
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center gap-3
              rounded-2xl border-2 border-dashed transition-all cursor-pointer
              min-h-[200px] px-6 py-10
              ${isDragging
                ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40'
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging ? 'bg-blue-100' : 'bg-white border border-slate-200'
            }`}>
              <Upload size={24} className={isDragging ? 'text-blue-600' : 'text-slate-400'} />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {isDragging ? 'Solte aqui' : 'Arraste o CSV ou clique para selecionar'}
              </p>
              <p className="text-2xs text-slate-400">
                Exporte: Google Ads → Campanhas → Download → CSV
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              Selecionar arquivo
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Format hint */}
          <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <FileText size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-2xs font-semibold text-slate-600 mb-1">Colunas reconhecidas</p>
              <p className="text-2xs text-slate-400 leading-relaxed">
                Campanha · Impressões · Cliques · Custo · Conversões · Valor da conversão
              </p>
              <p className="text-2xs text-slate-400 mt-1">
                Aceita exportações em português (pt-BR) e inglês (en). Valores como "R$ 1.234,56" são convertidos automaticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── PARSING ──────────────────────────────────────────────────────────── */}
      {uiState === 'parsing' && (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[200px] py-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <RefreshCw size={20} className="text-blue-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">Processando arquivo…</p>
            {fileName && (
              <p className="text-2xs text-slate-400 truncate max-w-[240px]">{fileName}</p>
            )}
          </div>
        </div>
      )}

      {/* ── ERROR ────────────────────────────────────────────────────────────── */}
      {uiState === 'error' && error && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-800 mb-1">{error.message}</p>

              {error.type === 'missing-columns' && error.missingColumns && (
                <div className="mt-2">
                  <p className="text-2xs text-red-600 font-medium mb-1.5">Faltando:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {error.missingColumns.map(col => (
                      <span key={col} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-2xs font-mono font-bold">
                        {col}
                      </span>
                    ))}
                  </div>
                  <p className="text-2xs text-red-500 mt-2">
                    Dica: No Google Ads, adicione essas colunas ao relatório antes de exportar.
                  </p>
                </div>
              )}

              {error.type === 'file-type' && (
                <p className="text-2xs text-red-600 mt-1">
                  No Google Ads: Campanhas → ícone de download → "Campanhas (CSV)".
                </p>
              )}
            </div>
          </div>

          <Button variant="secondary" size="sm" iconLeft={<RefreshCw size={13} />} onClick={reset}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ── PREVIEW ──────────────────────────────────────────────────────────── */}
      {uiState === 'preview' && summary && (
        <div className="space-y-5">
          {/* Warning banner (>20% skipped) */}
          {warning && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-2xs text-amber-800 leading-relaxed">{warning.message}</p>
            </div>
          )}

          {/* Success pill */}
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500" />
            <p className="text-sm font-semibold text-slate-700">
              {rows.length} campanha{rows.length !== 1 ? 's' : ''} lida{rows.length !== 1 ? 's' : ''} com sucesso
            </p>
            {fileName && (
              <span className="ml-auto text-2xs text-slate-400 truncate max-w-[180px]">{fileName}</span>
            )}
          </div>

          {/* KPI summary grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            <SummaryCard
              icon={<Eye size={14} className="text-slate-500" />}
              iconBg="bg-slate-100"
              label="Impressões"
              value={<span className="num-volume">{intFmt(summary.impressions)}</span>}
            />
            <SummaryCard
              icon={<MousePointer size={14} className="text-blue-500" />}
              iconBg="bg-blue-50"
              label="Cliques"
              value={<span className="num-volume">{intFmt(summary.clicks)}</span>}
            />
            <SummaryCard
              icon={<DollarSign size={14} className="text-slate-500" />}
              iconBg="bg-slate-100"
              label="Custo Total"
              value={<Money value={summary.cost} intent="volume" format="brl" />}
            />
            <SummaryCard
              icon={<ShoppingCart size={14} className="text-emerald-500" />}
              iconBg="bg-emerald-50"
              label="Conversões"
              value={<span className="num-positive">{intFmt(summary.conversions)}</span>}
            />
            <SummaryCard
              icon={<TrendingUp size={14} className="text-emerald-500" />}
              iconBg="bg-emerald-50"
              label="Valor Convertido"
              value={<Money value={summary.conversionValue} intent="positive" format="brl" />}
            />
            <SummaryCard
              icon={<ChevronRight size={14} className="text-blue-500" />}
              iconBg="bg-blue-50"
              label="Campanhas"
              value={<span className="num-volume">{summary.campaigns}</span>}
            />
          </div>

          {/* Data table */}
          <div>
            <p className="text-2xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">
              Prévia dos dados
              {hiddenCount > 0 && (
                <span className="ml-2 normal-case font-normal text-slate-400">
                  (mostrando {PREVIEW_LIMIT} de {rows.length})
                </span>
              )}
            </p>
            <div className="overflow-auto rounded-xl border border-slate-200 max-h-72">
              <table className="w-full text-xs border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    {['Campanha', 'Impressões', 'Cliques', 'Custo', 'Conv.', 'Valor Conv.', 'CPC', 'CR%', 'ROAS'].map(h => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-2xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap first:pl-4 last:pr-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-3 py-2.5 pl-4 max-w-[180px]">
                        <span className="text-slate-700 font-medium truncate block">{row.campaign}</span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        <span className="num-volume">{intFmt(row.impressions)}</span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        <span className="num-volume">{intFmt(row.clicks)}</span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        <Money value={row.cost} intent="volume" format="brl" className="text-xs" />
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        <span className="num-positive">{intFmt(row.conversions)}</span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        <Money value={row.conversionValue} intent="positive" format="brl" className="text-xs" />
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        <Money value={row.cpc} intent="volume" format="brl" className="text-xs" />
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        <span className={row.cr >= 1 ? 'num-positive' : row.cr > 0 ? 'num-warning' : 'num-neutral'}>
                          {row.cr.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 pr-4 tabular-nums">
                        <span className={row.roas >= 1 ? 'num-positive' : 'num-negative'}>
                          {row.roas.toFixed(2)}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {hiddenCount > 0 && (
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <span className="text-2xs text-slate-400">
                    + {hiddenCount} campanha{hiddenCount !== 1 ? 's' : ''} não exibida{hiddenCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button variant="ghost" size="sm" iconLeft={<RefreshCw size={13} />} onClick={reset}>
              Importar outro arquivo
            </Button>
            <div className="flex items-center gap-2">
              {onClose && (
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
              )}
              <Button variant="save" size="sm" iconLeft={<CheckCircle2 size={14} />} onClick={handleConfirm}>
                Confirmar importação
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (inline) {
    return <div className="space-y-4">{body}</div>;
  }

  return (
    <CardShell
      icon={<Upload size={14} />}
      iconBg="bg-blue-600"
      title="Importar Google Ads"
      subtitle="CSV exportado do painel de campanhas"
      headerRight={
        onClose && (
          <IconButton
            icon={<X size={14} />}
            label="Fechar importador"
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        )
      }
      className="w-full"
    >
      {body}
    </CardShell>
  );
};

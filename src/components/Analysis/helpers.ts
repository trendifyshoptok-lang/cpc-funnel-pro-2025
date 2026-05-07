import type { Product, AlertConfig } from '../../types';

// ── Formatters ────────────────────────────────────────────────────────────────
export const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const fmtPct = (n: number, d = 2) => `${n.toFixed(d)}%`;

export const fmtX = (n: number) => `${n.toFixed(2)}x`;

export const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
};

// ── Health Score ──────────────────────────────────────────────────────────────
interface HealthInputs {
  cpc: number;
  ctr: number;
  cr: number;
  roas: number;
  roi: number;
  spend: number;
  conversions: number;
  product: Product;
  alertConfig: AlertConfig;
}

export function computeHealthScore({
  cpc, ctr, cr, roas, roi, spend, product, alertConfig,
}: HealthInputs): number {
  if (spend === 0) return 0;

  let score = 50;

  // CTR (±15)
  if (ctr >= 5) score += 15;
  else if (ctr >= 3) score += 8;
  else if (ctr >= 1.5) score += 2;
  else if (ctr < 1) score -= 12;

  // CR (±20)
  const reqCR = product.requiredCR || 1;
  if (cr >= reqCR * 1.2) score += 20;
  else if (cr >= reqCR) score += 12;
  else if (cr >= reqCR * 0.6) score += 4;
  else if (cr < reqCR * 0.3) score -= 15;
  else score -= 5;

  // ROAS (±15)
  if (roas >= 3) score += 15;
  else if (roas >= alertConfig.roasMin * 1.5) score += 10;
  else if (roas >= alertConfig.roasMin) score += 5;
  else if (roas < 1) score -= 15;
  else score -= 5;

  // ROI (±10)
  if (roi >= 80) score += 10;
  else if (roi >= 30) score += 5;
  else if (roi < 0) score -= 10;

  // CPC (±10)
  if (cpc > 0) {
    if (cpc <= product.cpcBom) score += 10;
    else if (cpc <= product.cpcInter) score += 5;
    else if (cpc > product.cpcApert) score -= 10;
    else score -= 3;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export interface HealthConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  bar: string;
  stroke: string;
}

export function getHealthConfig(score: number): HealthConfig {
  if (score >= 80) return { label: 'Excelente', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500', stroke: '#10b981' };
  if (score >= 60) return { label: 'Bom', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-500', stroke: '#3b82f6' };
  if (score >= 40) return { label: 'Regular', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500', stroke: '#f59e0b' };
  if (score >= 20) return { label: 'Critico', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', bar: 'bg-orange-500', stroke: '#f97316' };
  return { label: 'Emergencia', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500', stroke: '#ef4444' };
}

// ── Auto-suggestions from metrics ─────────────────────────────────────────────
export interface AutoSuggestion {
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
  area: string;
  action: string;
  details: string;
}

export function generateAutoSuggestions(
  metrics: { cpc: number; ctr: number; cr: number; roas: number; roi: number },
  product: Product,
  alertConfig: AlertConfig,
): AutoSuggestion[] {
  const suggestions: AutoSuggestion[] = [];
  const { cpc, ctr, cr, roas, roi } = metrics;

  if (roi < 0) {
    suggestions.push({
      priority: 'ALTA',
      area: 'ROI',
      action: 'Pausar ou redirecionar orcamento imediatamente',
      details: `ROI negativo de ${Math.abs(roi).toFixed(1)}% indica prejuizo por venda. Reduza lances ou pause anuncios de baixa relevancia ate o CR melhorar.`,
    });
  }

  if (cpc > product.cpcApert) {
    // CPC alto, mas campanha lucrativa (ROAS bom e ROI positivo) — otimizar sem pausar
    if (roas >= 2 && roi > 0) {
      suggestions.push({
        priority: 'MEDIA',
        area: 'CPC',
        action: `Otimizar CPC sem pausar — campanha lucrativa`,
        details: `CPC R$${cpc.toFixed(2)} acima do limite mas ROAS ${roas.toFixed(2)}x garante lucro solido. Reduza lances nas keywords de menor conversao; mantenha ativas as que convertem.`,
      });
    } else {
      // ROI negativo ou ROAS fraco: CPC alto está de fato prejudicando
      suggestions.push({
        priority: 'ALTA',
        area: 'CPC',
        action: `Reduzir lance maximo para R$${product.cpcApert.toFixed(2)}`,
        details: `CPC R$${cpc.toFixed(2)} acima do limite e ROI comprometido. Reduza lances por palavra-chave e exclua keywords com CPC alto e zero conversoes.`,
      });
    }
  }

  if (ctr < 1.5) {
    suggestions.push({
      priority: 'ALTA',
      area: 'CTR',
      action: 'Reescrever headline dos anuncios',
      details: `CTR ${ctr.toFixed(2)}% esta muito baixo. Teste novos angulos na headline: beneficio direto, urgencia ou prova social. Adicione extensoes de site e callout.`,
    });
  } else if (ctr < 2.5) {
    suggestions.push({
      priority: 'MEDIA',
      area: 'CTR',
      action: 'Otimizar copy dos anuncios (A/B)',
      details: `CTR ${ctr.toFixed(2)}% esta abaixo do ideal de 3%. Crie 2-3 variacoes de headline e description para teste A/B.`,
    });
  }

  if (cr < product.requiredCR * 0.5) {
    suggestions.push({
      priority: 'ALTA',
      area: 'Landing Page',
      action: 'Revisar pagina de destino urgente',
      details: `CR ${cr.toFixed(2)}% e menos da metade da meta ${product.requiredCR.toFixed(2)}%. Verifique velocidade da pagina, headline, CTA e prova social. Considere heat map.`,
    });
  } else if (cr < product.requiredCR) {
    suggestions.push({
      priority: 'MEDIA',
      area: 'Conversao',
      action: 'Testar variacao de oferta ou VSL',
      details: `CR ${cr.toFixed(2)}% abaixo da meta ${product.requiredCR.toFixed(2)}%. Teste novo CTA, depoimentos na LP ou um video curto de vendas.`,
    });
  }

  if (roas > 0 && roas < alertConfig.roasMin) {
    suggestions.push({
      priority: 'MEDIA',
      area: 'ROAS',
      action: 'Segmentar publico mais qualificado',
      details: `ROAS ${roas.toFixed(2)}x abaixo da meta ${alertConfig.roasMin}x. Refine segmentacao por intencao de compra, adicione negativos para termos informativos.`,
    });
  }

  if (cpc <= product.cpcBom && cr >= product.requiredCR && roas >= alertConfig.roasMin * 1.5) {
    suggestions.push({
      priority: 'BAIXA',
      area: 'Escala',
      action: 'Aumentar orcamento em 20-30%',
      details: `Metricas excelentes! CPC bom, CR acima da meta e ROAS forte. Momento ideal para escalar com seguranca. Aumente o orcamento diario gradualmente.`,
    });
  }

  // CPC alto mas ROI/ROAS excelentes: campanha madura, sugerir escala cautelosa
  if (cpc > product.cpcApert && roas >= 4 && roi > 100) {
    suggestions.push({
      priority: 'BAIXA',
      area: 'Escala',
      action: 'Considerar escala mesmo com CPC alto',
      details: `ROAS ${roas.toFixed(2)}x e ROI ${roi.toFixed(0)}% indicam campanha muito lucrativa apesar do CPC elevado. Antes de escalar, tente otimizar o CPC para ampliar margem.`,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      priority: 'BAIXA',
      area: 'Monitoramento',
      action: 'Continuar coletando dados',
      details: 'Campanha dentro dos parametros. Aguarde mais dados (minimo 50-100 cliques) para decisoes mais precisas.',
    });
  }

  return suggestions;
}

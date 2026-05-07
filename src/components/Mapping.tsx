// @ts-nocheck
import React, { useState, useEffect } from 'react';
import type { Product, Temperature, Offer, FunnelStage } from '../types';
import { calculateProductMetrics, calculateViability } from '../services/logic';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from './ui/Button';
import { 
  CheckCircle2, AlertTriangle, Search, Save, Info, Flame, Calculator, 
  HelpCircle, FileText, Plus, Trash2, TrendingUp, Target, Crosshair, 
  Filter, Pickaxe, ScanSearch, ArrowRight, CheckSquare, Microscope, 
  Download, Clock
} from 'lucide-react';

interface MappingProps {
  onSave: (product: Product) => void;
}

type SelectionMode = 'none' | 'discovery' | 'validation';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
}

export const Mapping: React.FC<MappingProps> = ({ onSave }) => {
  const { rates } = useCurrency();

  // --- ESTADOS DE NAVEGAÇÃO ---
  const [mode, setMode] = useState<SelectionMode>('discovery');
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showMethods, setShowMethods] = useState(false);

  // --- ESTADOS DE UI ---
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // --- CHECKLISTS ---
  const [discoveryMethods, setDiscoveryMethods] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('mapping_discovery_methods');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'm1', 
        label: 'SimilarWeb - Checkout Marketplaces (Referral)', 
        description: 'Acessar Website Analytics → Referral e Incoming Traffic → Colar URL do checkout. Objetivo: Identificar produtos com alto índice de checkout. (Atualização diária).', 
        checked: false 
      },
      { 
        id: 'm2', 
        label: 'SEMrush - Checkout Marketplaces (Subpastas)', 
        description: 'Acessar Traffic Analytics → Jornada de Tráfego → Inserir link checkout → Opção "Subpastas" e pesquisar. Objetivo: Ver tráfego específico de checkouts. (Atualização mensal entre dias 7-10).', 
        checked: false 
      },
      { 
        id: 'm3', 
        label: 'Indicação do Gerente da Plataforma', 
        description: 'Pedir diretamente ao gerente da plataforma lista de produtos que estão performando bem (Top Afiliados).', 
        checked: false 
      },
      { 
        id: 'm4', 
        label: 'Garimpo via Concorrente (I Search From)', 
        description: 'I Search From (Nome do produto + Local) → Copiar link do concorrente → SEMrush (Acessar Publicidade > Pesquisa Publicitária) → Colar o domínio da URL.', 
        checked: false 
      },
      { 
        id: 'm5', 
        label: 'SimilarWeb - Análise de Domínio/Produto', 
        description: 'Aba Website Analytics e Website Performance (Filtro 28 dias). Evitar produtos com +20% de tráfego de países irrelevantes (BR, Índia, Indonésia). Atentar ao tráfego mobile.', 
        checked: false 
      }
    ];
  });

  const [mandatoryCriteria, setMandatoryCriteria] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('mapping_mandatory_criteria');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'c1', 
        label: 'Comissão de pelo menos 30%', 
        description: 'O produto deve pagar uma porcentagem justa para cobrir os custos de tráfego e sobrar margem.', 
        checked: false 
      },
      { 
        id: 'c2', 
        label: 'Comissão acima de R$ 100,00', 
        description: 'Comissões baixas exigem CPC muito barato. Acima de R$ 100 permite maior margem de erro.', 
        checked: false 
      },
      { 
        id: 'c3', 
        label: 'Nome/Produtor Fundo de Funil', 
        description: 'Procurar no www.isearchfrom.com: Se o nome é fundo de funil, se aparece assuntos sobre a palavra chave no google naquele país, se nas imagens aparecem imagens relacionadas ao produto.', 
        checked: false 
      },
      { 
        id: 'c4', 
        label: 'Estratégia Fundo de Funil permitida no Google Ads', 
        description: 'Verificar nas regras de afiliação se é permitido comprar a palavra-chave do nome do produto no Google.', 
        checked: false 
      },
      { 
        id: 'c5', 
        label: 'Tem fonte de tráfego nas Redes Sociais?', 
        description: 'Verificar Instagram/Youtube do produtor. Conteúdo novo e engajamento alimentam as buscas no Google.', 
        checked: false 
      },
      { 
        id: 'c6', 
        label: 'Sazonalidade Verificada', 
        description: 'É produto sazonal? Perpétuo ou lançamento? Garanta que há busca ativa agora.', 
        checked: false 
      }
    ];
  });

  // --- FORMULÁRIO ---
  const [form, setForm] = useState<Partial<Product>>(() => {
    const saved = localStorage.getItem('mapping_form_draft');
    return saved ? JSON.parse(saved) : {
      market: 'BR',
      type: 'fisico',
      qualityLP: 'boa',
      hasUpsells: false,
      nicho: 'emagrecimento',
      temperature: 'morno',
      platform: 'Hotmart',
      analysisDate: new Date().toISOString().split('T')[0],
      manualBenchmarkCPC: 0,
      advertiserCount: 5,
      funnelStage: 'fundo',
      offers: []
    };
  });
  
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({ name: 'Kit 1 Pote', price: 0, commissionPct: 0 });
  const [result, setResult] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
// --- SAVE AUTOMÁTICO DESABILITADO ---
// O formulário ainda carrega rascunhos salvos manualmente, mas não salva a cada tecla
useEffect(() => {
  localStorage.setItem('mapping_discovery_methods', JSON.stringify(discoveryMethods));
}, [discoveryMethods]); //  RODA QUANDO discoveryMethods MUDA

useEffect(() => {
  localStorage.setItem('mapping_mandatory_criteria', JSON.stringify(mandatoryCriteria));
}, [mandatoryCriteria]); //  RODA QUANDO mandatoryCriteria MUDA

  useEffect(() => {
    if (mode !== 'none') {
      localStorage.setItem('mapping_mode', mode);
      localStorage.setItem('mapping_showDeepAnalysis', String(showDeepAnalysis));
    }
  }, [mode, showDeepAnalysis]);

  // Recuperar estado ao carregar
  useEffect(() => {
    const savedMode = localStorage.getItem('mapping_mode');
    const savedDeepAnalysis = localStorage.getItem('mapping_showDeepAnalysis');
    if (savedMode) setMode(savedMode as SelectionMode);
    if (savedDeepAnalysis === 'true') setShowDeepAnalysis(true);
  }, []);

  // --- FUNÇÕES DE CONTROLE ---
  const toggleMethod = (id: string) => {
    setDiscoveryMethods(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const toggleCriteria = (id: string) => {
    setMandatoryCriteria(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleApprovePreSelection = () => {
    setShowDeepAnalysis(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

 const handleResetMapping = () => {
  if (window.confirm('️ Isso vai limpar todos os dados do mapeamento atual. Confirma?')) {
    // Limpar localStorage
    localStorage.removeItem('mapping_form_draft');
    localStorage.removeItem('mapping_discovery_methods');
    localStorage.removeItem('mapping_mandatory_criteria');
    localStorage.removeItem('mapping_mode');
    localStorage.removeItem('mapping_showDeepAnalysis');
    
    // Resetar estados do React
    setMode('none');
    setShowDeepAnalysis(false);
    setExpandedItem(null);
    setResult(null);
    setAutoSaveStatus('idle');
    setLastSaveTime(null);
    
    // Resetar checklists
    setDiscoveryMethods([
      {
        id: 'm1',
        label: 'SimilarWeb - Checkout Marketplaces (Referral)',
        description: 'Acessar Website Analytics → Referral e Incoming Traffic → Colar URL do checkout. Objetivo: Identificar produtos com alto índice de checkout. (Atualização diária).',
        checked: false
      },
      {
        id: 'm2',
        label: 'SEMrush - Checkout Marketplaces (Subpastas)',
        description: 'Acessar Traffic Analytics → Jornada de Tráfego → Inserir link checkout → Opção "Subpastas" e pesquisar. Objetivo: Ver tráfego específico de checkouts. (Atualização mensal entre dias 7-10).',
        checked: false
      },
      {
        id: 'm3',
        label: 'Indicação do Gerente da Plataforma',
        description: 'Pedir diretamente ao gerente da plataforma lista de produtos que estão performando bem (Top Afiliados).',
        checked: false
      },
      {
        id: 'm4',
        label: 'Garimpo via Concorrente (I Search From)',
        description: 'I Search From (Nome do produto + Local) → Copiar link do concorrente → SEMrush (Acessar Publicidade > Pesquisa Publicitária) → Colar o domínio da URL.',
        checked: false
      },
      {
        id: 'm5',
        label: 'SimilarWeb - Análise de Domínio/Produto',
        description: 'Aba Website Analytics e Website Performance (Filtro 28 dias). Evitar produtos com +20% de tráfego de países irrelevantes (BR, Índia, Indonésia). Atentar ao tráfego mobile.',
        checked: false
      }
    ]);
    
    setMandatoryCriteria([
      {
        id: 'c1',
        label: 'Comissão de pelo menos 30%',
        description: 'O produto deve pagar uma porcentagem justa para cobrir os custos de tráfego e sobrar margem.',
        checked: false
      },
      {
        id: 'c2',
        label: 'Comissão acima de R$ 100,00',
        description: 'Comissões baixas exigem CPC muito barato. Acima de R$ 100 permite maior margem de erro.',
        checked: false
      },
      {
        id: 'c3',
        label: 'Nome/Produtor Fundo de Funil',
        description: 'Procurar no www.isearchfrom.com: Se o nome é fundo de funil, se aparece assuntos sobre a palavra chave no google naquele país, se nas imagens aparecem imagens relacionadas ao produto.',
        checked: false
      },
      {
        id: 'c4',
        label: 'Estratégia Fundo de Funil permitida no Google Ads',
        description: 'Verificar nas regras de afiliação se é permitido comprar a palavra-chave do nome do produto no Google.',
        checked: false
      },
      {
        id: 'c5',
        label: 'Tem fonte de tráfego nas Redes Sociais?',
        description: 'Verificar Instagram/Youtube do produtor. Conteúdo novo e engajamento alimentam as buscas no Google.',
        checked: false
      },
      {
        id: 'c6',
        label: 'Sazonalidade Verificada',
        description: 'É produto sazonal? Perpétuo ou lançamento? Garanta que há busca ativa agora.',
        checked: false
      }
    ]);
    
    // Resetar formulário
    setForm({
      market: 'BR',
      type: 'fisico',
      qualityLP: 'boa',
      hasUpsells: false,
      nicho: 'emagrecimento',
      temperature: 'morno',
      platform: 'Hotmart',
      analysisDate: new Date().toISOString().split('T')[0],
      manualBenchmarkCPC: 0,
      advertiserCount: 5,
      funnelStage: 'fundo',
      offers: []
    });
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

  // --- EXPORTAR PDF ---
  const handleExportPDF = () => {
    if (!result) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Análise - ${result.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
          h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; border-left: 4px solid #3b82f6; padding-left: 10px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
          .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
          .aprovado { background: #10b981; color: white; }
          .reprovado { background: #ef4444; color: white; }
          .metric { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .metric-label { font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase; }
          .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .reason { background: ${result.viabilityStatus === 'APROVADO' ? '#d1fae5' : '#fee2e2'}; 
                    border-left: 4px solid ${result.viabilityStatus === 'APROVADO' ? '#10b981' : '#ef4444'};
                    padding: 20px; margin: 20px 0; border-radius: 5px; }
          .log { background: #f9fafb; padding: 10px; border-left: 2px solid #d1d5db; margin: 5px 0; font-family: monospace; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: bold; color: #374151; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; color: white;"> Relatório de Viabilidade - Mapeamento de Produto</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>

        <h2> Informações do Produto</h2>
        <table>
          <tr><th>Nome</th><td>${result.name}</td></tr>
          <tr><th>Nicho</th><td>${result.nicho}</td></tr>
          <tr><th>Mercado</th><td>${result.market}</td></tr>
          <tr><th>Plataforma</th><td>${result.platform}</td></tr>
          <tr><th>Tipo</th><td>${result.type}</td></tr>
          <tr><th>Temperatura</th><td>${result.temperature}</td></tr>
          <tr><th>Estratégia de Funil</th><td>${result.funnelStage === 'fundo' ? ' Fundo de Funil' : result.funnelStage === 'meio' ? ' Meio de Funil' : ' Topo de Funil'}</td></tr>
          <tr><th>Data da Análise</th><td>${result.analysisDate}</td></tr>
        </table>

        <h2> Dados Financeiros</h2>
        <table>
          <tr><th>Preço</th><td>R$ ${result.price?.toFixed(2)}</td></tr>
          <tr><th>Comissão (%)</th><td>${result.commissionPct}%</td></tr>
          <tr><th>Comissão Bruta</th><td>R$ ${result.commissionGross?.toFixed(2)}</td></tr>
          <tr><th>Comissão Líquida</th><td>R$ ${result.commissionLiquid?.toFixed(2)}</td></tr>
        </table>

        <h2> Status de Viabilidade</h2>
        <div class="reason">
          <div style="margin-bottom: 15px;">
            <span class="status ${result.viabilityStatus === 'APROVADO' ? 'aprovado' : 'reprovado'}">
              ${result.viabilityStatus}
            </span>
            <span style="margin-left: 20px; font-size: 28px; font-weight: bold;">
              Score: ${result.viabilityScore?.toFixed(1)}/10
            </span>
          </div>
          <p style="line-height: 1.6; white-space: pre-wrap;">${result.viabilityReason}</p>
        </div>

        <h2> Métricas Principais</h2>
        <div class="grid">
          <div class="metric">
            <div class="metric-label">CPC Alvo (Bom)</div>
            <div class="metric-value" style="color: #10b981;">R$ ${result.cpcBom?.toFixed(2)}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">4% da Comissão Bruta</div>
          </div>
          
          <div class="metric">
            <div class="metric-label">Poder de Fogo</div>
            <div class="metric-value" style="color: #3b82f6;">${result.clicksPurchasable} Cliques</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Comissão ÷ CPC Ótimo</div>
          </div>

          <div class="metric">
            <div class="metric-label">Meta de Conversão</div>
            <div class="metric-value" style="color: ${result.requiredCR > (result.funnelStage === 'fundo' ? 5.0 : 2.0) ? '#ef4444' : '#8b5cf6'};">
              ${result.requiredCR?.toFixed(2)}%
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Para Zero a Zero</div>
          </div>
        </div>

        ${result.scenarios && result.scenarios.length > 0 ? `
          <h2> Comparativo de Kits/Ofertas</h2>
          <table>
            <thead>
              <tr>
                <th>Kit/Oferta</th>
                <th>Status</th>
                <th>Cliques Necessários</th>
                <th>Meta CR (Zero a Zero)</th>
              </tr>
            </thead>
            <tbody>
              ${result.scenarios.map(s => `
                <tr>
                  <td><strong>${s.offerName}</strong></td>
                  <td><span class="status ${s.status === 'LUCRO' ? 'aprovado' : 'reprovado'}">${s.status}</span></td>
                  <td>${s.clicksNeeded}</td>
                  <td style="color: ${s.maxCpcBreakEven > (result.funnelStage === 'fundo' ? 5.0 : 2.0) ? '#ef4444' : '#10b981'}; font-weight: bold;">
                    ${s.maxCpcBreakEven.toFixed(2)}%
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <h2> Memória de Cálculo da IA</h2>
        ${result.calculationLog?.map(log => `<div class="log">${log}</div>`).join('') || '<p>Nenhum log disponível</p>'}

        <div class="footer">
          <p><strong>CPC & Funnel Pro v4.0</strong> - Sistema Avançado de Inteligência para Afiliados</p>
          <p>Powered by Pedro Leonardo</p>
          <p style="margin-top: 10px;">Este relatório foi gerado automaticamente. Todos os cálculos seguem metodologias comprovadas de mercado.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  // --- FUNÇÕES DO FORMULÁRIO ---
  const handleAddOffer = () => {
    if (newOffer.name && newOffer.price && newOffer.commissionPct) {
      const offer: Offer = {
        id: Date.now().toString(),
        name: newOffer.name,
        price: newOffer.price,
        commissionPct: newOffer.commissionPct
      };
      setForm(prev => ({ ...prev, offers: [...(prev.offers || []), offer] }));
      setNewOffer({ name: 'Kit X Potes', price: 0, commissionPct: 0 });
    }
  };

  const handleRemoveOffer = (id: string) => {
    setForm(prev => ({ ...prev, offers: prev.offers?.filter(o => o.id !== id) }));
  };

  const handleSelectOffer = (offer: Offer) => {
    setForm(prev => ({
      ...prev,
      selectedOfferId: offer.id,
      price: offer.price,
      commissionPct: offer.commissionPct
    }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const metrics = calculateProductMetrics(form, rates);
    const productData = { ...form, ...metrics, id: form.id || Date.now().toString() } as Product;
    const viability = calculateViability(productData, rates);
    const finalProduct = {
      ...productData,
      viabilityScore: viability.score,
      viabilityStatus: viability.status,
      viabilityReason: viability.reason,
      viabilityDetails: viability.notes,
      calculationLog: viability.log,
      scenarios: viability.scenarios
    };
    setTimeout(() => { setResult(finalProduct); setLoading(false); }, 800);
  };

  const getTempColor = (temp?: Temperature) => {
    if (temp === 'quente') return 'text-red-500';
    if (temp === 'frio') return 'text-blue-500';
    return 'text-orange-500';
  };

  // --- RENDERIZAÇÃO ---

  // ETAPA 2: CHECKLIST INTELIGENTE
  if (!showDeepAnalysis) {
    const hasAllCriteria = mandatoryCriteria.every(c => c.checked);
    const checkedCount = mandatoryCriteria.filter(c => c.checked).length;
    const totalCount = mandatoryCriteria.length;
    const progress = (checkedCount / totalCount) * 100;

    return (
      <>
      <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-200 px-6 pb-8">

        {/* ── Stepper (2 etapas) ── */}
        <div className="flex items-center gap-2 pt-1 mb-7">
          {[
            { n: 1, label: 'Critérios', active: true },
            { n: 2, label: 'Análise', done: false },
          ].map((step, i, arr) => (
            <React.Fragment key={step.n}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${ step.active ? 'bg-white border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-400' }`}>
                  {step.n}
                </div>
                <span className={`text-2xs font-semibold whitespace-nowrap ${ step.active ? 'text-blue-600' : 'text-slate-300' }`}>{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="w-8 h-px bg-slate-200 mb-3.5 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Split layout: checklist (left) + sidebar (right) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── Left column: header + checklist ── */}
          <div className="space-y-4">

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-widest">
                  {checkedCount} de {totalCount} critérios
                </span>
              </div>
              <h2 className="text-[26px] font-black text-slate-900 tracking-tight leading-none">
                Critérios de Aprovação
              </h2>
            </div>

            {/* ── Referências de garimpo (collapsible — mobile only, hidden on xl) ── */}
            {mode === 'discovery' && (
              <div className="xl:hidden bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setShowMethods(p => !p)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Microscope size={13} className="text-slate-400" />
                    <span className="text-[13px] font-semibold text-slate-600">Referências de Garimpo</span>
                  </div>
                  <ArrowRight size={11} className={`text-slate-400 transition-transform duration-200 ${showMethods ? 'rotate-90' : ''}`} />
                </button>
                {showMethods && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100">
                    {discoveryMethods.map((item) => (
                      <div key={item.id} className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold text-slate-700 leading-snug mb-1">{item.label}</p>
                        <p className="text-[12px] text-slate-500 leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Critérios ── */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

              {/* Progress header */}
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Peneira de Qualidade</span>
                  <span className={`text-[13px] font-bold tabular-nums ${hasAllCriteria ? 'text-green-600' : 'text-slate-700'}`}>
                    {checkedCount}/{totalCount}
                  </span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${ hasAllCriteria ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-blue-400' }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Quick actions — Marcar/Limpar Todos */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
                <button
                  onClick={() => {
                    setMandatoryCriteria(prev => prev.map(c => ({ ...c, checked: true })));
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-150"
                >
                  ✓ Marcar Todos
                </button>
                <button
                  onClick={() => {
                    setMandatoryCriteria(prev => prev.map(c => ({ ...c, checked: false })));
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-150"
                >
                  ✕ Limpar Todos
                </button>
              </div>

              {/* Criteria list */}
              <div className="divide-y divide-slate-100">
                {mandatoryCriteria.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleCriteria(item.id)}
                    className={`group flex items-start gap-3.5 px-5 py-4 cursor-pointer transition-all duration-150 ${ item.checked ? 'bg-green-50/40' : 'hover:bg-slate-50/60' }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${ item.checked ? 'bg-green-500 border-green-500' : 'border-slate-300 group-hover:border-blue-400 bg-white' }`}>
                      {item.checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[14px] font-semibold leading-snug ${item.checked ? 'text-green-800' : 'text-slate-800'}`}>
                        {item.label}
                      </p>
                      {item.description && (
                        <p className={`text-[12px] mt-1 leading-relaxed ${item.checked ? 'text-green-600/80' : 'text-slate-500'}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Ação inline no final do card ── */}
              <div className={`px-5 py-4 border-t transition-colors ${hasAllCriteria ? 'border-green-100 bg-green-50/40' : 'border-slate-100 bg-slate-50/40'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    {hasAllCriteria ? (
                      <>
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-[13px] font-semibold text-green-700">Pré-seleção completa!</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-slate-500">{totalCount - checkedCount}</span>
                        </div>
                        <span className="text-[13px] text-slate-500">
                          {totalCount - checkedCount} {totalCount - checkedCount === 1 ? 'critério pendente' : 'critérios pendentes'}
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    variant={hasAllCriteria ? 'primary' : 'secondary'}
                    size="md"
                    disabled={!hasAllCriteria}
                    onClick={handleApprovePreSelection}
                    iconRight={hasAllCriteria ? <ArrowRight size={13} /> : undefined}
                    className="flex-shrink-0"
                  >
                    {hasAllCriteria ? 'Prosseguir para análise' : 'Complete o checklist'}
                  </Button>
                </div>
              </div>
            </div>

          </div>

          {/* ── Right column: sticky sidebar ── */}
          <div className="hidden xl:flex flex-col gap-4 sticky top-4">

            {/* Progresso live */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <CheckSquare size={13} className="text-slate-500" />
                </div>
                <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">Progresso ao vivo</span>
              </div>

              {/* Ring de progresso visual */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="28" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle cx="36" cy="36" r="28" fill="none"
                      stroke={hasAllCriteria ? '#22c55e' : '#3b82f6'}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                      transform="rotate(-90 36 36)"
                      style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
                    />
                    <text x="36" y="41" textAnchor="middle" fontSize="14" fontWeight="900"
                      fill={hasAllCriteria ? '#16a34a' : '#1e40af'}
                      fontFamily="system-ui, sans-serif">
                      {checkedCount}
                    </text>
                  </svg>
                </div>
                <div>
                  <p className={`text-[22px] font-black tabular-nums leading-none ${hasAllCriteria ? 'text-green-600' : 'text-slate-800'}`}>
                    {Math.round(progress)}%
                  </p>
                  <p className="text-[12px] text-slate-500 mt-1">{checkedCount} de {totalCount} critérios</p>
                  <p className={`text-[11px] font-semibold mt-1 ${hasAllCriteria ? 'text-green-600' : 'text-blue-600'}`}>
                    {hasAllCriteria ? 'Pronto para prosseguir!' : `Faltam ${totalCount - checkedCount}`}
                  </p>
                </div>
              </div>

              {/* Mini critérios checados */}
              <div className="space-y-1.5">
                {mandatoryCriteria.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-all duration-150 ${ item.checked ? 'bg-green-500 border-green-500' : 'border-slate-200' }`}>
                      {item.checked && (
                        <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                          <path d="M1 2.5L2.5 4L6 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className={`text-[11px] leading-snug truncate ${item.checked ? 'text-green-700 font-medium' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Referências de Garimpo (visível só em discovery) */}
            {mode === 'discovery' && (
              <div className="bg-white rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 rounded-t-2xl">
                  <Microscope size={13} className="text-slate-400" />
                  <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">Referências de Garimpo</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {discoveryMethods.map((item, i) => (
                    <div
                      key={item.id}
                      className="relative px-4 py-3 cursor-default group"
                      onMouseEnter={() => setActiveTooltip(item.id)}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`text-2xs font-bold mt-0.5 flex-shrink-0 tabular-nums transition-colors duration-150 ${activeTooltip === item.id ? 'text-blue-400' : 'text-slate-300'}`}>
                          {String(i+1).padStart(2,'0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] font-semibold leading-snug transition-colors duration-150 ${activeTooltip === item.id ? 'text-blue-600' : 'text-slate-700'}`}>
                            {item.label}
                          </p>
                        </div>
                        <Info size={11} className={`flex-shrink-0 mt-0.5 transition-all duration-150 ${activeTooltip === item.id ? 'text-blue-400 opacity-100' : 'text-slate-200 opacity-0 group-hover:opacity-100'}`} />
                      </div>

                      {/* Tooltip */}
                      {activeTooltip === item.id && item.description && (
                        <div
                          className="absolute left-0 right-0 z-50 mx-1"
                          style={i >= 3
                            ? { bottom: 'calc(100% + 4px)' }
                            : { top: 'calc(100% + 4px)' }
                          }
                        >
                          <div
                            className="bg-slate-900 text-white rounded-xl px-3.5 py-3 shadow-xl border border-slate-700/60"
                            style={{ animation: 'tooltipIn 0.15s ease-out' }}
                          >
                            {/* Arrow */}
                            {i >= 3
                              ? <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-slate-900 border-r border-b border-slate-700/60 rotate-45" />
                              : <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-900 border-l border-t border-slate-700/60 rotate-45" />
                            }
                            <p className="text-[11px] leading-relaxed text-slate-200 relative z-10">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      </>
    );
  }

  // ETAPA 3: ANÁLISE PROFUNDA (FORMULÁRIO COMPLETO)

  // ── shared input/label classes ──
  const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[14px] text-slate-900 bg-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all duration-150";
  const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5";
  const secHdr = (icon: React.ReactNode, title: string) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 flex items-center justify-center text-slate-400">{icon}</div>
      <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">{title}</span>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-200 px-6 pb-12 space-y-4">

      {/* ── Stepper nav ── */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={() => setShowDeepAnalysis(false)}
          className="flex-shrink-0 flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-700 transition-colors font-medium"
        >
          <ArrowRight size={12} className="rotate-180" /> Voltar
        </button>
        <div className="flex items-center flex-1 max-w-xs">
          {[
            { n: 1, label: 'Critérios', done: true },
            { n: 2, label: 'Análise', active: true },
          ].map((step, i, arr) => (
            <React.Fragment key={step.n}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${ step.done ? 'bg-blue-600 border-blue-600 text-white' : step.active ? 'bg-white border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-400' }`}>
                  {step.done
                    ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : step.n}
                </div>
                <span className={`text-2xs font-semibold whitespace-nowrap ${step.active ? 'text-blue-600' : step.done ? 'text-slate-500' : 'text-slate-300'}`}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && <div className={`flex-1 h-px mx-2 mb-3.5 ${step.done ? 'bg-blue-300' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Aprovação banner ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-bold text-emerald-800 leading-tight">Pré-seleção aprovada</p>
          <p className="text-[12px] text-emerald-600">Preencha os dados abaixo para calcular a viabilidade.</p>
        </div>
      </div>

      {/* ══ FORMULÁRIO ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* ── Column 1: Identificação + Funil + Financeiro + Kits ── */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">

        {/* Identificação */}
        <div className="px-5 pt-5 pb-5">
          {secHdr(<FileText size={14} />, 'Identificação')}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Nome do Produto <span className="text-red-400 normal-case font-normal">*</span></label>
              <input className={inputCls} placeholder="Ex: Ozenvita" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className={labelCls}>Data da Análise</label>
              <input type="date" className={inputCls} value={form.analysisDate} onChange={e => setForm({...form, analysisDate: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Funil */}
        <div className="px-5 pt-5 pb-5">
          {secHdr(<TrendingUp size={14} />, 'Estratégia de Funil')}
          <label className={labelCls}>Etapa do Funil <span className="text-red-400 normal-case font-normal">*</span></label>
          <select className={inputCls} value={form.funnelStage} onChange={e => setForm({...form, funnelStage: e.target.value as FunnelStage})}>
            <option value="fundo">Fundo de Funil — Público Quente (busca nome do produto)</option>
            <option value="meio">Meio de Funil — Consciência da Solução</option>
            <option value="topo">Topo de Funil — Público Frio (consciência do problema)</option>
          </select>
          <p className="text-[12px] text-slate-400 mt-2 leading-relaxed">Fundo de Funil permite metas de conversão mais agressivas (até 8%) no cálculo.</p>
        </div>

        {/* Financeiro */}
        <div className="px-5 pt-5 pb-5">
          {secHdr(<Calculator size={14} />, 'Dados Financeiros')}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Preço <span className="text-red-400 normal-case font-normal">*</span></label>
              <input type="number" className={inputCls} placeholder="197" value={form.price || ''} onChange={e => setForm({...form, price: parseFloat(e.target.value), selectedOfferId: undefined})} />
            </div>
            <div>
              <label className={labelCls}>Comissão % <span className="text-red-400 normal-case font-normal">*</span></label>
              <input type="number" className={inputCls} placeholder="50" value={form.commissionPct || ''} onChange={e => setForm({...form, commissionPct: parseFloat(e.target.value), selectedOfferId: undefined})} />
            </div>
            <div>
              <label className={labelCls}>Mercado</label>
              <select className={inputCls} value={form.market} onChange={e => setForm({...form, market: e.target.value as any})}>
                <option value="BR">Brasil (BRL)</option>
                <option value="US">EUA (USD)</option>
                <option value="UK">Reino Unido (GBP)</option>
                <option value="EU">Europa (EUR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kits */}
        <div className="px-5 pt-5 pb-5">
          {secHdr(<Plus size={14} />, 'Kits / Ofertas')}
          <p className="text-[12px] text-slate-400 mb-3 -mt-2">Cadastre os kits e selecione o principal para o cálculo.</p>

          {form.offers && form.offers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {form.offers.map((offer) => (
                <div
                  key={offer.id}
                  onClick={() => handleSelectOffer(offer)}
                  className={`relative cursor-pointer px-3 py-2 rounded-xl border-2 transition-all min-w-[100px] ${ form.selectedOfferId === offer.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300' }`}
                >
                  {form.selectedOfferId === offer.id && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  <p className="text-[12px] font-bold text-slate-900">{offer.name}</p>
                  <p className="text-[11px] text-slate-500">R$ {offer.price}</p>
                  <p className="text-2xs font-semibold text-emerald-600">{offer.commissionPct}% comis.</p>
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveOffer(offer.id); }} className="absolute top-2 right-2 text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex-1">
              <label className="text-2xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Nome do Kit</label>
              <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" placeholder="Ex: Kit 3 Potes" value={newOffer.name} onChange={e => setNewOffer({...newOffer, name: e.target.value})} />
            </div>
            <div className="w-24">
              <label className="text-2xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Preço</label>
              <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" placeholder="297" value={newOffer.price || ''} onChange={e => setNewOffer({...newOffer, price: parseFloat(e.target.value)})} />
            </div>
            <div className="w-20">
              <label className="text-2xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Comis %</label>
              <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" placeholder="50" value={newOffer.commissionPct || ''} onChange={e => setNewOffer({...newOffer, commissionPct: parseFloat(e.target.value)})} />
            </div>
            <button onClick={handleAddOffer} className="h-[38px] w-10 bg-slate-900 hover:bg-black text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0">
              <Plus size={15} />
            </button>
          </div>
        </div>

      </div>{/* end col-1 card */}

      {/* ── Column 2: Contexto de Mercado + Produto ── */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">

        {/* Contexto de Mercado */}
        <div className="px-5 pt-5 pb-5">
          {secHdr(<Crosshair size={14} />, 'Contexto de Mercado')}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Nicho</label>
              <select className={inputCls} value={form.nicho} onChange={e => setForm({...form, nicho: e.target.value})}>
                <option value="emagrecimento">Emagrecimento</option>
                <option value="fitness">Fitness</option>
                <option value="saude">Saúde</option>
                <option value="financas">Finanças</option>
                <option value="marketing">Marketing</option>
                <option value="relacionamento">Relacionamento</option>
                <option value="espiritualidade">Espiritualidade</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Plataforma</label>
              <select className={inputCls} value={form.platform} onChange={e => setForm({...form, platform: e.target.value as any})}>
                <option value="Hotmart">Hotmart</option>
                <option value="Monetizze">Monetizze</option>
                <option value="Eduzz">Eduzz</option>
                <option value="Braip">Braip</option>
                <option value="Clickbank">Clickbank</option>
                <option value="Kiwify">Kiwify</option>
                <option value="Outra">Outra</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Temperatura</label>
              <select className={inputCls} value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value as any})}>
                <option value="quente">Quente</option>
                <option value="morno">Morno</option>
                <option value="frio">Frio</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Vol. de Busca <span className="normal-case text-slate-400 font-normal text-2xs">(Keyword Planner)</span></label>
              <input type="number" className={inputCls} placeholder="5000" value={form.searchVolume || ''} onChange={e => setForm({...form, searchVolume: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className={labelCls}>Anunciantes <span className="normal-case text-slate-400 font-normal text-2xs">(no topo)</span></label>
              <input type="number" className={inputCls} placeholder="5" value={form.advertiserCount || ''} onChange={e => setForm({...form, advertiserCount: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className={labelCls}>CPC de Mercado <span className="normal-case text-slate-400 font-normal text-2xs">(opcional)</span></label>
              <input type="number" className={inputCls} placeholder="2.50" value={form.manualBenchmarkCPC || ''} onChange={e => setForm({...form, manualBenchmarkCPC: parseFloat(e.target.value)})} />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">CPC manual substitui a estimativa do nicho no cálculo.</p>
        </div>

        {/* Produto */}
        <div className="px-5 pt-5 pb-5">
          {secHdr(<Target size={14} />, 'Características do Produto')}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={labelCls}>Tipo de Produto</label>
              <select className={inputCls} value={form.type} onChange={e => setForm({...form, type: e.target.value as any})}>
                <option value="fisico">Produto Físico</option>
                <option value="digital">Digital (Ebook)</option>
                <option value="curso">Curso Online</option>
                <option value="software">SaaS / Software</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Qualidade da LP</label>
              <select className={inputCls} value={form.qualityLP} onChange={e => setForm({...form, qualityLP: e.target.value as any})}>
                <option value="excelente">Excelente</option>
                <option value="boa">Boa</option>
                <option value="media">Média</option>
                <option value="fraca">Fraca</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setForm({...form, hasUpsells: !form.hasUpsells})}
            className="flex items-center gap-3 cursor-pointer group w-full text-left"
          >
            <div className={`relative flex-shrink-0 rounded-full transition-colors duration-200 ${form.hasUpsells ? 'bg-blue-600' : 'bg-slate-200'}`} style={{ width: 40, height: 22 }}>
              <span className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-200 ${form.hasUpsells ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-slate-800 leading-tight">Tem Upsells / Order Bumps?</p>
              <p className="text-[12px] text-slate-400 mt-0.5">Aumenta o ticket médio e viabilidade no cálculo</p>
            </div>
          </button>
        </div>
      </div>{/* end col-2 card */}

      </div>{/* end 2-col grid */}

      {/* ── CTA Analisar ── */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !form.name || !form.price}
        className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[14px] font-bold py-3.5 rounded-2xl transition-all duration-200 hover:shadow-[0_4px_20px_rgba(37,99,235,0.35)] disabled:cursor-not-allowed active:scale-[0.99]"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            Calculando viabilidade...
          </>
        ) : (
          <>
            <Calculator size={16} />
            Analisar Viabilidade do Produto
          </>
        )}
      </button>

      {/* ══ RESULTADOS ══════════════════════════════════════ */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">

          {/* ── Verdict + Score Ring ── */}
          <div className={`rounded-2xl border overflow-hidden ${ result.viabilityStatus === 'APROVADO' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50' }`}>
            <div className="px-6 py-6 flex items-center gap-6">
              {/* Score Ring SVG — maior e mais impactante */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="38"
                    fill="none"
                    stroke={result.viabilityStatus === 'APROVADO' ? '#bbf7d0' : '#fecaca'}
                    strokeWidth="7"
                  />
                  <circle cx="48" cy="48" r="38"
                    fill="none"
                    stroke={result.viabilityStatus === 'APROVADO' ? '#16a34a' : '#dc2626'}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - (result.viabilityScore ?? 0) / 10)}`}
                    transform="rotate(-90 48 48)"
                    style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  />
                  <text x="48" y="54" textAnchor="middle" fontSize="20" fontWeight="900"
                    fill={result.viabilityStatus === 'APROVADO' ? '#15803d' : '#b91c1c'}
                    fontFamily="system-ui, sans-serif"
                  >
                    {result.viabilityScore?.toFixed(1)}
                  </text>
                </svg>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">score</span>
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2.5">
                  <span className={`text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${ result.viabilityStatus === 'APROVADO' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800' }`}>{result.viabilityStatus}</span>
                  {result.temperature && (
                    <span className="text-2xs font-semibold text-slate-500 bg-white/90 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {result.temperature.toUpperCase()}
                    </span>
                  )}
                  {result.funnelStage === 'fundo' && (
                    <span className="text-2xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                      FUNDO DE FUNIL
                    </span>
                  )}
                </div>
                <h2 className="text-[22px] font-black text-slate-900 leading-tight mb-2">{result.name}</h2>
                {result.viabilityReason && (
                  <p className={`text-[13px] leading-relaxed ${ result.viabilityStatus === 'APROVADO' ? 'text-green-800' : 'text-red-700' }`}>{result.viabilityReason}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── 4 metric cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* CPC Alvo */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-[3px] bg-green-400" />
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Target size={12} className="text-green-500" />
                  <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">CPC Alvo</span>
                </div>
                <div className="text-[25px] font-black text-slate-900 tabular-nums leading-tight">
                  R$ {result.cpcBom?.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">4% da comissão — meta segura</p>
              </div>
            </div>

            {/* Poder de Fogo */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-[3px] bg-blue-400" />
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Crosshair size={12} className="text-blue-500" />
                  <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">Poder de Fogo</span>
                </div>
                <div className="text-[25px] font-black text-slate-900 tabular-nums leading-tight">
                  {result.clicksPurchasable}
                  <span className="text-[12px] font-semibold text-slate-400 ml-1">cliques</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">Cliques antes do prejuízo</p>
              </div>
            </div>

            {/* Meta de Conversão */}
            <div className={`rounded-2xl border overflow-hidden ${ result.requiredCR > (result.funnelStage === 'fundo' ? 5.0 : 2.0) ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200' }`}>
              <div className={`h-[3px] ${ result.requiredCR > (result.funnelStage === 'fundo' ? 5.0 : 2.0) ? 'bg-red-400' : 'bg-violet-400' }`} />
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={12} className={
                    result.requiredCR > (result.funnelStage === 'fundo' ? 5.0 : 2.0) ? 'text-red-500' : 'text-violet-500'
                  } />
                  <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">Meta CR</span>
                </div>
                <div className={`text-[25px] font-black tabular-nums leading-tight ${ result.requiredCR > (result.funnelStage === 'fundo' ? 5.0 : 2.0) ? 'text-red-600' : 'text-violet-600' }`}>
                  {result.requiredCR?.toFixed(2)}%
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">CR para break-even</p>
              </div>
            </div>

            {/* Comissão Líquida */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-[3px] bg-slate-300" />
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={12} className="text-slate-400" />
                  <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">Comissão Líq.</span>
                </div>
                <div className="text-[25px] font-black text-slate-800 tabular-nums leading-tight">
                  R$ {result.commissionLiquid?.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">Por venda após taxa</p>
              </div>
            </div>
          </div>

          {/* ── Comparativo de Kits + Memória lado a lado em desktop ── */}
          <div className={`grid grid-cols-1 gap-4 ${ (result.scenarios && result.scenarios.length > 0) && (result.calculationLog && result.calculationLog.length > 0) ? 'xl:grid-cols-2' : '' }`}>

            {/* Comparativo de Kits */}
            {result.scenarios && result.scenarios.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-widest text-slate-400">Comparativo de Kits</span>
                  <span className="text-[11px] text-slate-400">{result.scenarios.length} opções</span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
                  {result.scenarios.map((scenario, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-3.5 ${ scenario.status === 'LUCRO' ? 'border-green-200 bg-green-50' : scenario.status === 'RISCO' ? 'border-yellow-200 bg-yellow-50' : 'border-red-100 bg-red-50/50' }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <p className="text-[13px] font-bold text-slate-800 leading-tight">{scenario.offerName}</p>
                        <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${ scenario.status === 'LUCRO' ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-700' }`}>
                          {scenario.status === 'LUCRO' ? 'OK' : 'RISCO'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-2xs text-slate-400 uppercase font-bold">Comissão</p>
                          <p className="text-[13px] font-bold text-slate-800 tabular-nums">R$ {scenario.commission.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-2xs text-slate-400 uppercase font-bold">Cliques</p>
                          <p className="text-[13px] font-bold text-slate-800 tabular-nums">{scenario.clicksNeeded}</p>
                        </div>
                        <div>
                          <p className="text-2xs text-slate-400 uppercase font-bold">Meta CR</p>
                          <p className={`text-[13px] font-bold tabular-nums ${ scenario.maxCpcBreakEven > (result.funnelStage === 'fundo' ? 5.0 : 2.0) ? 'text-red-600' : 'text-green-600' }`}>{scenario.maxCpcBreakEven.toFixed(2)}%</p>
                        </div>
                      </div>
                      {scenario.status === 'LUCRO' && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-green-700">
                          <TrendingUp size={11} /> Kit recomendado
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Memória de cálculo */}
            {result.calculationLog && result.calculationLog.length > 0 && (
              <details className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
                <summary className="px-5 py-4 flex items-center justify-between cursor-pointer list-none hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Calculator size={13} className="text-slate-400" />
                    <span className="text-[13px] font-semibold text-slate-700">Memória de Cálculo</span>
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-open:rotate-90 transition-transform duration-200" />
                </summary>
                <div className="border-t border-slate-100 px-5 py-4 max-h-72 overflow-y-auto space-y-1.5">
                  {result.calculationLog.map((log, i) => (
                    <div key={i} className="text-[12px] text-slate-600 font-mono leading-relaxed border-l-2 border-slate-200 pl-3">
                      {log}
                    </div>
                  ))}
                </div>
              </details>
            )}

          </div>

          {/* ── Ações finais ── */}
          <div className="flex items-center justify-between gap-3 pt-2 pb-2 bg-white rounded-2xl border border-slate-100 px-5 py-4">
            <button
              className="text-[12px] font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
              onClick={handleResetMapping}
            >
              <Trash2 size={13} /> Descartar
            </button>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all duration-150"
              >
                <Download size={13} /> Exportar PDF
              </button>
              <button
                onClick={() => onSave(result)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-150 active:scale-[0.98] ${ result.viabilityStatus === 'APROVADO' ? 'bg-green-600 hover:bg-green-700 text-white shadow-[0_2px_12px_rgba(22,163,74,0.3)] hover:shadow-[0_4px_20px_rgba(22,163,74,0.4)]' : 'bg-slate-800 hover:bg-slate-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]' }`}
              >
                <Save size={13} />
                {result.viabilityStatus === 'APROVADO' ? 'Salvar e ir para Setup' : 'Salvar mesmo assim'}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
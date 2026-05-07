import React, { useState } from 'react';
import {
  BookOpen, Target, TrendingUp, BarChart3, Zap, Home,
  CheckCircle, AlertTriangle, ChevronDown, ChevronUp,
  DollarSign, MousePointer2, ShoppingCart, Save, Globe,
  GitCompare, Activity, BadgePercent, Info, Gauge,
  Lightbulb, ArrowRight, Database, RefreshCw,
} from 'lucide-react';

// ── Section wrapper ────────────────────────────────────────────────────────────
const Section: React.FC<{
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  expanded: string | null;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}> = ({ id, title, subtitle, icon, accentColor, expanded, onToggle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <button
      onClick={() => onToggle(id)}
      className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${accentColor} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <div className="text-[13px] font-bold text-slate-800 leading-none">{title}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{subtitle}</div>
        </div>
      </div>
      {expanded === id
        ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
        : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
    </button>
    {expanded === id && (
      <div className="border-t border-slate-100 px-5 py-5 space-y-4 bg-slate-50/40">
        {children}
      </div>
    )}
  </div>
);

// ── Tip block ─────────────────────────────────────────────────────────────────
const Tip: React.FC<{ type?: 'info' | 'warning' | 'success'; children: React.ReactNode }> = ({
  type = 'info', children,
}) => {
  const cfg = {
    info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />,         text: 'text-blue-800' },
    warning: { bg: 'bg-amber-50',  border: 'border-amber-200',  icon: <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />, text: 'text-amber-800' },
    success: { bg: 'bg-emerald-50',border: 'border-emerald-200',icon: <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />, text: 'text-emerald-800' },
  }[type];
  return (
    <div className={`flex items-start gap-2 px-3 py-3 rounded-xl border text-[11px] font-medium leading-relaxed ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      {cfg.icon}
      <span>{children}</span>
    </div>
  );
};

// ── Step list ─────────────────────────────────────────────────────────────────
const Steps: React.FC<{ items: string[] }> = ({ items }) => (
  <ol className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex gap-3 items-start">
        <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-2xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {i + 1}
        </span>
        <span className="text-[12px] text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: item }} />
      </li>
    ))}
  </ol>
);

// ── KPI definition ─────────────────────────────────────────────────────────────
const KpiDef: React.FC<{ term: string; def: string; formula?: string }> = ({ term, def, formula }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-3">
    <div className="text-[11px] font-bold text-slate-800 mb-0.5">{term}</div>
    <div className="text-[11px] text-slate-500 leading-relaxed">{def}</div>
    {formula && (
      <div className="mt-1.5 bg-slate-100 rounded-lg px-2 py-1 text-2xs font-mono text-slate-600">{formula}</div>
    )}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
export const Manual: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>('analise');

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <div className="space-y-5 pb-10">

      {/* ── Dark Navy Header ───────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-700/40 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #0E2233 50%, #0A1628 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(34,211,238,0.06) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative px-5 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)' }}>
            <BookOpen size={22} style={{ color: 'rgba(34,211,238,0.90)' }} />
          </div>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(34,211,238,0.65)' }}>
              Documentacao do Sistema
            </p>
            <h1 className="text-lg font-bold text-white leading-tight">Manual do CPC Funnel Pro</h1>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Guia completo de todas as funcionalidades — versao atualizada
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick nav cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Inicio',       id: 'inicio',       icon: <Home size={14} />,        color: 'bg-cyan-600' },
          { label: 'Dashboard',    id: 'dashboard',    icon: <BarChart3 size={14} />,    color: 'bg-blue-600' },
          { label: 'Analise',      id: 'analise',      icon: <Activity size={14} />,     color: 'bg-emerald-600' },
          { label: 'Mapeamento',   id: 'mapeamento',   icon: <Target size={14} />,       color: 'bg-violet-600' },
          { label: 'Portfolio',    id: 'portfolio',    icon: <TrendingUp size={14} />,   color: 'bg-orange-600' },
          { label: 'Simulacao',    id: 'simulacao',    icon: <Zap size={14} />,          color: 'bg-pink-600' },
          { label: 'Comparador',   id: 'comparador',   icon: <GitCompare size={14} />,   color: 'bg-indigo-600' },
          { label: 'Multi-moeda',  id: 'moeda',        icon: <Globe size={14} />,        color: 'bg-teal-600' },
        ].map((n) => (
          <button
            key={n.id}
            onClick={() => { setExpanded(n.id); setTimeout(() => document.getElementById(`section-${n.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover: transition-all text-left"
          >
            <div className={`w-6 h-6 rounded-lg ${n.color} flex items-center justify-center flex-shrink-0 text-white`}>
              {n.icon}
            </div>
            <span className="text-[11px] font-bold text-slate-700">{n.label}</span>
          </button>
        ))}
      </div>

      {/* ── Seção: Inicio ─────────────────────────────────────────────────── */}
      <div id="section-inicio">
        <Section id="inicio" title="1. Inicio — Painel do Dia" subtitle="Visao geral da sua operacao hoje"
          icon={<Home size={16} className="text-white" />} accentColor="bg-cyan-600"
          expanded={expanded} onToggle={toggle}>
          <p className="text-[12px] text-slate-600 leading-relaxed">
            A tela inicial mostra um resumo do estado atual da sua operacao: produto ativo, resultados recentes, lucro da semana e acoes rapidas para navegar pelo sistema.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5"><Activity size={11} /> Produto Ativo</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">Exibe o produto selecionado atualmente, suas metas de CPC e CR, e permite trocar rapidamente para outro produto.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5"><TrendingUp size={11} /> Resumo da Semana</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">Lucro, gasto e conversoes dos ultimos 7 dias baseados nas campanhas salvas. Atualiza automaticamente ao salvar novas campanhas.</p>
            </div>
          </div>
          <Tip type="info">Clique em "Ir para Analise" no card do produto ativo para comecar uma analise de campanha com o produto ja selecionado.</Tip>
        </Section>
      </div>

      {/* ── Seção: Dashboard ──────────────────────────────────────────────── */}
      <div id="section-dashboard">
        <Section id="dashboard" title="2. Dashboard" subtitle="Metricas acumuladas e graficos do portfolio"
          icon={<BarChart3 size={16} className="text-white" />} accentColor="bg-blue-600"
          expanded={expanded} onToggle={toggle}>
          <p className="text-[12px] text-slate-600 leading-relaxed">
            O Dashboard agrega todos os dados de campanhas salvas e exibe graficos de receita, lucro, ROAS e distribuicao por produto. Permite filtrar por periodo.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Filtro de Periodo', desc: 'Filtre por 7d, 30d, 90d, ou data customizada para ver metricas especificas.' },
              { label: 'Graficos Colapsaveis', desc: 'Clique no cabecalho de cada grafico para expandir ou colapsar. Util para focar em uma metrica.' },
              { label: 'KPIs no Topo', desc: 'Receita total, lucro total, ROAS medio e ROI medio do periodo selecionado.' },
              { label: 'Por Produto', desc: 'Graficos mostram desempenho individual de cada produto cadastrado.' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1">{item.label}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <Tip type="info">Os dados do Dashboard vem das campanhas salvas na aba Analise. Quanto mais campanhas salvas, mais precisos os graficos.</Tip>
        </Section>
      </div>

      {/* ── Seção: Analise ────────────────────────────────────────────────── */}
      <div id="section-analise">
        <Section id="analise" title="3. Analise & Otimizacao" subtitle="Diagnostico em tempo real de campanhas ativas"
          icon={<Activity size={16} className="text-white" />} accentColor="bg-emerald-600"
          expanded={expanded} onToggle={toggle}>

          <p className="text-[12px] text-slate-600 leading-relaxed">
            A sessao de Analise e o nucleo do sistema. Voce insere os dados da campanha atual e recebe em tempo real: veredicto, health score, plano de acao, termometro de CPC e funil de conversao.
          </p>

          {/* Inputs */}
          <div>
            <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5"><MousePointer2 size={11} /> Dados da Campanha (Inputs)</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Impressoes',  desc: 'Total de exibicoes do anuncio no periodo' },
                { label: 'Cliques',     desc: 'Total de cliques recebidos no periodo' },
                { label: 'Gasto (R$)',  desc: 'Valor total investido em anuncios (sempre em R$, mesmo para produtos internacionais)' },
                { label: 'Conversoes',  desc: 'Numero de vendas/conversoes no periodo' },
              ].map((f) => (
                <div key={f.label} className="bg-white rounded-xl border border-slate-200 p-2.5">
                  <div className="text-2xs font-bold text-slate-600">{f.label}</div>
                  <div className="text-2xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Score + Verdict */}
          <div>
            <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Zap size={11} /> Veredito + Health Score (0-100)</div>
            <div className="space-y-2">
              {[
                { range: '80-100', label: 'Excelente', desc: 'Campanha top performer. ROI alto, ROAS forte, CR acima da meta. Hora de escalar.', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                { range: '60-79',  label: 'Bom',       desc: 'Campanha saudavel. Mantenha e otimize pontualmente.', color: 'border-blue-300 bg-blue-50 text-blue-800' },
                { range: '40-59',  label: 'Regular',   desc: 'Alguns indicadores fora do ideal. Siga o Plano de Acao.', color: 'border-amber-300 bg-amber-50 text-amber-800' },
                { range: '20-39',  label: 'Critico',   desc: 'Multiplas metricas comprometidas. Reducao urgente de lances.', color: 'border-orange-300 bg-orange-50 text-orange-800' },
                { range: '0-19',   label: 'Emergencia',desc: 'Campanha com prejuizo. Pause e reveja a estrategia.', color: 'border-red-300 bg-red-50 text-red-800' },
              ].map((s) => (
                <div key={s.range} className={`flex items-start gap-2.5 px-3 py-2 rounded-xl border text-[11px] ${s.color}`}>
                  <span className="font-black w-12 flex-shrink-0">{s.range}</span>
                  <span className="font-black w-20 flex-shrink-0">{s.label}</span>
                  <span className="font-medium opacity-80 leading-relaxed">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Veredicto de campanha */}
          <div>
            <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Target size={11} /> Veredito de Campanha</div>
            <div className="space-y-2">
              {[
                { label: 'ESCALAR AGORA',    desc: 'CPA abaixo de 40% da comissao. ROI excelente. Aumente budget em 30-50%.', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                { label: 'MANTER E OTIMIZAR',desc: 'CPA entre 40-70% da comissao. Campanha lucrativa. Otimize negativos e headlines.', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                { label: 'BREAK-EVEN',       desc: 'CPA entre 70-100% da comissao. Quase sem lucro. Reduza CPC ou teste novo copy.', color: 'text-amber-700 bg-amber-50 border-amber-200' },
                { label: 'PREJUIZO',         desc: 'CPA acima de 100% da comissao. Pause ou reduza drasticamente os lances.', color: 'text-red-700 bg-red-50 border-red-200' },
              ].map((v) => (
                <div key={v.label} className={`px-3 py-2 rounded-xl border text-[11px] font-medium leading-relaxed ${v.color}`}>
                  <span className="font-black">{v.label}</span> — {v.desc}
                </div>
              ))}
            </div>
          </div>

          {/* Termometro CPC */}
          <div>
            <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Gauge size={11} /> Termometro de CPC</div>
            <p className="text-[12px] text-slate-600 leading-relaxed mb-2">
              Visualiza onde o CPC atual se posiciona nas 4 zonas do produto. As zonas sao calculadas automaticamente sobre a comissao liquida em BRL.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Bom',         formula: 'CPC <= 4% da comissao',  color: 'text-emerald-700 bg-emerald-50' },
                { label: 'Medio',       formula: 'CPC 4%-6% da comissao', color: 'text-blue-700 bg-blue-50' },
                { label: 'Apertado',    formula: 'CPC 6%-8% da comissao', color: 'text-amber-700 bg-amber-50' },
                { label: 'Critico',     formula: 'CPC > 8% da comissao',  color: 'text-red-700 bg-red-50' },
              ].map((z) => (
                <div key={z.label} className={`rounded-xl px-3 py-2 text-[11px] ${z.color}`}>
                  <div className="font-black">{z.label}</div>
                  <div className="font-mono text-2xs opacity-70 mt-0.5">{z.formula}</div>
                </div>
              ))}
            </div>
            <Tip type="success">
              O termometro e inteligente: se o CPC esta na zona critica MAS o ROAS e alto e o ROI e positivo, o sistema nao manda pausar — mostra "CPC alto mas campanha lucrativa — otimize sem pausar".
            </Tip>
          </div>

          {/* Plano de acao */}
          <div>
            <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Lightbulb size={11} /> Plano de Acao</div>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Sugestoes automaticas baseadas nas metricas reais da campanha. Cada sugestao tem uma prioridade (ALTA / MEDIA / BAIXA) e area (CPC, CTR, Conversao, Escala).
            </p>
            <Tip type="info">O Plano de Acao fica dentro do card Veredito, na parte inferior. Clique em "Plano de Acao" para expandir.</Tip>
          </div>

          {/* Botao Salvar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Save size={13} className="text-slate-700" />
              <div className="text-[11px] font-bold text-slate-700">Botao "Salvar" — onde os dados vao?</div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Ao clicar em Salvar, a campanha e gravada no <strong>historico interno</strong> do app (localStorage). Esses dados alimentam:
            </p>
            <div className="space-y-1.5">
              {[
                { dest: 'Dashboard', desc: 'Graficos de receita, lucro, ROAS e distribuicao por produto' },
                { dest: 'Comparador', desc: 'Historico de campanhas de cada produto para comparacao head-to-head' },
                { dest: 'Portfolio', desc: 'Metricas acumuladas dos produtos ativos' },
              ].map((d) => (
                <div key={d.dest} className="flex items-start gap-2 text-[11px]">
                  <ArrowRight size={10} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-700">{d.dest}:</strong> <span className="text-slate-500">{d.desc}</span></span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-slate-100 text-2xs text-slate-500">
              <Database size={10} className="mt-0.5 flex-shrink-0" />
              Dados ficam salvos no navegador. Nao requerem login. Use a funcao "Exportar" no menu para backup.
            </div>
          </div>
        </Section>
      </div>

      {/* ── Seção: Mapeamento ─────────────────────────────────────────────── */}
      <div id="section-mapeamento">
        <Section id="mapeamento" title="4. Mapeamento / Setup de Produto" subtitle="Cadastre e analise a viabilidade antes de investir"
          icon={<Target size={16} className="text-white" />} accentColor="bg-violet-600"
          expanded={expanded} onToggle={toggle}>

          <p className="text-[12px] text-slate-600 leading-relaxed">
            O Setup permite cadastrar novos produtos e receber uma analise automatica de viabilidade antes de investir um centavo. O sistema calcula CPC Bom, Meta CR e Score de Viabilidade.
          </p>

          <Steps items={[
            '<strong>Ficha Tecnica:</strong> Nome, nicho, preco, comissao %, plataforma, mercado e moeda.',
            '<strong>Financeiro:</strong> Configure as taxas da plataforma (Hotmart, Kiwify, etc.) e veja a comissao liquida calculada automaticamente.',
            '<strong>Simulador de Metas:</strong> Define o CPC de benchmark do mercado para calcular as zonas de CPC (Bom / Medio / Apertado / Critico).',
            '<strong>Estrategia:</strong> Defina funil, temperatura do trafego e qualidade da LP para ajustar a analise.',
            'Clique em <strong>"Salvar Produto"</strong> para adicionar ao portfolio.',
          ]} />

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'APROVADO', range: '7-10', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              { label: 'RISCO',    range: '4-6.9', color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { label: 'REPROVADO',range: '0-3.9', color: 'bg-red-50 border-red-200 text-red-700' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border px-3 py-2.5 text-center ${s.color}`}>
                <div className="text-[11px] font-bold">{s.label}</div>
                <div className="text-2xs font-mono mt-0.5 opacity-70">Score {s.range}</div>
              </div>
            ))}
          </div>

          <Tip type="warning">O campo "CPC Medio de Mercado" e obrigatorio para o calculo das zonas de CPC. Use o Google Keyword Planner para descobrir o CPC medio do nicho.</Tip>
        </Section>
      </div>

      {/* ── Seção: Portfolio ──────────────────────────────────────────────── */}
      <div id="section-portfolio">
        <Section id="portfolio" title="5. Portfolio" subtitle="Visao geral de todos os produtos e otimizacao de budget"
          icon={<TrendingUp size={16} className="text-white" />} accentColor="bg-orange-600"
          expanded={expanded} onToggle={toggle}>

          <p className="text-[12px] text-slate-600 leading-relaxed">
            O Portfolio exibe todos os produtos cadastrados com suas metricas de viabilidade e permite otimizar a alocacao do budget entre eles usando dois algoritmos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-blue-200 p-3">
              <div className="text-[11px] font-bold text-blue-700 mb-1">Distribuicao Equilibrada</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">Divide o budget igualmente entre produtos viáveis. Ideal para quem esta comecando ou quer diversificar o risco.</p>
            </div>
            <div className="bg-white rounded-xl border border-violet-200 p-3">
              <div className="text-[11px] font-bold text-violet-700 mb-1">Simplex Otimizado</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">Algoritmo matematico que maximiza lucro focando nos produtos com melhor historico. Requer 3-5 campanhas salvas por produto.</p>
            </div>
          </div>

          <Tip type="info">Use "Distribuicao Equilibrada" ate ter dados suficientes (5+ campanhas por produto), depois migre para o Simplex para maximizar retorno.</Tip>
        </Section>
      </div>

      {/* ── Seção: Simulacao ──────────────────────────────────────────────── */}
      <div id="section-simulacao">
        <Section id="simulacao" title="6. Simulacao de Escala" subtitle="Projete cenarios e descubra o ponto otimo de investimento"
          icon={<Zap size={16} className="text-white" />} accentColor="bg-pink-600"
          expanded={expanded} onToggle={toggle}>

          <p className="text-[12px] text-slate-600 leading-relaxed">
            O Simulador permite testar diferentes combinacoes de budget, CPC e CR para projetar lucro mensal antes de investir. Inclui 3 cenarios comparativos automaticos.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Chips de Budget',   desc: 'Botoes rapidos R$50/100/200/500/1k para testar cenarios sem digitar' },
              { label: 'Zona do CPC',       desc: 'Indicador visual mostrando se o CPC simulado e Bom, Medio, Apertado ou Critico para o produto' },
              { label: 'CR vs Meta',        desc: 'Compara o CR digitado com a meta do produto (requiredCR)' },
              { label: 'Usar Metas',        desc: 'Botao que preenche automaticamente CPC=cpcBom e CR=requiredCR do produto selecionado' },
              { label: 'Hero Metric',       desc: 'Lucro Mensal Projetado em destaque com pill VIAVEL / MARGINAL / INVIAVEL' },
              { label: 'Breakeven',         desc: 'Cliques minimos por dia necessarios para cobrir gasto + custos fixos' },
            ].map((f) => (
              <div key={f.label} className="bg-white rounded-xl border border-slate-200 p-2.5">
                <div className="text-2xs font-bold text-slate-700">{f.label}</div>
                <div className="text-2xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-700 mb-2">3 Cenarios Automaticos</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Conservador', desc: '-30% budget / -10% CR', color: 'bg-slate-50' },
                { label: 'Atual',       desc: 'Cenario digitado', color: 'bg-slate-900 text-white' },
                { label: 'Agressivo',   desc: '+50% budget', color: 'bg-slate-50' },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl px-3 py-2.5 text-center ${s.color}`}>
                  <div className={`text-[11px] font-bold ${s.color.includes('900') ? 'text-white' : 'text-slate-700'}`}>{s.label}</div>
                  <div className={`text-2xs mt-0.5 ${s.color.includes('900') ? 'text-slate-400' : 'text-slate-400'}`}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* ── Seção: Comparador ─────────────────────────────────────────────── */}
      <div id="section-comparador">
        <Section id="comparador" title="7. Comparador de Produtos" subtitle="Head-to-head entre dois produtos com battle bars"
          icon={<GitCompare size={16} className="text-white" />} accentColor="bg-indigo-600"
          expanded={expanded} onToggle={toggle}>

          <p className="text-[12px] text-slate-600 leading-relaxed">
            Compara dois produtos em 9 metricas de performance (campanhas salvas) e tambem nos specs do produto. Mostra placar geral e qual produto vence em cada categoria.
          </p>

          <div className="space-y-2">
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-bold text-slate-700 mb-1">Winner Banner</div>
              <p className="text-[11px] text-slate-500">Mostra qual produto vence na maioria das metricas com placar (ex: "Produto A vence 7 de 9 metricas"). Verde se ha vencedor claro, amarelo se empate.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-bold text-slate-700 mb-1">Battle Bars</div>
              <p className="text-[11px] text-slate-500">Cada metrica tem uma barra bicolor mostrando a dominancia relativa de cada produto. A barra se ajusta proporcionalmente aos valores reais.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-bold text-slate-700 mb-1">Requer campanhas salvas</div>
              <p className="text-[11px] text-slate-500">As metricas de performance so aparecem se o produto tiver campanhas salvas na aba Analise. Os specs do produto aparecem sempre.</p>
            </div>
          </div>
        </Section>
      </div>

      {/* ── Seção: Multi-moeda ────────────────────────────────────────────── */}
      <div id="section-moeda">
        <Section id="moeda" title="8. Produtos Internacionais & Multi-Moeda" subtitle="Como funciona o calculo quando voce ganha em USD/EUR no Brasil"
          icon={<Globe size={16} className="text-white" />} accentColor="bg-teal-600"
          expanded={expanded} onToggle={toggle}>

          <p className="text-[12px] text-slate-600 leading-relaxed">
            O sistema suporta produtos em qualquer moeda (BRL, USD, EUR, GBP). A logica de conversao garante que todos os calculos de CPC e lucro fiquem em R$ — porque o Google Ads cobra em R$.
          </p>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-[11px] font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <RefreshCw size={11} /> Fluxo de Conversao
            </div>
            <div className="space-y-2">
              {[
                { step: '1', label: 'Produto USD $200 com comissao 50%', detail: 'Comissao bruta = $100 USD' },
                { step: '2', label: 'Taxa de plataforma 5%',             detail: 'Comissao liquida = $95 USD' },
                { step: '3', label: 'Cambio USD/BRL = 5.50',            detail: 'Comissao liquida BRL = R$ 522,50' },
                { step: '4', label: 'CPC Bom = 4% de R$522,50',         detail: 'CPC Bom = R$ 20,90' },
                { step: '5', label: 'Na Analise: Gasto = R$300 (Google Ads)', detail: 'Revenue = conversoes × R$522,50' },
              ].map((s) => (
                <div key={s.step} className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-2xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</span>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-700">{s.label}</div>
                    <div className="text-2xs text-slate-400 font-mono">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Tip type="success">
            Voce nao precisa fazer nada diferente na aba Analise. Insira o gasto em R$ normalmente — o sistema ja usa a comissao convertida para BRL em todos os calculos.
          </Tip>

          <Tip type="warning">
            A taxa de cambio e configurada no Setup do produto (aba Financeiro). Atualize periodicamente para manter os calculos de CPC Bom precisos conforme o cambio variar.
          </Tip>
        </Section>
      </div>

      {/* ── Glossário ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-slate-800 leading-none">Glossario de Termos</div>
            <div className="text-2xs text-slate-400 mt-0.5">Definicoes e formulas dos principais KPIs</div>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <KpiDef term="CPC — Custo por Clique" def="Quanto voce paga por cada clique no anuncio. Calcular a saude do CPC e o foco principal do sistema." formula="CPC = Gasto / Cliques" />
          <KpiDef term="CPC Bom" def="Limite maximo de CPC para campanha ser lucrativa com margem segura. Calculado sobre a comissao liquida em BRL." formula="CPC Bom = Comissao BRL × 4%" />
          <KpiDef term="CR — Taxa de Conversao" def="Porcentagem de cliques que viram vendas. Ex: CR 2% = 2 vendas a cada 100 cliques." formula="CR = (Conversoes / Cliques) × 100" />
          <KpiDef term="CTR — Taxa de Clique" def="Porcentagem de exibicoes que resultam em clique. Indica a qualidade do anuncio." formula="CTR = (Cliques / Impressoes) × 100" />
          <KpiDef term="ROAS" def="Retorno sobre gasto em anuncios. ROAS 3x = R$3 de receita para cada R$1 investido." formula="ROAS = Receita / Gasto" />
          <KpiDef term="ROI" def="Retorno sobre investimento. ROI 100% = dobrou o dinheiro. ROI negativo = prejuizo." formula="ROI = ((Receita - Gasto) / Gasto) × 100" />
          <KpiDef term="CPA — Custo por Aquisicao" def="Quanto cada venda custou. Compare com a comissao para saber se esta lucrando." formula="CPA = Gasto / Conversoes" />
          <KpiDef term="Breakeven" def="Cliques minimos por dia para cobrir todos os custos (investimento + custos fixos) sem lucro nem prejuizo." formula="Breakeven = Custos totais / (Comissao × CR)" />
          <KpiDef term="Comissao Liquida" def="O que voce efetivamente recebe por venda, apos taxas da plataforma (Hotmart, Kiwify, etc.). Base para todos os calculos." formula="Comissao Liquida = Comissao Bruta - Taxa Plataforma" />
          <KpiDef term="Health Score" def="Pontuacao 0-100 calculada combinando CPC, CTR, CR, ROAS e ROI. Mede a saude geral da campanha." formula="Score = 50 pts base + ajustes por cada metrica" />
        </div>
      </div>

    </div>
  );
};

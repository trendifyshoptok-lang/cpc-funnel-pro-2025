# Stitch Prompt — Tema A: Clean Pro (Dashboard)

Premium affiliate marketing analytics dashboard. Desktop web app. Portuguese (Brazilian). Ultra-clean, data-forward, editorial precision. Every metric is visible, nothing is hidden. Think Stripe Dashboard meets Linear.app.

---

**VISUAL DIRECTION: "Cold Intelligence"**
White canvas. Slate-50 background (#f8fafc). Cards are pure white with no shadows — only a 1px border in slate-100. The single source of color is a 3px accent bar on top of each KPI card. Numbers dominate. Labels are tiny, uppercase, tracking-widest. Hierarchy through scale and weight, not color.

**FONTS:** DM Sans (Google Fonts). Headlines: 900 weight. Labels: 600 weight uppercase. Numbers: font-variant-numeric tabular.

**COLORS:**
- Background: #f8fafc (slate-50)
- Cards: #ffffff, border: 1px solid #e2e8f0
- Primary text: #0f172a (slate-900)
- Secondary text: #64748b (slate-500)
- Labels: #94a3b8 (slate-400), uppercase, 11px
- Accent bars: emerald-500 (revenue), rose-500 (cost), blue-500 (ROI), violet-500 (conversion)
- Active pill: bg-slate-900 text-white
- Positive: #10b981 (emerald-600)
- Negative: #f43f5e (rose-500)

**NO:** shadows, gradients, colorful backgrounds, emoji icons, purple/blue gradient backgrounds.

---

## PAGE LAYOUT

**Sidebar (fixed left, 240px wide):**
- Top: app logo "CPC Funnel Pro" in slate-900, 14px font-bold
- Nav items with Lucide icons: Hoje, Dashboard (active, bg-slate-100 rounded-lg), Mapeamento, Setup, Análise, Portfólio, Comparador, Simulador, Relatórios, Histórico
- Active item: left border 2px slate-900, bg-slate-50, text-slate-900 font-semibold
- Inactive: text-slate-500 hover:text-slate-700

**Top Bar (fixed, h-14, border-b border-slate-100, bg-white):**
- Left: "Dashboard" h1 text-lg font-bold text-slate-900
- Right: currency pills (USD R$ 5.82 | EUR R$ 6.43), notifications bell, profile avatar

---

## MAIN CONTENT (p-8, space-y-6, bg-slate-50)

### 1. PERIOD FILTER BAR (white card, rounded-2xl, border, px-5 py-3, flex items-center justify-between)
Left side:
- Label "PERÍODO" — text-[11px] font-bold text-slate-400 uppercase tracking-widest, mr-3
- Pills: "Hoje" | "7 dias" (active: bg-slate-900 text-white rounded-xl px-3.5 py-1.5 text-xs font-semibold) | "30 dias" | "Todo período" | "Personalizado"
Right side: Settings gear icon (slate-400)

### 2. KPI CARDS PRINCIPAIS (grid 4 cols, gap-4)
Each card: white, rounded-2xl, border border-slate-200, overflow-hidden. NO shadow.

Card structure:
```
[3px accent bar full width at top]
[p-6 body]
  LABEL — text-[11px] font-semibold text-slate-400 uppercase tracking-widest
  VALUE — text-4xl font-black text-slate-900 tabular-nums (or emerald/rose if profit/ROI)
  TREND — text-xs font-semibold, TrendingUp/Down icon (12px), "X.X% vs período anterior" in slate-400
  DIVIDER — border-t border-slate-100 mt-3 pt-3
  BREAKDOWN — 2 rows: label left (text-[11px] slate-400) + value right (text-[11px] font-semibold slate-600)
```

4 cards:
1. Receita Global — emerald accent bar — R$ 12.450,00 — +8.3% — breakdown: "Ads R$ 11.200" | "Extra R$ 1.250"
2. Custo Total — rose accent bar — R$ 6.230,00 — +3.1% — breakdown: "Ads R$ 4.800" | "Fixos R$ 1.430"
3. Lucro Líquido — emerald/rose accent bar (conditional) — R$ 6.220,00 — breakdown: "Margem 49.9%" | "Status Positivo"
4. ROI Global — blue accent bar — 99.8% — breakdown: "CPC R$ 1,85" | "CR 2.1%"

### 3. HEALTH SCORE + MÉTRICAS DETALHADAS (white card, rounded-2xl, border, p-5)
Header row: "PERFORMANCE GERAL" label (11px uppercase slate-400) + Health Score badge right ("Score: 85 — Excelente" in emerald-50 border-emerald-200 text-emerald-700 rounded-full text-xs font-bold)

Metrics grid (8 cols): each metric box = bg-slate-50 rounded-xl p-3 border border-slate-100
- CR Global: 2.1%
- CPC Médio: R$ 1,85
- Ticket Médio: R$ 247
- Conversões: 312
- Cliques: 14.850
- Burn/Dia: R$ 178
- Campanhas: 8
- Produtos: 6

Each box: icon (12px, colored) + label (10px uppercase slate-500 font-semibold) + value (text-xl font-black slate-900 tabular-nums)

### 4. PROJEÇÃO MENSAL (white card, rounded-2xl, border)
Header (px-6 py-4 flex justify-between): "Projeção para Fim do Mês" (sm font-bold slate-700) + TrendingUp icon (blue-500) + projected profit badge ("R$ 12.400 projetado" in emerald pill)

Content grid (4 cols, px-6 py-5 border-t border-slate-100):
- Receita Projetada: R$ 24.900 (2xl font-black slate-900)
- Custo Projetado: R$ 12.500 (2xl font-black slate-900)
- Lucro Projetado: R$ 12.400 (2xl font-black emerald-600)
- Meta Mensal: R$ 10.000 (2xl font-black slate-900) + progress bar below (h-1.5, bg-slate-100, fill blue-500, width 124%) + "124% da meta atingido" (11px slate-400)

### 5. TOP 3 & BOTTOM 3 (grid 2 cols, gap-4)
Both cards: white rounded-2xl border overflow-hidden.

Each card header (px-6 py-4 border-b border-slate-100):
- Crown icon (amber-500) or AlertTriangle (rose-500), 15px
- Title "Melhores Produtos" or "Precisam de Atenção" (sm font-bold slate-800)
- "por lucro" right-aligned (11px slate-400)

Each row (px-6 py-4 flex items-center gap-4 hover:bg-slate-50 divide-y divide-slate-100):
- Rank number: font-black 15px (gold/silver/bronze or rose icon)
- Product name: font-semibold slate-900 sm + nicho text-[11px] slate-400
- Right: profit (font-black emerald-600/rose-600 sm tabular-nums) + "ROI X%" (11px slate-400)

### 6. TABELA DE PRODUTOS (white card, rounded-2xl border overflow-hidden)
Header (px-6 py-4 border-b flex items-center justify-between):
- "Detalhamento por Produto" (sm font-bold slate-800) + product count badge
- Search input (border rounded-xl px-3 py-2 text-sm) + Export button (bg-slate-900 text-white rounded-xl text-sm font-semibold)

Table (full width, divide-y divide-slate-100):
Columns: Produto | Campanhas | Gasto | Receita | Lucro | ROI | CR | CPC | Ações
Header row: bg-slate-50, text-[11px] uppercase font-bold slate-400, sortable (chevron icons)
Data rows: hover:bg-slate-50, values in tabular-nums, profit/ROI colored green/red conditionally

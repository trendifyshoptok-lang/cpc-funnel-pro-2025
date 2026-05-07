# Stitch Prompt — Tela: Hoje (Today Panel)

Refined financial SaaS dashboard "Today" page. Clean, confident, data-forward. Think Stripe + Linear. Portuguese (Brazilian) language. White cards on slate-50 background.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first (1280px+), responsive
- Font: DM Sans — black for numbers, semibold for labels
- Palette: slate-900 text, white cards, slate-200 borders, slate-50 background; emerald-500 for revenue/profit; rose-500 for costs; blue-600 for actions
- Styles: rounded-2xl cards, no heavy shadows (border only), h-1 colored accent bars on top of KPI cards
- Numbers: 4xl font-black tabular-nums
- Labels: 11px uppercase tracking-widest font-semibold text-slate-400

**PAGE STRUCTURE:**

1. **Sidebar (left, 256px, slate-900 background):**
   - Logo "CPC Funnel Pro" at top
   - Navigation groups: (active: "Hoje"), Dashboard, [Campanha group: Mapeamento, Setup, Análise], [Portfólio group], [Dados group], Manual
   - Bottom: Mode toggle "Modo Iniciante" badge + collapse arrow

2. **Top Bar (sticky, white, 56px, border-b):**
   - Left: page title "Visão Geral" (15px font-semibold slate-800)
   - Right: "USD R$ 5.02" + "EUR R$ 5.83" currency pills (slate-50 bg, slate-200 border, 10px label + 12px bold value)

3. **Main Content (p-8, max-w-1400):**
   
   a. **Greeting Row** (mb-6):
      - Large greeting: "Boa tarde, Pedro" (text-2xl font-bold slate-900)
      - Subtitle: "Aqui está o resumo do seu dia" (text-sm slate-500)
      - Right side: current date badge (slate-100 bg)

   b. **Today KPI Cards** (grid 4 columns, gap-4):
      Each card = `bg-white rounded-2xl border border-slate-200 overflow-hidden`:
      - Card 1 (Lucro Hoje): h-1 emerald accent bar, label "LUCRO DO DIA" (11px uppercase), value "R$ 847,00" (text-4xl font-black emerald-600), below: "+23% vs ontem" (text-xs emerald-600 with TrendingUp icon)
      - Card 2 (Receita Hoje): h-1 emerald bar, "RECEITA" label, "R$ 2.340,00" (slate-900), below: source breakdown "Ads: R$ 2.100 / Extra: R$ 240"
      - Card 3 (Gasto Hoje): h-1 rose bar, "GASTO" label, "R$ 1.493,00" (slate-900), below: "Ads: R$ 1.200 / Fixos: R$ 293"
      - Card 4 (ROI Hoje): h-1 blue bar, "ROI" label, "56,7%" (text-4xl font-black blue-600), below: "Retorno sobre investimento"

   c. **Two-column section** (grid 2 cols, gap-4):
      
      Left col — "Produtos com Atenção" card (rounded-2xl, white, border):
      - Card header: AlertTriangle icon (rose-500) + "Precisa de Atenção" title (text-sm font-bold) + "hoje" badge
      - List of 3 products with divide-y divide-slate-100:
        Each row: AlertTriangle icon (rose-50 circle), product name (font-semibold text-sm), niche (11px slate-400), right side: profit value (rose-600 font-black) + "ROI -12%" (11px slate-400)
      - Empty state if no alerts: checkmark icon + "Tudo certo hoje" message

      Right col — "Ações Rápidas" card (rounded-2xl, white, border):
      - Card header: Zap icon (amber-500) + "Ações Rápidas" title
      - 4 large action buttons in 2x2 grid, each `bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer`:
        - "Mapear Produto" (Compass icon, blue)
        - "Setup Campanha" (SlidersHorizontal icon, violet)
        - "Registrar Análise" (TrendingUp icon, emerald)
        - "Ver Portfólio" (Briefcase icon, amber)
      - Each button: icon (24px), label (12px font-semibold slate-700 mt-2)

   d. **Status de Saúde** banner (rounded-2xl, bg-emerald-50 border border-emerald-200):
      - Left: CheckCircle icon (emerald-600, 20px) + "Carteira Saudável" (text-sm font-bold emerald-800) + "3 produtos lucrativos hoje" (text-xs emerald-700)
      - Right: "Score 78" badge (emerald-100, emerald-800, font-black text-lg)

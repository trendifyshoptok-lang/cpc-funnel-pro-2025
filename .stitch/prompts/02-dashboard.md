# Stitch Prompt — Tela: Dashboard

Premium financial SaaS analytics dashboard. Refined, data-forward, clean white cards on slate-50. Portuguese (Brazilian). Stripe-level quality. No gradients, no heavy decorations — pure data hierarchy.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first (1280px+)
- Font: DM Sans — font-black for KPI numbers, font-semibold for labels
- Palette: slate-900 text, white cards, slate-200 borders, slate-50 page bg; emerald for revenue; rose for costs; blue for actions/ROI
- Styles: rounded-2xl cards, border-only (no box-shadow), 1px colored accent bars (h-1) on KPI card tops
- Information hierarchy: 4xl numbers + 11px uppercase labels

**PAGE STRUCTURE:**

1. **Sidebar** (256px, slate-900): CPC Funnel Pro logo, navigation with "Dashboard" active (bg-blue-600 text-white rounded-lg)

2. **Top Bar** (56px, white, border-b): "Dashboard" title left, save status + currency pills right

3. **Main Content (space-y-6, p-8):**

   a. **Period Filter Bar** (white rounded-2xl border border-slate-200 px-5 py-3):
      - Left: "PERÍODO" label (11px uppercase tracking-widest slate-400 mr-3) + pill buttons: "Hoje" / "7 dias" / "30 dias" / "Todo período" / "Personalizado" (active = bg-slate-900 text-white rounded-xl text-xs font-semibold; inactive = text-slate-500 hover:bg-slate-100)
      - Right: Settings gear icon (slate-400, p-2 rounded-xl hover:bg-slate-100)

   b. **4 KPI Cards** (grid 4 cols, gap-4):
      Each card = white rounded-2xl border border-slate-200 overflow-hidden, structure:
      - **Top accent bar h-1** (emerald for revenue, rose for cost, emerald for profit, blue for ROI)
      - **Body p-6:**
        - Label: 11px uppercase tracking-widest text-slate-400 mb-1
        - Value: text-4xl font-black tabular-nums leading-none mt-2 mb-4
        - Trend row: TrendingUp/Down icon (12px) + percentage (xs font-semibold colored) + "vs período anterior" (slate-400 font-normal)
        - Divider: border-t border-slate-100 mt-3 pt-3
        - Breakdown: two rows "Ads / Extra" or "Ads / Fixos" or "Margem / Status" (11px slate-400 flex justify-between)
      
      Values shown:
      - Card 1: "Receita Global" → "R$ 18.450,00" (slate-900) + +12.3% (emerald)
      - Card 2: "Custo Total" → "R$ 9.230,00" (slate-900) + +8.1% (rose)
      - Card 3: "Lucro Líquido" → "R$ 9.220,00" (emerald-600) + +0.4% (emerald)
      - Card 4: "ROI Global" → "99,9%" (blue-600) + CPC Médio / CR Global in breakdown

   c. **Secondary Metrics Toggle** (centered):
      - Single pill button: BarChart3 icon + "Ver métricas detalhadas" + "▼" (text-xs font-semibold slate-500 border border-slate-200 rounded-xl bg-white)

   d. **Secondary Metrics Panel** (white rounded-2xl border, p-5):
      - Title: "MÉTRICAS DETALHADAS" (11px uppercase tracking-widest slate-400 mb-4)
      - 8 mini-cards in grid (2 rows x 4 cols), each = bg-slate-50 rounded-xl p-3 border border-slate-100:
        Small icon (12px colored) + label (10px uppercase slate-500) + value (text-xl font-black slate-900 tabular-nums)
        Metrics: CR Global, CPC Médio, Ticket Médio, Conversões, Cliques, Burn/Dia, Campanhas, Produtos

   e. **Monthly Projection** (white rounded-2xl border, collapsible):
      - Header row (px-6 py-4 hover:bg-slate-50): TrendingUp icon + "Projeção para Fim do Mês" (sm font-semibold slate-700) + "R$ 18.000 projetado" badge (emerald-50 border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold) + "▼ Ver projeção" right (11px slate-400)
      - Expanded body (border-t border-slate-100 px-6 py-5): 4 columns
        Each col: 11px uppercase tracking-widest label + text-2xl font-black tabular-nums value
        "Receita Projetada" slate-900 / "Custo Projetado" slate-900 / "Lucro Projetado" emerald-600 / "Meta Mensal" slate-900
        Under meta: progress bar (slate-100 bg, blue-500 fill, 40% filled, h-1.5 rounded-full) + "40% da meta atingido" (11px slate-400)

   f. **Rankings Section** (grid 2 cols, gap-4):
      
      Left — "Melhores Produtos" (white rounded-2xl border):
      - Header (px-6 py-4 border-b border-slate-100): Crown icon (amber-500) + "Melhores Produtos" title (sm font-bold slate-800) + "por lucro" right (11px slate-400)
      - 3 rows divide-y divide-slate-100, each px-6 py-4 hover:bg-slate-50:
        Rank number (sm font-black: amber-500 for #1, slate-400 for #2, orange-400 for #3) + Product name (font-semibold text-sm slate-900) + niche (11px slate-400) + right: profit (font-black emerald-600 text-sm tabular-nums) + "ROI X%" (11px slate-400)

      Right — "Precisam de Atenção" (white rounded-2xl border):
      - Header: AlertTriangle icon (rose-500) + "Precisam de Atenção" + "menor lucro" right
      - 3 rows: small AlertTriangle circle (rose-50 bg) + product name + niche + right: profit (rose-600) + ROI

   g. **Charts Section** (grid 2 cols, gap-4):
      - Left: "Tendência" line chart card (white rounded-2xl border, recharts-style: revenue emerald line, cost rose line, legend at top)
      - Right: "Funil de Conversão" funnel chart (horizontal bars narrowing: Cliques → Conversões → Receita)

   h. **Product Table** (white rounded-2xl border):
      - Header row with filters: search input (rounded-xl border) + "Filtros Avançados" toggle button
      - Table with columns: Produto / Gasto / Receita / Lucro / ROI / CR / Conversões / Cliques
      - Each row: product name + niche pill + sortable numeric columns with color coding (profit green if positive, red if negative)
      - Hover state: bg-slate-50

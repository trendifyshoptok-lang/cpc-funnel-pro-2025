# Stitch Prompt — Tela: Análise e Otimização

Campaign performance diagnosis screen. User enters real campaign data and gets instant intelligent feedback. Premium SaaS, data-forward. Portuguese (Brazilian). Two-panel layout: left = data input, right = diagnosis/results.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first
- Font: DM Sans
- Palette: slate-900, white cards, slate-200 borders, slate-50 bg, emerald for positive, rose for negative, amber for warning
- Styles: rounded-2xl cards, h-1 accent bars, 11px uppercase labels, text-4xl KPI numbers

**PAGE STRUCTURE:**

1. **Sidebar**: "Análise" active

2. **Top Bar**: "Análise e Otimização" title

3. **Main Content** (space-y-6, p-8):

   a. **Reference Metrics Bar** (white rounded-2xl border overflow-hidden):
      Grid 5 cols divide-x divide-slate-100:
      Each cell (px-4 py-4 relative):
      - h-0.5 accent bar top (emerald / blue / green / cyan / violet)
      - Label 11px uppercase tracking-widest + small icon
      - Value text-2xl font-black tabular-nums colored
      
      Cells:
      - "COMISSÃO LÍQUIDA" (DollarSign emerald) → "R$ 87,40" (emerald)
      - "CPC DE MERCADO" (TrendingUp blue) → "R$ 1,85" (blue)
      - "META CPC BOM" (Crosshair green) → "R$ 1,31" (green)
      - "PODER DE FOGO" (Flame cyan) → "47" (cyan)
      - "META CONVERSÃO" (Target violet) → "1,89%" (violet)

   b. **2-column layout** (grid lg:grid-cols-3 gap-6):

      **LEFT (2/3) — Data Input Card** (white rounded-2xl border):
      
      Card Header (px-6 py-4 border-b border-slate-100):
      - BarChart3 icon (blue-600) + "Dados da Campanha" (text-lg font-bold slate-800)
      - Right: "Últimos dados: 20/04/2025" (text-xs slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg)

      Filter Row (px-6 py-4 border-b border-slate-100, flex items-center gap-4):
      - "PERÍODO:" label (11px uppercase slate-400) + pill buttons "1d / 7d / 15d / 30d" (active = bg-slate-900 text-white rounded-xl; inactive = text-slate-500 hover:bg-slate-100) + divider + custom day input (w-12 text-center rounded-xl border)
      - Divider (h-5 w-px bg-slate-200)
      - "STATUS:" label + select dropdown "Aprendizado / Qualificada" (rounded-xl border px-3 py-1.5 text-xs font-semibold)

      Form Grid (px-6 py-5, 2 cols):
      
      Left col — "TRÁFEGO (FUNIL)" (Compass icon heading):
      - "Impressões" label + number input (rounded-xl border border-slate-200)
      - "Cliques" label + number input
      - Auto-calculated row: "CTR CALCULADO" label (11px uppercase slate-400) + value "2,34%" (text-xl font-bold) colored by threshold (green ≥5%, yellow ≥2%, red <2%)

      Right col — "FINANCEIRO & CONVERSÃO" (Wallet icon heading):
      - 2-col mini grid: "Gasto (R$)" input (focus:ring-rose-300) + "CPC Real" auto (read-only, bg-slate-50)
      - "Conversões (Vendas)" label + number input
      - Auto-calculated: "CR REAL" value (text-xl font-bold violet-600) + comparison arrow

      Save row (pt-4 border-t border-slate-100 flex justify-end):
      Save button + "Histórico" link button

      **RIGHT (1/3) — Diagnosis Panel** (space-y-4):

      Top — Verdict Card (white rounded-2xl border overflow-hidden):
      - h-1 accent bar (emerald if profitable, amber if break-even, rose if loss)
      - px-5 py-5:
        - "VEREDICTO" label (11px uppercase slate-400)
        - Large verdict: "Lucrativo" text-3xl font-black emerald-600 OR "Prejuízo" text-3xl font-black rose-600
        - Icon: CheckCircle (emerald) or XCircle (rose) size 32
        - Profit value: "R$ +312,00" (text-xl font-black) + "nos últimos 7 dias" (text-xs slate-400)

      Middle — Comparison Card (white rounded-2xl border px-5 py-5 space-y-4):
      - "DIAGNÓSTICO" label (11px uppercase)
      
      Row 1 — CPC comparison:
      "CPC REAL" label + progress-bar style:
      [Real: R$ 1,62] ←bar→ [Meta: R$ 1,85]
      Bar: real = blue-500, threshold = dashed amber line
      Status badge: "Dentro do limite" (emerald-50 border-emerald-200 text-emerald-700)

      Row 2 — CR comparison:
      "CONVERSÃO REAL" label
      [Real: 2,1%] vs [Necessário: 1,89%]
      Bar: violet-500 filled beyond threshold
      Status badge: "Acima da meta" (emerald)

      Bottom — Suggestions Card (white rounded-2xl border):
      - Zap icon (amber-500) + "Sugestões" title (sm font-bold)
      - 2-3 suggestion items, each = border-l-4 colored p-3 rounded-r-lg bg-colored-50:
        AlertCircle/CheckCircle icon + suggestion text (text-xs text-slate-700)

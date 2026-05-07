# Stitch Prompt — Tela: Setup da Campanha

Campaign configuration screen with 4-tab navigation. Premium SaaS. White cards, clean typography, data precision. Portuguese (Brazilian). The user is configuring their ad campaign strategy for a specific affiliate product.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first
- Font: DM Sans
- Palette: slate-900 text, white cards, slate-200 borders, slate-50 bg, colored accent bars h-1 for KPI cards
- Styles: rounded-2xl cards, 11px uppercase tracking-widest labels, text-4xl font-black KPI numbers

**PAGE STRUCTURE:**

1. **Sidebar**: "Setup" active in nav

2. **Top Bar**: "Setup da Campanha" title

3. **Main Content** (space-y-6, p-8):

   a. **Product Header Card** (white rounded-2xl border overflow-hidden):
      
      Top row (px-6 py-4 border-b border-slate-100 flex justify-between):
      - Left: Globe icon (p-1.5 bg-blue-50 rounded-lg text-blue-600) + text block:
        "SETUP DA CAMPANHA" (11px uppercase tracking-widest slate-400) + product name "Emagreça em 30 Dias" (text-base font-bold slate-900)
      - Right: two badges:
        "TOPO DE FUNIL" (bg-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg uppercase tracking-widest)
        "HOTMART" (bg-blue-50 text-blue-700 border border-blue-200 same style)

      Bottom row (grid 4 cols divide-x divide-slate-100):
      Each stat cell (px-6 py-5 relative):
      - Accent bar: absolute top-0 left-0 right-0 h-0.5 (emerald / blue / cyan / violet)
      - Label: 11px uppercase tracking-widest colored flex items-center gap-1.5 with small icon
      - Value: text-2xl font-black tabular-nums leading-none colored
      
      Stats:
      - "COMISSÃO LÍQUIDA" (DollarSign 11px emerald-600) → "R$ 87,40" (emerald-600)
      - "CPC DE MERCADO" (TrendingUp 11px blue-600) → "R$ 1,85" (blue-600)
      - "CLIQUES POSSÍVEIS" (MousePointer2 11px cyan-600) → "47" (cyan-600)
      - "CR NECESSÁRIO" (Target 11px violet-600) → "2,13%" (violet-600)

   b. **Tab Navigation Card** (white rounded-2xl border):
      
      Tab bar (bg-slate-50/50 border-b border-slate-200 px-1):
      4 tabs side by side:
      - Active tab: border-b-2 border-slate-900 text-slate-900 bg-white — icon (blue-600) + "FICHA TÉCNICA" label (11px uppercase tracking-widest)
      - Inactive tabs: border-transparent text-slate-500 — dimmed icon + label
      Tabs: Ficha Técnica (ClipboardList) / Financeiro (DollarSign) / Simulador (Calculator) / Estratégia (Zap)

      Tab Content — "Ficha Técnica" shown (p-6):
      
      2-column grid gap-6:
      
      Left col — "Dados do Produto":
      Section label "DADOS DO PRODUTO" (11px uppercase tracking-widest slate-400 mb-4)
      - Read-only fields in bg-slate-50 rounded-xl p-3:
        - Nome: product name (font-semibold)
        - Nicho: badge (blue-50 border-blue-200 text-blue-700 rounded-lg text-xs)
        - Mercado: "Brasil 🇧🇷"
        - Plataforma: "Hotmart"
        - Comissão bruta: "R$ 97,00"
        - Comissão líquida: "R$ 87,40" (emerald-600 font-bold)
      
      Right col — "Métricas Calculadas":
      Section label "MÉTRICAS CALCULADAS" (11px uppercase)
      - 4 metric cards in 2x2 grid (bg-slate-50 rounded-xl p-4 border border-slate-100):
        Each: small icon + label (10px uppercase slate-500) + large value (text-2xl font-black tabular-nums)
        - CPC Sugerido (blue): "R$ 1,31"
        - Break-Even CPC (slate): "R$ 1,87"  
        - Poder de Fogo (cyan): "53 cliques"
        - CR Mínimo (violet): "1,89%"
      
      Full-width bottom — "Semáforo de Viabilidade":
      Horizontal card (bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4):
      - Large CheckCircle (emerald-600, 24px)
      - Text: "Produto Viável" (font-bold emerald-800) + "O CPC de mercado (R$ 1,85) é menor que o Break-Even (R$ 1,87). Margem justa mas positiva." (text-xs emerald-700)
      - Right: "VIÁVEL" badge (emerald-700 bg-emerald-100 font-black uppercase px-3 py-1 rounded-lg)

   c. **Save Button** (flex justify-end):
      `bg-slate-900 text-white rounded-xl px-6 py-3 text-sm font-semibold flex items-center gap-2.5`
      Save icon + "Salvar Configuração"

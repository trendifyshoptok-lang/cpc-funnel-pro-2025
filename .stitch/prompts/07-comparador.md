# Stitch Prompt — Tela: Comparador de Produtos

Side-by-side product comparison tool. Data-dense but organized. Premium SaaS quality. User selects 2-4 products and sees all metrics compared in a structured table with visual highlights. Portuguese (Brazilian).

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first
- Font: DM Sans, rounded-2xl cards, border-only, slate palette
- Emphasis: tabular data, color-coded winners per row, clean grid

**PAGE STRUCTURE:**

1. **Sidebar**: "Comparador" active

2. **Top Bar**: "Comparador de Produtos" title

3. **Main Content** (space-y-6, p-8):

   a. **Product Selector Card** (white rounded-2xl border p-5):
      - Label: "SELECIONAR PRODUTOS" (11px uppercase tracking-widest slate-400 mb-3)
      - Flex row with 4 product selector slots:
        Each slot = white rounded-xl border border-slate-200 border-dashed flex items-center justify-center w-48 h-12 (empty = "+ Adicionar" with Plus icon slate-400; filled = product name badge with × remove)
      - Max 4 products, minimum 2 required to compare

   b. **Comparison Table Card** (white rounded-2xl border overflow-hidden):
      
      Table header row (bg-slate-50 border-b border-slate-200):
      - First col (w-48): "MÉTRICA" label (11px uppercase slate-400)
      - Product cols: each product name (font-bold text-sm slate-900) + niche badge below
      - Last col (if 2 products): "Diferença" header

      Table rows (divide-y divide-slate-100):
      Category separator rows (full-width, bg-slate-50/70 px-6 py-2): 
      "💰 FINANCEIRO", "📊 PERFORMANCE", "🎯 METAS", "⚙️ CONFIGURAÇÃO"
      
      Metric rows (px-6 py-3.5 hover:bg-slate-50 flex):
      - Metric name col: text-sm slate-700 font-medium + info icon (HelpCircle 12px slate-400 hover shows tooltip)
      - Product value cols: font-bold tabular-nums text-sm (winner cell highlighted with colored bg-colored-50)
      
      Metrics shown:
      - Comissão Líquida (winner = highest, emerald highlight)
      - CPC de Mercado (winner = lowest, emerald)
      - Break-Even CPC (winner = highest)
      - Cliques Compráveis / R$100 (winner = highest)
      - CR Necessário (winner = lowest)
      - ROI Estimado (winner = highest)
      - Temperatura (1-5 stars)
      - Etapa do Funil

   c. **Recommendation Banner** (emerald-50 border border-emerald-200 rounded-2xl px-6 py-4):
      - Crown icon (amber-500) + "Recomendação" (font-bold emerald-800)
      - Product name highlighted: "Emagreça em 30 Dias tem melhor score geral" (text-sm emerald-700)
      - Score bar: emerald bar 78% + "Score 78/100" badge
      - CTA button right: "Ir para Setup" (bg-emerald-600 text-white rounded-xl px-4 py-2 text-sm font-semibold)

   d. **Radar Chart Card** (white rounded-2xl border p-6):
      - Title: "Perfil de Performance" (sm font-bold slate-800 mb-4)
      - Radar/spider chart with 6 axes: Comissão / CPC / CR / ROI / Temperatura / Funil
      - Each product = different colored polygon (emerald for product 1, blue for product 2)
      - Legend below chart

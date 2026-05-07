# Stitch Prompt — Tela: Portfólio

Product portfolio management screen with 3-tab navigation. Premium SaaS. All affiliate products in one view with performance data, filtering, and budget optimization. Portuguese (Brazilian).

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first
- Font: DM Sans, rounded-2xl cards, border-only, slate palette, emerald/rose semantics
- Styles: tab navigation with 11px uppercase labels, KPI cards with h-1 accent bars

**PAGE STRUCTURE:**

1. **Sidebar**: "Portfólio" active

2. **Top Bar**: "Portfólio" title + right: "Adicionar Produto" button (bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold, Plus icon)

3. **Main Content** (space-y-6, p-8):

   a. **4 Summary KPI Cards** (grid 4 cols gap-4):
      Each: white rounded-2xl border overflow-hidden
      - h-1 accent bar (blue / emerald / rose / violet)
      - p-5 body:
        - Icon in colored square (p-1.5 rounded-lg bg-color-100) + label (11px uppercase slate-400) on same row
        - Value: text-3xl font-black tabular-nums slate-900 (or colored)
        - Sub-text: text-xs slate-400 mt-1
      
      Cards:
      - "PRODUTOS" (Package blue): "8" (slate-900) + "produtos cadastrados"
      - "LUCRATIVOS" (CheckCircle emerald): "5" (emerald-600) + "gerando lucro"
      - "GASTO TOTAL" (DollarSign rose): "R$ 9.230" (slate-900) + "no período"
      - "LUCRO TOTAL" (TrendingUp violet): "R$ 4.180" (emerald-600) + "no período"

   b. **Tab Navigation** (white rounded-2xl border):
      
      Tab bar (bg-slate-50/50 border-b border-slate-200):
      3 tabs: "RESUMO" / "MEUS PRODUTOS" / "OTIMIZAR BUDGET"
      Active: border-b-2 border-slate-900 text-slate-900 bg-white text-[11px] uppercase tracking-widest

      **Tab Content — "Meus Produtos" shown** (p-6 space-y-4):

      Filter Row:
      - Search input (Search icon inside, rounded-xl border, "Buscar produto..." placeholder, flex-1)
      - "Status" select (All/Lucrativo/Negativo/Neutro, rounded-xl border text-xs)
      - "Ordenar por" select (Lucro/ROI/Gasto/Nome)

      Product Cards List (space-y-3):
      Each product = white rounded-xl border border-slate-200 hover:border-slate-300 transition:
      
      Layout: flex items-center gap-4 px-5 py-4
      
      Left: Status indicator (w-1 h-12 rounded-full bg-emerald-500 / bg-rose-500 / bg-slate-300)
      
      Center-left: 
      - Product name (font-semibold text-sm slate-900) + action badges right: "Setup" (blue-50 text-blue-700 text-[10px] rounded px-1.5 py-0.5) "Análise" (violet-50 same)
      - Niche badge (slate-100 text-slate-600 text-[10px] rounded px-1.5 py-0.5) + Market flag + Platform

      Center metrics (flex gap-6, auto margin):
      3 metric pairs each: label (10px uppercase slate-400) + value (font-black text-sm tabular-nums colored)
      - LUCRO: "R$ 847,00" (emerald-600)
      - ROI: "91,8%" (blue-600)  
      - GASTO: "R$ 923,00" (slate-900)

      Right: Action menu (3-dot icon or explicit Edit/Delete icons, slate-400 hover:slate-700)

      **At bottom of product list:**
      Empty state if no products: Package icon (64px slate-200) + "Nenhum produto ainda" + "Mapear Primeiro Produto" button

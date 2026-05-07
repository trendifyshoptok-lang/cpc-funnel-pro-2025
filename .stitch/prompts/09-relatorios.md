# Stitch Prompt — Tela: Relatórios

Report generation and data export screen. Clean, utilitarian but premium. Portuguese (Brazilian). User selects period and products, previews data, exports to Excel.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first
- Font: DM Sans, rounded-2xl cards, slate palette, border-only

**PAGE STRUCTURE:**

1. **Sidebar**: "Relatórios" active

2. **Top Bar**: "Relatórios" title

3. **Main Content** (2-column layout, p-8 gap-6):

   **LEFT — Export Configuration Card** (white rounded-2xl border p-6):
   
   - "CONFIGURAR RELATÓRIO" section (11px uppercase tracking-widest slate-400 mb-4)
   
   Period selector:
   - Label "Período" + 5 pill buttons (Hoje / 7 dias / 30 dias / Todo / Personalizado)
   - Date range inputs if "Personalizado" (2 date inputs side-by-side)
   
   Product selector:
   - Label "Produtos" + "Selecionar todos" link (text-xs blue-600)
   - Checkboxes list of products (each: checkbox + product name + niche badge)
   
   Report type:
   - Radio options: "Completo" / "Resumo Executivo" / "Por Produto"
   
   Export buttons (mt-6 flex gap-3):
   - Primary: "Exportar Excel" (bg-emerald-600 text-white rounded-xl px-5 py-2.5 font-semibold, Download icon)
   - Secondary: "Exportar PDF" (border border-slate-200 rounded-xl)

   **RIGHT — Preview Card** (white rounded-2xl border):
   
   Header (px-6 py-4 border-b border-slate-100):
   - BarChart3 icon + "Prévia do Relatório" title + "7 dias selecionados" badge
   
   Summary stats (px-6 py-4 grid 3 cols gap-4 border-b border-slate-100):
   - 3 mini KPIs: Receita / Gasto / Lucro (each: 11px label + 2xl font-black value)
   
   Table preview (px-6 py-4):
   - Small table with 5 rows: Produto / Receita / Gasto / Lucro / ROI
   - Striped bg-slate-50 alternate rows
   - "... e mais X linhas" footer (text-xs slate-400)
   
   Bottom row (px-6 py-4 border-t border-slate-100 flex justify-between):
   - "8 produtos · 23 campanhas" (text-xs slate-400)
   - Last export: "Último: 20/04/2025 às 14h32" (text-xs slate-400)

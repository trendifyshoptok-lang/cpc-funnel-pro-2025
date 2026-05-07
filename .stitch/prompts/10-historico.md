# Stitch Prompt — Tela: Histórico de Campanhas

Campaign history timeline. Chronological log of all campaign data entries. Premium SaaS, clean list view. Portuguese (Brazilian). User can browse, filter and delete past campaign data entries.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first
- Font: DM Sans, rounded-2xl cards, border-only, slate palette, divide-y for rows

**PAGE STRUCTURE:**

1. **Sidebar**: "Histórico" active

2. **Top Bar**: "Histórico de Campanhas" title

3. **Main Content** (space-y-6, p-8):

   a. **Filter Bar** (white rounded-2xl border px-5 py-3 flex gap-4):
      - Search input (flex-1, "Buscar produto...", Search icon inside)
      - Period filter pills: "7 dias / 30 dias / 3 meses / Tudo"
      - Product select dropdown
      - "X campanhas" count badge (slate-100 slate-600 rounded-full text-xs font-semibold)

   b. **Timeline List** (white rounded-2xl border overflow-hidden):
      
      Grouped by date (each date group):
      
      Date separator row (bg-slate-50 px-6 py-2 border-b border-slate-100):
      - Date: "Segunda, 21 de Abril" (text-xs font-bold text-slate-500 uppercase tracking-wider)
      
      Campaign entry rows (divide-y divide-slate-100):
      Each row (flex items-center gap-4 px-6 py-4 hover:bg-slate-50):
      - Left: Time pill (bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded) "14:32"
      - Product badge (blue-50 border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg)
      - Center: period indicator "7 dias" (text-xs slate-500) + status badge "Aprendizado" or "Qualificada" (colored)
      - Metrics inline (flex gap-6):
        "Cliques: 312" / "Gasto: R$ 578" / "Conv: 6" / "CPC: R$ 1,85" (each: 11px slate-400 label + xs font-semibold slate-700 value)
      - Right: Lucro badge (emerald-50 border-emerald-200 text-emerald-700 font-bold text-xs OR rose for negative) + "R$ +234,00"
      - Delete icon (Trash2, slate-300 hover:rose-500 transition ml-2)

   c. **Summary Footer** (white rounded-2xl border px-6 py-4 flex justify-between items-center):
      - Left: "23 campanhas registradas · 8 produtos" (text-sm slate-500)
      - Right: "Exportar histórico" link (text-sm blue-600 font-semibold, Download icon)

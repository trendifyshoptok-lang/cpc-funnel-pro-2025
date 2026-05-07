# Stitch Prompt — Tela: Simulador de Escala

Budget scaling simulator for affiliate campaigns. User inputs current campaign data and target budget, sees projected outcomes. Premium SaaS, data-forward. Portuguese (Brazilian). Clean sliders + result projection cards.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first
- Font: DM Sans, rounded-2xl cards, border-only, slate palette
- Styles: large projection numbers, progress sliders, scenario cards (pessimist/realistic/optimistic)

**PAGE STRUCTURE:**

1. **Sidebar**: "Simulador de Escala" active

2. **Top Bar**: "Simulador de Escala" title

3. **Main Content** (2-column layout, p-8):

   **LEFT COLUMN (inputs, 1/3):**
   
   a. **Product Selector Card** (white rounded-2xl border p-5):
      - "PRODUTO" label (11px uppercase) + select dropdown (product name, rounded-xl border)
      - Quick metrics row below (3 badges inline): "CPC R$ 1,85" + "CR 2,1%" + "ROI 91%"

   b. **Budget Input Card** (white rounded-2xl border p-5):
      - "ORÇAMENTO ATUAL" label + input with R$ prefix + "/dia" suffix (slate-400)
      - Slider bar below (blue-500 fill, range 0-500)
      - "ORÇAMENTO ALVO" label + input + slider
      - Scale multiplier badge: "3.5× escala" (blue-50 border-blue-200 text-blue-700 rounded-full text-sm font-bold)

   c. **Current Performance Card** (white rounded-2xl border p-5):
      - "PERFORMANCE ATUAL" label
      - 3 rows: CPC Real / CR Real / Ticket Médio (each: label left, input right)

   **RIGHT COLUMN (projections, 2/3) space-y-4:**

   a. **3 Scenario Cards** (grid 3 cols gap-3):
      Each card = rounded-2xl border overflow-hidden:
      
      Card 1 — Pessimista:
      - h-1 rose accent bar
      - p-5:
        - TrendingDown icon (rose-500) + "Pessimista" (sm font-bold rose-700) + "-20% CR" badge
        - Receita: "R$ 8.400" (text-2xl font-black slate-900 tabular-nums)
        - Gasto: "R$ 5.250" (sm rose-600)
        - Lucro: "R$ 3.150" (sm emerald-600 font-black)
        - ROI: "60%" (xs slate-400)

      Card 2 — Realista (highlighted with ring-2 ring-blue-500):
      - h-1 blue accent bar
      - Same structure, values: "R$ 10.500" receita, "R$ 5.250" gasto, "R$ 5.250" lucro, "100% ROI"
      - "Cenário Base" badge (blue-50 border-blue-200)

      Card 3 — Otimista:
      - h-1 emerald accent bar
      - "R$ 13.125" receita, "R$ 5.250" gasto, "R$ 7.875" lucro, "150% ROI"

   b. **Scale Timeline Card** (white rounded-2xl border p-6):
      - Rocket icon + "Cronograma de Escala Sugerido" title (sm font-bold)
      - 4-step timeline (horizontal or vertical):
        Each step: numbered circle (blue-600 text-white font-black) + label + sub-text
        - "Semana 1: Manter R$ 50/dia — Validar dados"
        - "Semana 2: Aumentar para R$ 80/dia (+60%)"
        - "Semana 3: Aumentar para R$ 120/dia (+50%)"
        - "Semana 4: Orçamento alvo R$ 175/dia"

   c. **Break-Even Card** (white rounded-2xl border px-6 py-5):
      - "PONTO DE BREAK-EVEN" label (11px uppercase slate-400)
      - Large: "R$ 42,00/dia" (text-3xl font-black slate-900) + "mínimo para cobrir custos"
      - Progress bar: current vs break-even (emerald fill if above, rose if below)
      - Status: "Acima do break-even — campanha lucrativa" badge (emerald)

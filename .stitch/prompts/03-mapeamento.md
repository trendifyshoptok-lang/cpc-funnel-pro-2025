# Stitch Prompt — Tela: Mapeamento de Produto

Guided product research and registration form. Clean, step-by-step wizard feel. Premium SaaS quality — DM Sans, white cards, slate tones. Portuguese (Brazilian). The user is mapping a new affiliate product before investing in ads.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first
- Font: DM Sans
- Palette: slate-900 text, white cards, slate-200 borders, slate-50 bg, blue-600 accents, emerald for success/viability, rose for warnings
- Styles: rounded-2xl cards, border-only no shadow, clean labels 11px uppercase

**PAGE STRUCTURE:**

1. **Sidebar**: "Mapeamento" active in nav

2. **Top Bar**: "Mapeamento de Produto" title

3. **Main Content** (2-column layout, left 2/3 form + right 1/3 viability panel):

   **LEFT COLUMN — Form Card** (white rounded-2xl border):

   a. **Card Header** (px-6 py-4 border-b border-slate-100):
      - FileText icon (blue-600) + "Novo Produto" title (text-lg font-bold slate-900)
      - Progress indicator: "Passo 1 de 4" badge (blue-50 border-blue-200 text-blue-700)

   b. **Section 1 — Identificação** (px-6 py-5 border-b border-slate-100):
      - Section label: "01 IDENTIFICAÇÃO" (11px uppercase tracking-widest slate-400 mb-4)
      - Grid 2 cols gap-4:
        - "Nome do Produto" input (full text, rounded-xl border border-slate-200)
        - "Nicho" select dropdown
        - "Mercado" select: BR 🇧🇷 / US 🇺🇸 / EU 🇪🇺 / UK 🇬🇧
        - "Plataforma" select: Hotmart / Monetizze / Eduzz / Kiwify / Outros
      - "Etapa do Funil" radio group (3 options inline): 
        Topo / Meio / Fundo (pill style, active = bg-slate-900 text-white)

   c. **Section 2 — Comissão** (px-6 py-5 border-b border-slate-100):
      - Section label: "02 OFERTA & COMISSÃO"
      - 3 cols: Preço de Venda (R$ prefix) / Comissão Bruta (% suffix) / Comissão Líquida (auto-calculated, bg-emerald-50 border-emerald-200 text-emerald-700 font-bold, read-only)
      - Helper text: "A comissão líquida é calculada automaticamente" (11px slate-400)

   d. **Section 3 — CPC de Mercado** (px-6 py-5 border-b border-slate-100):
      - Section label: "03 CPC DE MERCADO"
      - Large input group: "R$" prefix + number input + "CPC médio praticado neste nicho" helper text
      - Info box (blue-50 border-blue-200 rounded-xl p-3): Info icon + "Pesquise no Google Keyword Planner ou Semrush" (text-xs text-blue-700)

   e. **Section 4 — Temperatura** (px-6 py-5):
      - Section label: "04 TEMPERATURA DO PRODUTO"
      - 5-step scale horizontal: 
        Frio (1) → Morno (2) → Médio (3) → Quente (4) → Viral (5)
        Active step = filled circle bg-slate-900, inactive = border circle
        Label below each: Frio / Pouco validado / Validado / Aquecido / Viral
      - Current selection badge: "Validado — produto com algumas vendas confirmadas" (slate-50 border rounded-xl p-3)

   **RIGHT COLUMN — Viability Panel** (sticky top, space-y-4):

   a. **Viability Card** (white rounded-2xl border overflow-hidden):
      - Accent bar h-1 (emerald if viable, amber if borderline, rose if not viable)
      - Header px-6 py-4: Calculator icon + "Análise de Viabilidade" (sm font-bold)
      - Body px-6 py-5 space-y-4:
        - 4 metric rows, each:
          Label (11px uppercase slate-400) + Value right (font-black tabular-nums colored)
          - "CPC SUGERIDO": "R$ 1,24" (emerald-600)
          - "BREAK-EVEN CPC": "R$ 1,87" (slate-900)
          - "CLIQUES POSSÍVEIS (R$100)": "80 cliques" (cyan-600)
          - "CR NECESSÁRIO": "1,25%" (violet-600)
      - Viability verdict box (rounded-xl p-4):
        - If viable: bg-emerald-50 border-emerald-200 — CheckCircle (emerald, 20px) + "Produto Viável" (font-bold emerald-800) + explanation text
        - If marginal: bg-amber-50 border-amber-200 — AlertCircle (amber) + "Atenção Necessária"
        - If not viable: bg-rose-50 border-rose-200 — XCircle (rose) + "Produto Arriscado"

   b. **Checklist Card** (white rounded-2xl border):
      - Header: CheckSquare icon + "Checklist de Validação"
      - List of 6 checklist items, each = flex row:
        Checkbox (checked = bg-blue-600 text-white, unchecked = border border-slate-200 rounded) + Label (text-sm slate-700)
        Items: "Produto com avaliações positivas" / "Página de vendas profissional" / "Suporte ao afiliado" / "Comissão acima de R$ 50" / "Nicho com demanda comprovada" / "CPC viável para a comissão"
      - Progress: "4 de 6 itens" + progress bar (blue-500)

   c. **Save Button** (full width):
      - `bg-slate-900 text-white rounded-xl py-3 font-semibold text-sm w-full`
      - Save icon + "Salvar e Ir para Setup"

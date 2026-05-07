# Stitch Prompt — Tema B: Gamer/RGB (Dashboard)

Premium affiliate marketing analytics dashboard. Desktop web app. Portuguese (Brazilian). Dark, high-energy, RGB gaming aesthetic. Think a hybrid between a trading terminal and a gaming HUD. Every metric glows. Data feels powerful.

---

**VISUAL DIRECTION: "Neon Command Center"**
Deep dark background (#070b14). Cards have dark surfaces (#0d1421) with neon-glowing borders. Numbers glow in brand accent colors. Subtle grid pattern on background. Gradients are everywhere but purposeful. This is a dashboard that makes you FEEL like you're in control.

**FONTS:** Space Grotesk (Google Fonts) for labels and UI. Orbitron for big numbers (the "hero KPIs"). Both available via Google Fonts.
- Numbers: Orbitron, 900 weight, tabular-nums, letter-spacing: -0.02em
- Labels: Space Grotesk, 600 weight, uppercase, tracking-widest
- Body: Space Grotesk, 400-500 weight

**COLOR PALETTE:**
- Background: #070b14 (near-black with blue tint)
- Card surface: #0d1421
- Card border: 1px solid rgba(0,255,136,0.15) — subtle neon green glow
- Active card border: 1px solid rgba(0,255,136,0.5) with box-shadow: 0 0 20px rgba(0,255,136,0.1)
- Primary neon: #00ff88 (neon green) — revenue, profit, positive
- Secondary neon: #7c3aed → #a855f7 gradient (purple) — ROI, conversion
- Accent cyan: #00e5ff — clicks, CPC
- Danger neon: #ff2d55 (neon rose) — costs, negative values
- Warning neon: #ffaa00 (amber) — attention metrics
- Text primary: #e2f0ff (near-white with blue tint)
- Text secondary: #4a6080 (muted blue-gray)
- Text labels: #2a4060 uppercase tracking-widest

**EFFECTS:**
- Subtle dot grid pattern on main background: radial-gradient(circle, rgba(0,229,255,0.06) 1px, transparent 1px), background-size: 24px 24px
- KPI cards: top accent bar replaced by gradient glow border + 2px neon top border
- Numbers glow: text-shadow: 0 0 20px currentColor at 40% opacity
- Active elements: subtle outer glow
- Scrollbar: custom dark with neon accent

---

## PAGE LAYOUT

**Sidebar (fixed left, 240px wide, bg-#070b14, border-r border-[rgba(0,255,136,0.1)]):**
- Top: "CPC FUNNEL PRO" in Orbitron font, 12px, letter-spacing: 4px, text-[#00ff88] with subtle glow
- Nav items: Space Grotesk icons with Lucide
- Active: left-border 2px #00ff88, bg-[rgba(0,255,136,0.05)], text-white glow
- Inactive: text-[#4a6080] hover:text-[#00ff88]
- Bottom: version badge "v2.0 PRO" in purple gradient pill

**Top Bar (h-14, bg-#070b14, border-b border-[rgba(0,255,136,0.1)]):**
- Left: "DASHBOARD" in Orbitron, 14px, tracking-widest, text-white
- Right: 
  - Live indicator: pulsing green dot + "AO VIVO" text in #00ff88 tiny font
  - Currency pills: dark surface (#0d1421), border neon, "USD 5.82" in cyan
  - Bell icon (neon border on hover)
  - Avatar with purple gradient ring

---

## MAIN CONTENT (p-8, space-y-6, bg-#070b14 with dot grid)

### 1. PERIOD FILTER BAR (#0d1421 card, rounded-xl, border border-[rgba(0,229,255,0.15)], px-5 py-3)
Left:
- Label "PERÍODO" — 10px Space Grotesk font-bold uppercase tracking-widest text-[#4a6080]
- Pills: "7 dias" active = bg-gradient-to-r from-[#00ff88] to-[#00e5ff] text-black rounded-lg px-3.5 py-1.5 text-xs font-bold
- Inactive pills: text-[#4a6080] border border-[rgba(255,255,255,0.05)] hover:border-[#00ff88]/30
Right: settings icon in neon teal on hover

### 2. KPI CARDS (grid 4 cols, gap-4)
Each card: bg-#0d1421, rounded-xl, border-2 at top (neon color), remaining borders 1px rgba(neon,0.2)
Top accent: 3px gradient bar (not just solid color — use gradient)

Card structure:
```
[3px gradient bar at top — e.g. from-emerald-400 to-cyan-400]
[p-6 body]
  LABEL — "RECEITA GLOBAL" — 10px Space Grotesk uppercase tracking-widest text-[#2a4060]
  VALUE — Orbitron 900, 3xl, neon color, text-shadow glow
  TREND — Space Grotesk xs, trending icon in neon, "vs período anterior" in [#2a4060]
  DIVIDER — border-t border-[rgba(255,255,255,0.05)] mt-3 pt-3
  BREAKDOWN — Space Grotesk 11px, values in cyan
```

4 cards:
1. Receita Global — green gradient — "R$ 12.450" in #00ff88 with glow
2. Custo Total — rose gradient — "R$ 6.230" in #ff2d55 with glow
3. Lucro Líquido — green/rose conditional — "R$ 6.220" in #00ff88
4. ROI Global — purple gradient — "99.8%" in #a855f7 with glow

### 3. HEALTH SCORE + MÉTRICAS DETALHADAS (#0d1421 card, rounded-xl, border-[rgba(0,229,255,0.15)])
Header: "PERFORMANCE GERAL" label + animated score badge ("SCORE 85 — EXCELENTE" with green glow, pulsing animation)

Metrics grid (8 cols): each box = bg-[rgba(255,255,255,0.02)] rounded-xl p-3 border border-[rgba(255,255,255,0.05)] hover:border-[#00ff88]/30 transition
- Icon (12px, neon color)
- Label (10px Space Grotesk uppercase [#2a4060])
- Value (Orbitron xl font-bold, neon color, subtle glow)

8 metrics: CR 2.1% (cyan) | CPC R$1,85 (cyan) | Ticket R$247 (purple) | Conv 312 (green) | Cliques 14.850 (cyan) | Burn R$178 (amber) | Campanhas 8 (purple) | Produtos 6 (green)

### 4. PROJEÇÃO MENSAL (#0d1421 card, rounded-xl, border green glow)
Header: "PROJEÇÃO PARA FIM DO MÊS" (Orbitron 12px tracking-wider text-white) + TrendingUp (cyan) + neon badge ("R$ 12.400 projetado" — green gradient text bg-[rgba(0,255,136,0.08)] border-[#00ff88]/30)

Content grid (4 cols):
- Each stat: label in [#2a4060] + value in Orbitron 2xl neon color
- Progress bar: bg-[rgba(255,255,255,0.05)] rounded-full h-1.5, fill = linear-gradient(90deg, #00ff88, #00e5ff), glow effect
- "124% da meta atingido" in #00ff88 small font

### 5. TOP 3 & BOTTOM 3 (grid 2 cols)
Both: #0d1421 rounded-xl border. Top3 = green border glow. Bottom3 = rose border glow.

Headers: crown (amber neon) / alert (rose neon) + Orbitron title small
Rows: hover = subtle row background [rgba(0,255,136,0.03)]. Rank = Orbitron bold neon. Profit = colored Orbitron. ROI = small colored badge.

### 6. TABELA DE PRODUTOS (#0d1421 card, rounded-xl, border cyan glow)
Header: "DETALHAMENTO POR PRODUTO" (Orbitron 11px tracking-wider white) + neon search input (dark bg, cyan border on focus) + export button (green gradient bg, dark text, font-bold)

Table: dark rows, hover = rgba(0,229,255,0.04) row glow
Header row: bg-[rgba(255,255,255,0.02)], Space Grotesk 10px uppercase [#2a4060] with sort arrows in cyan
Data: profit/ROI in neon colors, negatives in rose. Alternating subtle row tints.

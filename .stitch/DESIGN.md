# CPC Funnel Pro — Design System Source of Truth

## Product Identity
**CPC Funnel Pro** is a premium SaaS dashboard for Brazilian digital affiliates managing paid traffic (Google Ads, Meta Ads). The aesthetic is **Refined Financial SaaS** — think Stripe + Linear + Vercel: clean white cards, precise typography, data-forward hierarchy, generous whitespace. No gradients, no heavy shadows, no clutter. Every pixel earns its place.

**Target mood:** Professional. Confident. Fast to read. Trustworthy.

---

## Typography

- **Font family:** DM Sans (Google Fonts) — all weights
- **KPI values (primary numbers):** `font-black text-4xl tabular-nums leading-none`
- **KPI labels:** `font-semibold text-[11px] uppercase tracking-widest text-slate-400`
- **Section titles:** `font-bold text-sm text-slate-800`
- **Body / input text:** `font-medium text-sm text-slate-700`
- **Meta text / hints:** `font-medium text-[11px] text-slate-400`
- **Tab labels:** `font-semibold text-[11px] uppercase tracking-widest`

---

## Color Palette

| Token | Hex | Role |
|-------|-----|------|
| `text-primary` | `#0F172A` | Main headings, KPI values |
| `text-subtle` | `#94A3B8` | Labels, secondary text |
| `surface` | `#F8FAFC` | Page background |
| `card` | `#FFFFFF` | Card backgrounds |
| `border` | `#E2E8F0` | Card and input borders |
| `blue-primary` | `#2563EB` | CTAs, active states, links |
| `emerald-accent` | `#10B981` | Revenue, positive, profit |
| `rose-accent` | `#F43F5E` | Cost, negative, loss |
| `blue-accent` | `#3B82F6` | ROI, conversion metrics |
| `violet-accent` | `#8B5CF6` | Conversion rate metrics |
| `amber-accent` | `#F59E0B` | Warnings, rank #1 |
| `cyan-accent` | `#06B6D4` | Click metrics |
| `sidebar-bg` | `#0F172A` | Sidebar background |
| `sidebar-active` | `#2563EB` | Active nav item |
| `sidebar-text` | `#94A3B8` | Inactive nav text |

---

## Core Components

### Card
```
bg-white rounded-2xl border border-slate-200 overflow-hidden
```
**With accent bar (KPI cards):**
```
Top: h-1 w-full bg-[accent-color]
Body: p-6
```
**Divider style:** `divide-y divide-slate-100` or `border-t border-slate-100`

### Buttons
```
Primary:   bg-slate-900 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-slate-800
Secondary: bg-white border border-slate-200 text-slate-600 rounded-xl px-4 py-2 text-xs font-semibold
Danger:    bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-2 text-xs font-semibold
Active pill: bg-slate-900 text-white rounded-xl px-3.5 py-1.5 text-xs font-semibold
Inactive pill: text-slate-500 rounded-xl px-3.5 py-1.5 text-xs font-semibold hover:bg-slate-100
```

### Inputs
```
px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-slate-300 outline-none bg-white text-slate-900
```

### Tabs
```
Active:   border-b-2 border-slate-900 text-slate-900 bg-white text-[11px] uppercase tracking-widest font-semibold
Inactive: border-b-2 border-transparent text-slate-500 text-[11px] uppercase tracking-widest font-semibold hover:text-slate-700
Container: bg-slate-50/50 border-b border-slate-200
```

### Status Badges
```
Success: bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full
Warning: bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full
Error:   bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full
Info:    bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full
```

---

## Layout System

### Sidebar
- Width expanded: 256px | Collapsed: 72px
- Background: `#0F172A` (slate-900)
- Active item: `bg-blue-600 text-white rounded-lg`
- Inactive item: `text-slate-400 hover:text-white hover:bg-white/8 rounded-lg`
- Group labels: `text-[10px] font-bold text-slate-500 uppercase tracking-widest`
- Logo area: top, 64px height
- Bottom area: mode toggle (Beginner/Pro) + collapse button

### Top Bar (Header)
- Height: 56px
- Background: `bg-white border-b border-slate-200`
- Left: current page title (`text-[15px] font-semibold text-slate-800`)
- Right: Save status + Currency pills (USD R$ X.XX, EUR R$ X.XX)

### Content Area
- Max width: 1400px, centered
- Padding: `p-6 lg:p-8`
- Page background: `bg-slate-50`

### Grid System
- KPI cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`
- Two-column: `grid-cols-1 lg:grid-cols-2 gap-4`
- Three-column: `grid-cols-1 lg:grid-cols-3 gap-6`

---

## Information Hierarchy (most important rule)

1. **Level 1 — Primary KPI:** `text-4xl font-black` number + `text-[11px] uppercase` label + colored `h-1` accent bar
2. **Level 2 — Secondary stat:** `text-2xl font-black` number + `text-[11px] uppercase` label
3. **Level 3 — Supporting detail:** `text-sm font-medium` text, `text-slate-600`
4. **Level 4 — Metadata:** `text-[11px] font-medium` text, `text-slate-400`

**The primary number must be 3-4x larger than its label.** This creates instant scanability for busy users.

---

## Accent Color Assignment by Metric

| Metric Type | Accent Color | Hex |
|-------------|-------------|-----|
| Revenue, profit (positive) | Emerald | `#10B981` |
| Cost, spend, loss (negative) | Rose | `#F43F5E` |
| ROI, performance | Blue | `#3B82F6` |
| Conversion rate (CR) | Violet | `#8B5CF6` |
| Clicks, traffic | Cyan | `#06B6D4` |
| Warning, ranking | Amber | `#F59E0B` |
| Neutral/general | Slate | `#64748B` |

---

## Spacing & Radius

- Base spacing unit: 4px (Tailwind default)
- Card border radius: `rounded-2xl` (16px)
- Input/button radius: `rounded-xl` (12px)
- Badge/pill radius: `rounded-full`
- Internal card padding: `p-6` (24px)
- Card gap: `gap-4` (16px)

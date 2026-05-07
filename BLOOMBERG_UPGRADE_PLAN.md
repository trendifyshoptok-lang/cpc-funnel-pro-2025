# Bloomberg Terminal Refinado — Plano de Execução

> **Direção:** Densidade alta, tipografia tabular obsessiva, vibe de ferramenta de trader profissional.
> **Estratégia em Opus 4.7. Execução em Sonnet 4.6.**

---

## 🔍 Auditoria do Estado Atual

| Área | Estado | Problema |
|------|--------|----------|
| **Tipografia** | DM Sans + DM Mono | Genérico. DM Sans não tem o peso terminal-grade. Sem display font. |
| **Cor accent** | `blue-600` (#2563EB) | Genérico, "SaaS template". Não diferencia. |
| **Sidebar** | Gradient `#0F172A → #1a2540 → #1E293B` | Decente mas falta acent rail e indicadores live. |
| **Background** | `#F1F5F9` (slate-100) | Cinza-azulado frio. Não contrasta com accent cyan. |
| **Números** | `tabular-nums` em alguns lugares | Inconsistente. Falta em tabelas/cards. |
| **Motion** | Sem sistema de tokens | Cada animação tem timing arbitrário. |
| **Sparklines** | Não existem | Métricas estáticas. Falta sentido temporal. |
| **Status indicators** | Não existem | Não há "vida" no app — sem dots pulsantes. |
| **Count-up** | `AnimatedNumber` é stub | Números aparecem instantaneamente. |
| **Skeleton** | Existe mas básico | Falta shimmer refinado. |
| **Toasts** | Componente custom em App.tsx | Não tem o polish de shadcn/sonner. |

**Veredito:** Bones decentes, faltam camadas premium. Não é redo — é upgrade cirúrgico.

---

## 🎨 Sistema de Design (Decisões Finais)

### Fontes
- **Inter Tight** (UI / headings) — wider que Inter, mais "terminal pro"
- **Inter** (body / longas) — workhorse
- **JetBrains Mono** (TODO número, métrica, código) — industry standard
- **Instrument Serif** (display moments — hero number, page title accent) — distintivo

### Paleta (commit final)
```
--bg-app:        #FAFAF9   /* warm off-white (substitui slate-100) */
--bg-sidebar:    #0A0E1A   /* near-black (mais fundo que atual) */
--bg-card:       #FFFFFF
--bg-subtle:     #F5F5F4   /* stone-100 — warmer */

--border-subtle: #E7E5E4   /* stone-200 */
--border-strong: #D6D3D1   /* stone-300 */

--text-primary:   #0A0E1A
--text-secondary: #57534E  /* stone-600 — warmer */
--text-muted:     #A8A29E  /* stone-400 */

--accent:         #0E7490  /* cyan-700 — primary CTA, active */
--accent-hover:   #155E75  /* cyan-800 */
--accent-glow:    #22D3EE  /* cyan-400 — highlights, dots, focus rings */

--success: #059669   /* emerald-600 */
--danger:  #DC2626   /* red-600 */
--warn:    #D97706   /* amber-600 */
```

### Motion Tokens
```
--motion-instant: 80ms     /* checkboxes, toggles */
--motion-fast:    150ms    /* hover, focus, color */
--motion-base:    220ms    /* card expand, slide */
--motion-slow:    360ms    /* modal, page */

--ease-out:    cubic-bezier(0.16, 1, 0.3, 1)        /* Emil Kowalski */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Type Scale
```
--text-xs:   11px / 16px      /* labels uppercase */
--text-sm:   13px / 18px      /* UI default */
--text-base: 14px / 21px      /* body */
--text-md:   16px / 24px      /* emphasis */
--text-lg:   20px / 28px      /* card title */
--text-xl:   28px / 32px      /* metric */
--text-2xl:  40px / 44px      /* hero number */
--text-3xl:  56px / 60px      /* display */
```

---

## 📦 FASE 1 — Foundation (Tokens + Fontes)

### Arquivo: `src/index.css`

**Substituir TODO o conteúdo atual por:**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Inter+Tight:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Tokens ──────────────────────────────────────────────────────────── */
:root {
  /* Fonts */
  --font-ui:      'Inter Tight', 'Inter', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  --font-display: 'Instrument Serif', 'Times New Roman', serif;

  /* Surfaces */
  --bg-app:        #FAFAF9;
  --bg-sidebar:    #0A0E1A;
  --bg-card:       #FFFFFF;
  --bg-subtle:     #F5F5F4;
  --bg-overlay:    rgba(10, 14, 26, 0.50);

  /* Borders */
  --border-subtle: #E7E5E4;
  --border-strong: #D6D3D1;
  --border-dark:   rgba(255, 255, 255, 0.08);

  /* Text */
  --text-primary:   #0A0E1A;
  --text-secondary: #57534E;
  --text-muted:     #A8A29E;
  --text-inverse:   #FAFAF9;

  /* Accent (electric cyan) */
  --accent:         #0E7490;
  --accent-hover:   #155E75;
  --accent-glow:    #22D3EE;
  --accent-soft:    #ECFEFF;

  /* Semantic */
  --success: #059669;
  --success-soft: #ECFDF5;
  --danger:  #DC2626;
  --danger-soft: #FEF2F2;
  --warn:    #D97706;
  --warn-soft: #FFFBEB;

  /* Motion */
  --motion-instant: 80ms;
  --motion-fast:    150ms;
  --motion-base:    220ms;
  --motion-slow:    360ms;
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;

  /* Shadows (sutis — quase só borders) */
  --shadow-xs: 0 1px 0 rgba(10, 14, 26, 0.04);
  --shadow-sm: 0 1px 2px rgba(10, 14, 26, 0.04), 0 0 0 1px rgba(10, 14, 26, 0.05);
  --shadow-md: 0 2px 8px rgba(10, 14, 26, 0.06), 0 0 0 1px rgba(10, 14, 26, 0.05);
  --shadow-glow: 0 0 0 4px rgba(34, 211, 238, 0.12);
}

/* ─── Reset ──────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
@media (min-width: 1280px) { html { font-size: 15px; } }

body {
  min-height: 100vh;
  font-family: var(--font-body);
  background: var(--bg-app);
  color: var(--text-primary);
  font-feature-settings: 'cv11', 'ss01', 'ss03';
}

#root { width: 100%; min-height: 100vh; }

/* ─── Typography ─────────────────────────────────────────────────────── */
@layer base {
  h1, h2, h3, h4, h5 { font-family: var(--font-ui); font-feature-settings: 'cv11'; }
  h1 { @apply text-2xl font-bold tracking-tight text-stone-900; letter-spacing: -0.02em; }
  h2 { @apply text-xl  font-semibold text-stone-900; letter-spacing: -0.01em; }
  h3 { @apply text-base font-semibold text-stone-800; }
  h4 { @apply text-sm   font-semibold text-stone-700; }
  p  { @apply text-sm   text-stone-600 leading-relaxed; }

  /* TODO número usa mono */
  .num, [data-num] {
    font-family: var(--font-mono);
    font-feature-settings: 'tnum', 'zero', 'ss01';
    font-variant-numeric: tabular-nums slashed-zero;
  }

  .display {
    font-family: var(--font-display);
    font-style: italic;
    letter-spacing: -0.02em;
  }
}

/* ─── Components ─────────────────────────────────────────────────────── */
@layer components {

  /* ═══ CARDS ═══════════════════════════════════════════════════════ */
  .card {
    @apply bg-white rounded-[14px] border border-stone-200;
    box-shadow: var(--shadow-xs);
  }
  .card-elevated {
    @apply card;
    box-shadow: var(--shadow-sm);
  }
  .card-interactive {
    @apply card transition-all;
    transition-duration: var(--motion-fast);
    transition-timing-function: var(--ease-out);
  }
  .card-interactive:hover {
    box-shadow: var(--shadow-md);
    border-color: #D6D3D1;
  }

  /* ═══ METRIC CARD (Bloomberg-style) ═══════════════════════════════ */
  .metric-tile {
    @apply card p-4 flex flex-col gap-2 relative overflow-hidden;
  }
  .metric-label {
    @apply text-[10px] font-semibold uppercase text-stone-400;
    letter-spacing: 0.12em;
  }
  .metric-value {
    font-family: var(--font-mono);
    @apply text-2xl font-bold text-stone-900 tabular-nums;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums slashed-zero;
  }
  .metric-delta {
    font-family: var(--font-mono);
    @apply text-xs font-semibold tabular-nums;
  }
  .metric-delta-up   { color: var(--success); }
  .metric-delta-down { color: var(--danger); }

  /* ═══ BUTTONS ═════════════════════════════════════════════════════ */
  .btn {
    font-family: var(--font-ui);
    @apply inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold cursor-pointer border outline-none disabled:opacity-50 disabled:cursor-not-allowed;
    transition: all var(--motion-fast) var(--ease-out);
    letter-spacing: -0.01em;
  }
  .btn:focus-visible { box-shadow: var(--shadow-glow); }
  .btn-sm  { @apply text-xs  px-3 py-1.5; }
  .btn-md  { @apply text-sm  px-4 py-2; }
  .btn-lg  { @apply text-base px-5 py-2.5; }

  .btn-primary {
    background: var(--accent);
    color: #FFFFFF;
    border-color: var(--accent-hover);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(14, 116, 144, 0.30);
  }
  .btn-primary:hover { background: var(--accent-hover); }

  .btn-secondary {
    @apply bg-white text-stone-800 border-stone-200 hover:bg-stone-50 hover:border-stone-300;
  }
  .btn-ghost {
    @apply bg-transparent text-stone-600 border-transparent hover:bg-stone-100 hover:text-stone-900;
  }
  .btn-danger {
    background: var(--danger);
    color: #FFFFFF;
    @apply border-red-700;
  }

  /* ═══ INPUTS ═════════════════════════════════════════════════════ */
  .input {
    font-family: var(--font-body);
    @apply w-full rounded-[10px] border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
           placeholder:text-stone-400 outline-none;
    transition: all var(--motion-fast) var(--ease-out);
  }
  .input:focus {
    border-color: var(--accent);
    box-shadow: var(--shadow-glow);
  }
  .input-num { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

  /* ═══ BADGES ═════════════════════════════════════════════════════ */
  .badge {
    font-family: var(--font-ui);
    @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold;
    letter-spacing: 0.02em;
  }
  .badge-success { background: var(--success-soft); color: var(--success); }
  .badge-danger  { background: var(--danger-soft);  color: var(--danger); }
  .badge-warn    { background: var(--warn-soft);    color: var(--warn); }
  .badge-accent  { background: var(--accent-soft);  color: var(--accent); }
  .badge-neutral { @apply bg-stone-100 text-stone-700; }

  /* ═══ STATUS DOT (live indicator) ════════════════════════════════ */
  .status-dot {
    @apply inline-block w-1.5 h-1.5 rounded-full relative;
  }
  .status-dot::after {
    content: '';
    @apply absolute inset-0 rounded-full;
    animation: pulse-ring 2s var(--ease-out) infinite;
  }
  .status-dot-live   { background: var(--success); }
  .status-dot-live::after   { background: var(--success); }
  .status-dot-warn   { background: var(--warn); }
  .status-dot-warn::after   { background: var(--warn); }
  .status-dot-error  { background: var(--danger); }
  .status-dot-error::after  { background: var(--danger); }
  .status-dot-idle   { background: var(--text-muted); }

  /* ═══ SKELETON / SHIMMER ═════════════════════════════════════════ */
  .skeleton {
    @apply rounded-md;
    background: linear-gradient(90deg, #E7E5E4 0%, #F5F5F4 50%, #E7E5E4 100%);
    background-size: 200% 100%;
    animation: shimmer 1.4s var(--ease-in-out) infinite;
  }

  /* ═══ TABLE (dense, Bloomberg-like) ══════════════════════════════ */
  .data-table { @apply w-full text-sm; font-family: var(--font-body); }
  .data-table thead tr {
    @apply border-b border-stone-200;
    background: var(--bg-subtle);
  }
  .data-table thead th {
    @apply px-3 py-2 text-left text-[10px] font-bold text-stone-500 uppercase;
    letter-spacing: 0.10em;
    font-family: var(--font-ui);
  }
  .data-table tbody tr {
    @apply border-b border-stone-100;
    transition: background var(--motion-fast) var(--ease-out);
  }
  .data-table tbody tr:hover { background: var(--bg-subtle); }
  .data-table tbody td { @apply px-3 py-2 text-stone-800; }
  .data-table .num-cell {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    @apply text-right;
  }

  /* ═══ KBD (keyboard shortcut) ════════════════════════════════════ */
  .kbd {
    font-family: var(--font-mono);
    @apply inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded text-[10px] font-semibold
           bg-stone-100 text-stone-600 border border-stone-200;
  }
}

/* ─── Animations ──────────────────────────────────────────────────────── */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes pulse-ring {
  0%   { transform: scale(1);   opacity: 0.7; }
  80%  { transform: scale(2.4); opacity: 0;   }
  100% { transform: scale(2.4); opacity: 0;   }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-8px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0); max-height: 1000px; }
}

.page-enter { animation: fade-in var(--motion-base) var(--ease-out) both; }

/* ─── Sidebar (dark) overrides ───────────────────────────────────────── */
.sidebar-dark {
  background: var(--bg-sidebar);
  color: var(--text-inverse);
}
.sidebar-dark .nav-item {
  font-family: var(--font-ui);
  @apply flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium cursor-pointer;
  color: rgba(250, 250, 249, 0.50);
  transition: all var(--motion-fast) var(--ease-out);
  position: relative;
}
.sidebar-dark .nav-item:hover {
  color: rgba(250, 250, 249, 0.95);
  background: rgba(255, 255, 255, 0.04);
}
.sidebar-dark .nav-item-active {
  color: #FFFFFF;
  background: rgba(34, 211, 238, 0.10);
}
.sidebar-dark .nav-item-active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  border-radius: 0 2px 2px 0;
  background: var(--accent-glow);
  box-shadow: 0 0 8px var(--accent-glow);
}

/* ─── Scrollbars ─────────────────────────────────────────────────────── */
::-webkit-scrollbar              { width: 6px; height: 6px; }
::-webkit-scrollbar-track        { background: transparent; }
::-webkit-scrollbar-thumb        { background: #D6D3D1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover  { background: #A8A29E; }
* { scrollbar-width: thin; scrollbar-color: #D6D3D1 transparent; }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.sidebar-dark ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
.sidebar-dark ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.16); }

/* ─── Utilities ──────────────────────────────────────────────────────── */
.font-ui      { font-family: var(--font-ui); }
.font-body    { font-family: var(--font-body); }
.font-mono    { font-family: var(--font-mono); }
.font-display { font-family: var(--font-display); font-style: italic; letter-spacing: -0.02em; }

.tnum {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums slashed-zero;
}

/* Page tab transitions */
.tab-enter { animation: fade-in var(--motion-base) var(--ease-out) both; }
```

---

## 📦 FASE 2 — Componentes Premium (Novos)

### `src/components/ui/Sparkline.tsx`

```tsx
import React, { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showArea?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 80,
  height = 24,
  color,
  strokeWidth = 1.5,
  showArea = true,
}) => {
  const { path, areaPath, lastPoint, trend } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: '', areaPath: '', lastPoint: null, trend: 0 };
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    const points = data.map((v, i) => ({
      x: i * stepX,
      y: height - ((v - min) / range) * height,
    }));

    const path = points
      .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
      .join(' ');

    const areaPath = `${path} L ${width},${height} L 0,${height} Z`;
    const trend = data[data.length - 1] - data[0];

    return { path, areaPath, lastPoint: points[points.length - 1], trend };
  }, [data, width, height]);

  const stroke = color ?? (trend >= 0 ? '#059669' : '#DC2626');
  const fill = trend >= 0 ? 'rgba(5, 150, 105, 0.10)' : 'rgba(220, 38, 38, 0.10)';

  if (!path) return <div style={{ width, height }} className="bg-stone-100 rounded" />;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {showArea && <path d={areaPath} fill={fill} />}
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {lastPoint && (
        <circle cx={lastPoint.x} cy={lastPoint.y} r={2.5} fill={stroke}>
          <animate attributeName="r" from="2.5" to="5" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="1" to="0" dur="1.4s" repeatCount="indefinite" />
        </circle>
      )}
      {lastPoint && <circle cx={lastPoint.x} cy={lastPoint.y} r={2} fill={stroke} />}
    </svg>
  );
};
```

### `src/components/ui/StatusDot.tsx`

```tsx
import React from 'react';

type Status = 'live' | 'warn' | 'error' | 'idle';

interface StatusDotProps {
  status?: Status;
  label?: string;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status = 'live', label, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 ${className}`}>
    <span className={`status-dot status-dot-${status}`} />
    {label && (
      <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
        {label}
      </span>
    )}
  </span>
);
```

### `src/components/ui/AnimatedNumber.tsx` (substituir o stub atual)

```tsx
import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  format?: (v: number) => string;
  duration?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format = (v) => v.toFixed(2),
  duration = 600,
  className = '',
}) => {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = ease(progress);
      const current = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className={`tnum ${className}`}>{format(display)}</span>;
};
```

### `src/components/ui/Card.tsx` (premium card unified)

```tsx
import React, { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface CardProps {
  title?: string;
  subtitle?: string;
  sparkline?: number[];
  delta?: number;
  metric?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title, subtitle, sparkline, delta, metric, collapsible = false,
  defaultOpen = false, actions, children, className = '',
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const hasHeader = title || sparkline || metric || actions;
  const isOpen = collapsible ? open : true;

  return (
    <div className={`card overflow-hidden ${className}`}>
      {hasHeader && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 ${
            collapsible ? 'cursor-pointer hover:bg-stone-50/50 transition-colors' : ''
          }`}
          onClick={() => collapsible && setOpen((o) => !o)}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="min-w-0">
              {title && (
                <h3 className="text-[13px] font-semibold text-stone-900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-stone-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} />}
            {metric && (
              <span className="tnum text-sm font-bold text-stone-900">{metric}</span>
            )}
            {delta !== undefined && (
              <span className={`tnum text-xs font-semibold ${
                delta >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
              </span>
            )}
            {actions}
            {collapsible && (
              <ChevronDown
                size={14}
                className={`text-stone-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
        </div>
      )}
      {isOpen && (
        <div className={hasHeader ? 'border-t border-stone-100' : ''}>
          {children}
        </div>
      )}
    </div>
  );
};
```

### `src/components/ui/Shimmer.tsx`

```tsx
import React from 'react';

interface ShimmerProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%', height = 16, className = '', rounded = 'md',
}) => {
  const radiusMap = { sm: 'rounded', md: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full' };
  return (
    <div
      className={`skeleton ${radiusMap[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
};
```

### `src/components/ui/MetricTile.tsx`

```tsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { AnimatedNumber } from './AnimatedNumber';

interface MetricTileProps {
  label: string;
  value: number;
  format?: (v: number) => string;
  delta?: number;
  sparkline?: number[];
  status?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label, value, format = (v) => v.toFixed(2), delta, sparkline, status = 'neutral', icon,
}) => {
  const valueColor =
    status === 'positive' ? 'text-emerald-600' :
    status === 'negative' ? 'text-red-600' : 'text-stone-900';

  return (
    <div className="metric-tile group">
      <div className="flex items-center justify-between gap-2">
        <span className="metric-label">{label}</span>
        {icon && <span className="text-stone-300">{icon}</span>}
      </div>
      <div className={`metric-value ${valueColor}`}>
        <AnimatedNumber value={value} format={format} />
      </div>
      <div className="flex items-center justify-between gap-2 mt-auto">
        {delta !== undefined && (
          <span className={`metric-delta ${delta >= 0 ? 'metric-delta-up' : 'metric-delta-down'} flex items-center gap-1`}>
            {delta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
        {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} width={64} height={20} />}
      </div>
    </div>
  );
};
```

### `src/components/ui/CommandPalette.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  hint?: string;
  group?: string;
  action: () => void;
}

interface CommandPaletteProps {
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ commands }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.group?.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white rounded-[14px] border border-stone-200 shadow-2xl overflow-hidden tab-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
          <Search size={16} className="text-stone-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar comando..."
            className="flex-1 outline-none text-sm bg-transparent placeholder:text-stone-400"
          />
          <span className="kbd">Esc</span>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-stone-400 py-6">Nada encontrado</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => { c.action(); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-left text-sm hover:bg-stone-50 transition-colors"
              >
                <div>
                  <span className="text-stone-900 font-medium">{c.label}</span>
                  {c.group && <span className="text-stone-400 ml-2 text-xs">{c.group}</span>}
                </div>
                {c.hint && <span className="kbd">{c.hint}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 🛠 FASE 3 — Refactor Map (arquivos existentes)

### `src/components/Layout.tsx`

**Mudanças cirúrgicas:**

1. Substituir gradient da sidebar por flat `--bg-sidebar`:
   ```tsx
   // ANTES:
   style={{ background: "linear-gradient(180deg, #0F172A 0%, #1a2540 60%, #1E293B 100%)", ... }}
   // DEPOIS:
   className="sidebar-dark"
   style={{ borderRight: "1px solid var(--border-dark)" }}
   ```

2. Substituir classes de nav-item pelas utility classes `.nav-item` e `.nav-item-active` (do CSS).

3. Adicionar **status indicator** no rodapé da sidebar (logo acima dos botões):
   ```tsx
   <div className="px-3 py-2 border-t border-white/[0.06]">
     <div className="flex items-center justify-between">
       <StatusDot status="live" label="Sincronizado" />
       <span className="tnum text-[10px] text-white/40">{lastSaveTime ? new Date(lastSaveTime).toLocaleTimeString('pt-BR') : '—'}</span>
     </div>
   </div>
   ```

4. Topbar:
   - Aumentar para `h-12` (era `h-14` — mais denso)
   - Adicionar trigger do CommandPalette: `<button>⌘K Buscar...</button>`
   - Currency pills passam a ter mini-sparkline: usar `<Sparkline data={[...]} width={32} height={12} />`

### `src/components/TodayPanel.tsx`

**Reescrever a seção de "Resumo do Portfolio" usando `<MetricTile>`:**

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  <MetricTile
    label="Produtos"
    value={products.length}
    format={(v) => Math.round(v).toString()}
    icon={<Briefcase size={12} />}
  />
  <MetricTile
    label="Lucrativos"
    value={profitableProducts.length}
    format={(v) => `${Math.round(v)}/${products.length}`}
    status={profitableProducts.length > 0 ? 'positive' : 'neutral'}
  />
  <MetricTile
    label="Receita 7d"
    value={weekRevenue}
    format={fmt}
    delta={revenueDelta}
    sparkline={last7DaysRevenue}
    status="positive"
  />
  <MetricTile
    label="Lucro 7d"
    value={weekProfit}
    format={fmt}
    delta={profitDelta}
    sparkline={last7DaysProfit}
    status={weekProfit >= 0 ? 'positive' : 'negative'}
  />
</div>
```

**Hero panel:** trocar `text-2xl font-black` por `font-display text-[44px]` no greeting:
```tsx
<h1 className="font-display text-[44px] leading-none text-white">
  {greeting()}, gestor
</h1>
```

### `src/components/Dashboard.tsx`

**Cada chart card colapsável usa o novo `<Card>`:**

```tsx
<Card
  title="Receita vs Custo"
  subtitle="Por produto"
  sparkline={revenueSparkline}
  metric={fmt(totalRevenue)}
  delta={revenueDelta}
  collapsible
  defaultOpen={false}
>
  <div className="p-4 h-[300px]">
    <ResponsiveContainer ...>
      {/* chart existente */}
    </ResponsiveContainer>
  </div>
</Card>
```

### Tabelas (Portfolio, History)

Substituir markup atual por:
```tsx
<table className="data-table">
  <thead>
    <tr>
      <th>Produto</th>
      <th className="text-right">Receita</th>
      <th className="text-right">CPC</th>
      <th className="text-right">ROI</th>
    </tr>
  </thead>
  <tbody>
    {rows.map((r) => (
      <tr key={r.id}>
        <td className="font-medium">{r.name}</td>
        <td className="num-cell">{fmt(r.revenue)}</td>
        <td className="num-cell">{fmt(r.cpc)}</td>
        <td className="num-cell">
          <span className={r.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}>
            {r.roi.toFixed(1)}%
          </span>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### `src/App.tsx` — Command Palette wiring

Adicionar no render principal:
```tsx
<CommandPalette commands={[
  { id: 'goto-hoje',      label: 'Ir para Início',       group: 'Navegação', hint: '⌘1', action: () => handleTabChange('hoje') },
  { id: 'goto-dashboard', label: 'Ir para Dashboard',    group: 'Navegação', hint: '⌘2', action: () => handleTabChange('dashboard') },
  { id: 'goto-portfolio', label: 'Ir para Portfolio',    group: 'Navegação', hint: '⌘3', action: () => handleTabChange('portfolio') },
  { id: 'goto-mapping',   label: 'Mapear novo produto',  group: 'Ações',     action: () => handleTabChange('mapping') },
  { id: 'export',         label: 'Exportar backup',      group: 'Sistema',   action: handleExport },
  { id: 'import',         label: 'Importar backup',      group: 'Sistema',   action: handleImport },
]} />
```

---

## 📋 FASE 4 — Toast/Notification Premium

Substituir `<Notification>` atual em App.tsx por novo componente:

### `src/components/ui/Toast.tsx`

```tsx
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warn' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const ICONS = {
  success: <CheckCircle2 size={14} />,
  error:   <AlertCircle size={14} />,
  warn:    <AlertTriangle size={14} />,
  info:    <Info size={14} />,
};

const COLORS = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error:   'border-red-200 bg-red-50 text-red-800',
  warn:    'border-amber-200 bg-amber-50 text-amber-800',
  info:    'border-stone-200 bg-white text-stone-800',
};

export const Toast: React.FC<ToastProps> = ({ type, message, onClose, duration = 4000 }) => {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 tab-enter">
      <div className={`flex items-center gap-2 pr-2 pl-3 py-2 rounded-[10px] border ${COLORS[type]} shadow-lg`}>
        {ICONS[type]}
        <span className="text-[13px] font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 p-1 rounded hover:bg-black/5 transition-colors">
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
```

---

## 🧬 FASE 5 — Loading States Premium

Substituir spinners por skeletons sempre que possível.

**Padrão para o Dashboard antes de dados carregarem:**

```tsx
{loading ? (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="metric-tile">
        <Shimmer width={60} height={10} />
        <Shimmer width="80%" height={28} className="mt-2" />
        <Shimmer width={40} height={10} className="mt-2" />
      </div>
    ))}
  </div>
) : (
  // métricas reais
)}
```

---

## 🚦 EXECUTION CHECKLIST (Sonnet 4.6)

Execute na ordem **rigorosamente**:

### Setup
- [ ] **1.** Criar diretório `src/components/ui/`
- [ ] **2.** Substituir TODO `src/index.css` pelo conteúdo da FASE 1
- [ ] **3.** Atualizar `index.html` `<title>`: "CPC Funnel Pro" (sem o &)

### Componentes UI base
- [ ] **4.** Criar `src/components/ui/Sparkline.tsx`
- [ ] **5.** Criar `src/components/ui/StatusDot.tsx`
- [ ] **6.** Substituir `src/components/AnimatedNumber.tsx` pelo novo
- [ ] **7.** Criar `src/components/ui/Shimmer.tsx`
- [ ] **8.** Criar `src/components/ui/Card.tsx`
- [ ] **9.** Criar `src/components/ui/MetricTile.tsx`
- [ ] **10.** Criar `src/components/ui/CommandPalette.tsx`
- [ ] **11.** Criar `src/components/ui/Toast.tsx`

### Layout
- [ ] **12.** Refatorar `src/components/Layout.tsx`:
  - sidebar usa `.sidebar-dark` em vez do gradient
  - nav-items usam `.nav-item` / `.nav-item-active`
  - adicionar `<StatusDot live label="Sincronizado">` no rodapé
  - aumentar densidade do topbar (`h-12`)
  - adicionar botão do CommandPalette no topbar (com kbd `⌘K`)

### Páginas
- [ ] **13.** `TodayPanel.tsx`:
  - hero usa `font-display text-[44px]`
  - portfolio summary usa `<MetricTile>` (4 tiles com sparkline + delta)
  - garantir todos números com classe `tnum`
- [ ] **14.** `Dashboard.tsx`:
  - cada chart colapsável envolto em `<Card collapsible>` com `sparkline` no header
  - métrica resumo ao lado do título do card
- [ ] **15.** `Portfolio.tsx`:
  - tabela usa `.data-table` + `.num-cell` para colunas numéricas
  - badges de status usam `.badge-success` / `.badge-danger`
- [ ] **16.** `App.tsx`:
  - substituir `<Notification>` interno pelo `<Toast>` do ui/
  - adicionar `<CommandPalette commands={...}>` ao final do render
  - adicionar atalhos `⌘1..⌘9` para navegação de tabs

### Polish
- [ ] **17.** Garantir que TODO número renderizado em UI tem `className="tnum"` ou está dentro de `.metric-value` / `.num-cell`
- [ ] **18.** Substituir TODOS os spinners por `<Shimmer>` ou skeleton
- [ ] **19.** Adicionar `<StatusDot live>` em pontos estratégicos:
  - Topbar (status de save)
  - Header do card "Última Campanha" (quando recente)
  - Linha de produtos ativos no Portfolio

### Verificação final
- [ ] **20.** `npm run build` — zero erros
- [ ] **21.** `npm run dev` — verificar visualmente:
  - Tipografia carregou (Inter Tight + JetBrains Mono visíveis)
  - Sparklines renderizam com pulse
  - Cmd+K abre Command Palette
  - Numbers têm count-up animation
  - Sidebar tem acent rail luminoso (cyan-400) no item ativo
  - Toasts aparecem no canto inferior direito

---

## 🎯 Critério de "Pronto"

Não está pronto até o app passar nos seguintes testes:

1. ✅ **Teste do trader:** uma pessoa familiarizada com Bloomberg/Tradingview olha 3 segundos e diz "isso é uma ferramenta de profissional".
2. ✅ **Teste de tipografia:** TODO número em telas de dados está em `JetBrains Mono` com `tabular-nums`.
3. ✅ **Teste de motion:** clicar em um card colapsável tem animação suave (220ms ease-out), não snap.
4. ✅ **Teste de cor:** o app tem **um único** accent vibrante (cyan), não 3 cores brigando.
5. ✅ **Teste do "live":** existe pelo menos UM dot pulsante visível em qualquer tela ativa.
6. ✅ **Teste do hero:** o saudação em TodayPanel usa Instrument Serif italic em ~44px.
7. ✅ **Teste do command:** Cmd+K abre uma palette utilizável com pelo menos 6 comandos.

---

## 🚫 NÃO fazer

- ❌ Adicionar emoji em UI (já removemos)
- ❌ Usar `text-blue-600` em lugar nenhum (todo accent é via CSS var `--accent`)
- ❌ Adicionar mais shadows pesados (Bloomberg = flat + borders)
- ❌ Mudar a estrutura de dados (`Product`, `Campaign`, `OperationalCosts` ficam intocados)
- ❌ Reescrever componentes que não estão na lista (Setup, Mapping internals etc)
- ❌ Adicionar bibliotecas novas (já temos framer-motion, lucide, recharts)

---

**Fim do plano.** Sonnet executa de cima pra baixo. Skips só com justificativa.

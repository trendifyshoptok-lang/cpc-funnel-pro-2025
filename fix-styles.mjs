/**
 * fix-styles.mjs — Clean Pro style migration (v2)
 * Run: node fix-styles.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const cwd = process.cwd();

// Per-file config: which transforms to apply
// gray: gray-N → slate-N | shadow: remove shadow-sm/shadow-md | radius: fix rounded+shadow combos | heading: text-lg font-bold → text-sm font-bold
const TARGETS = [
  { file: 'src/App.tsx',                                        gray: true },
  { file: 'src/hooks/useKeyboardShortcuts.tsx',                 gray: true },
  { file: 'src/components/Setup/CostsSection.tsx',              gray: true, shadow: true, radius: true },
  { file: 'src/components/Setup/index.tsx',                     radius: true },
  { file: 'src/components/Setup/AdsSection.tsx',                shadow: true },
  { file: 'src/components/Setup/Tabs/Estrategia.tsx',           heading: true },
  { file: 'src/components/Setup/Tabs/Simulador.tsx',            radius: true },
  { file: 'src/components/Analysis/parts/ActionPlan.tsx',       shadow: true },
  { file: 'src/components/Analysis/parts/CampaignInputs.tsx',   shadow: true },
  { file: 'src/components/Analysis/parts/CPCGauge.tsx',         shadow: true },
  { file: 'src/components/Analysis/parts/FunnelHorizontal.tsx', shadow: true },
  { file: 'src/components/Manual.tsx',                          shadow: true },
  { file: 'src/components/Mapping.tsx',                         shadow: true },
  { file: 'src/components/Onboarding.tsx',                      heading: true },
  { file: 'src/components/Portfolio/ParetoModal.tsx',           heading: true },
  { file: 'src/components/Portfolio/PortfolioOptimizer.tsx',    shadow: true },
  { file: 'src/components/Portfolio/ProductCard.tsx',           shadow: true },
  { file: 'src/components/ScaleSimulator.tsx',                  shadow: true },
  { file: 'src/components/ui/KPITile.tsx',                      heading: true },
];

const GRAY_SHADES = [50,100,200,300,400,500,600,700,800,900,950];

function applyFixes(c, opts) {
  if (opts.gray) {
    for (const n of GRAY_SHADES) c = c.split(`gray-${n}`).join(`slate-${n}`);
  }
  if (opts.radius) {
    // rounded-xl/lg + shadow variant → cleaner class
    c = c.replace(/rounded-xl\s+shadow-(?:sm|md|lg|xl)/g, 'rounded-2xl');
    c = c.replace(/rounded-xl\s+shadow(?![_\-\w])/g, 'rounded-2xl');
    c = c.replace(/rounded-lg\s+shadow-(?:sm|md|lg|xl)/g, 'rounded-xl');
  }
  if (opts.shadow) {
    c = c.replace(/\bshadow-sm\b/g, '');
    c = c.replace(/\bshadow-md\b/g, '');
    // Clean up double spaces / trailing spaces in className strings
    c = c.replace(/className="([^"]+)"/g, (_m, cls) =>
      `className="${cls.replace(/\s+/g, ' ').trim()}"`
    );
    c = c.replace(/className=\{`([^`]+)`\}/g, (_m, cls) =>
      `className={\`${cls.replace(/\s+/g, ' ').trim()}\`}`
    );
  }
  if (opts.heading) {
    c = c.replace(/\btext-lg\s+font-bold\b/g, 'text-sm font-bold');
    c = c.replace(/\btext-xl\s+font-bold\b/g, 'text-base font-bold');
  }
  return c;
}

let changed = 0;
for (const t of TARGETS) {
  const fullPath = join(cwd, t.file);
  let content;
  try { content = readFileSync(fullPath, 'utf8'); }
  catch { console.log(`  SKIP (not found): ${t.file}`); continue; }

  const fixed = applyFixes(content, t);
  if (fixed !== content) {
    writeFileSync(fullPath, fixed, 'utf8');
    changed++;
    console.log(`  ✓ ${t.file}`);
  } else {
    console.log(`  — ${t.file} (no changes)`);
  }
}
console.log(`\nfix-styles: ${changed} file(s) updated.`);

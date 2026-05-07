import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const MOJIBAKE_PATTERNS = [
  'Ã£', 'Ã¡', 'Ã ', 'Ã¢', 'Ã©', 'Ãª', 'Ã­', 'Ã³', 'Ã´', 'Ãµ', 'Ãº', 'Ã§',
  'Ã‡', 'Ã‰', 'Ã"', 'Ã•', 'Ãš', 'Ã¼', 'Ã¶',
  'â€"', 'â€™', 'â€˜', 'â€œ', 'Â·', 'â€¦',
];

const escaped = MOJIBAKE_PATTERNS.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const RE = new RegExp(escaped.join('|'), 'g');

const results = [];

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) {
      if (f === 'node_modules' || f === 'dist' || f === '.git') continue;
      walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      const content = readFileSync(p, 'utf8');
      const matches = content.match(RE);
      if (matches) {
        const rel = p.replace(process.cwd() + '\\', '');
        results.push({ file: rel, count: matches.length, unique: [...new Set(matches)] });
      }
    }
  }
}

walk(join(process.cwd(), 'src'));

if (results.length === 0) {
  console.log('Nenhum mojibake encontrado — tudo limpo!');
} else {
  console.log(`${results.length} arquivo(s) com encoding corrompido:\n`);
  for (const r of results) {
    console.log(`  ${r.file} — ${r.count} ocorrência(s): ${r.unique.join(' ')}`);
  }
}

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const patterns = {
  'gray-':           /\bgray-\d+/g,
  'shadow-sm':       /\bshadow-sm\b/g,
  'shadow-md':       /\bshadow-md\b/g,
  'text-lg font-bold': /text-lg font-bold/g,
  'rounded-xl shadow': /rounded-xl shadow/g,
};

const results = [];

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) {
      if (f === 'node_modules' || f === 'dist' || f === '.git' || f === 'mobile') continue;
      walk(p);
    } else if (p.endsWith('.tsx')) {
      const content = readFileSync(p, 'utf8');
      const found = [];
      for (const [name, re] of Object.entries(patterns)) {
        const m = content.match(re);
        if (m) found.push(`${name}(${m.length})`);
      }
      if (found.length) {
        results.push({ file: p.replace(process.cwd() + '\\', ''), issues: found });
      }
    }
  }
}

walk(join(process.cwd(), 'src'));

if (results.length === 0) {
  console.log('Tudo limpo!');
} else {
  for (const r of results) {
    console.log(`${r.file}: ${r.issues.join(', ')}`);
  }
}
console.log('\nSCAN DONE');

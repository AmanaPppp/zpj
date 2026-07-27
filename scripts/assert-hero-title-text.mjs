import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const heroSource = fs.readFileSync(path.join(root, 'src/sections/Hero.tsx'), 'utf8');

const failures = [];

if (!heroSource.includes("const titleText = 'AMANAP-PORTFOLIO';")) {
  failures.push('Hero title text must be AMANAP-PORTFOLIO.');
}

if (heroSource.includes("const titleText = 'AmanaP-Portfolio';")) {
  failures.push('Hero title text must not use mixed-case AmanaP-Portfolio.');
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Hero title text checks passed.');

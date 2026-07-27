import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cssSource = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');
const fontPath = path.join(root, 'src/assets/fonts/Astral-Delight-Black-Upright-1.ttf');

const failures = [];

if (!fs.existsSync(fontPath)) {
  failures.push('Astral Delight Black Upright font file must exist in src/assets/fonts.');
}

if (!cssSource.includes("font-family: 'Astral Delight Black Upright'")) {
  failures.push('index.css must declare the Astral Delight Black Upright font family.');
}

if (!cssSource.includes("src: url('./assets/fonts/Astral-Delight-Black-Upright-1.ttf') format('truetype')")) {
  failures.push('index.css must load Astral-Delight-Black-Upright-1.ttf from src/assets/fonts.');
}

if (!/\.space-hero-heading\s*{[\s\S]*font-family:\s*'Astral Delight Black Upright'/.test(cssSource)) {
  failures.push('The main hero title must use Astral Delight Black Upright.');
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Hero title font checks passed.');

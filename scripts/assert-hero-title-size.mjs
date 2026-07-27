import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cssSource = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');

const failures = [];

if (!/\.cinematic-title-lockup\s*{[\s\S]*bottom:\s*clamp\(13rem,\s*26vh,\s*18rem\);/.test(cssSource)) {
  failures.push('Hero title lockup bottom position must remain unchanged.');
}

if (!/\.space-hero-heading\s*{[\s\S]*font-size:\s*clamp\(4\.4rem,\s*9\.4vw,\s*11\.6rem\);/.test(cssSource)) {
  failures.push('Hero title font size must be reduced to clamp(4.4rem, 9.4vw, 11.6rem).');
}

if (/\.space-hero-heading\s*{[\s\S]*font-size:\s*clamp\(5rem,\s*11\.2vw,\s*13\.8rem\);/.test(cssSource)) {
  failures.push('Hero title must not use the previous oversized font size.');
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Hero title size checks passed.');

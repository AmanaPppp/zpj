import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const heroSource = fs.readFileSync(path.join(root, 'src/sections/Hero.tsx'), 'utf8');

const failures = [];

if (heroSource.includes('Brand Design Portfolio')) {
  failures.push('Hero must not render the Brand Design Portfolio label.');
}

if (heroSource.includes('\\u54c1\\u724c\\u8bbe\\u8ba1\\u4f5c\\u54c1\\u96c6') || heroSource.includes('品牌设计作品集')) {
  failures.push('Hero must not render the Chinese portfolio label.');
}

if (heroSource.includes('space-hero-subtitle')) {
  failures.push('Hero subtitle container should be removed with the deleted text.');
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Hero subtitle removal checks passed.');

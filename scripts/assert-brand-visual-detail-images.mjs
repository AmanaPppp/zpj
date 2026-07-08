import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const source = readFileSync(resolve(process.cwd(), 'src/sections/ProjectsSection.tsx'), 'utf8');
const brandVisualMatch = source.match(
  /detailId:\s*['"]brand-visual['"],\s*detailImages:\s*\[([\s\S]*?)\],/,
);

assert.ok(brandVisualMatch, 'Brand visual gallery item should exist.');

const detailImageImports = brandVisualMatch[1]
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

assert.equal(
  detailImageImports.length,
  15,
  'Brand visual detail should use the original 15 ECHO brand visual images.',
);

assert.doesNotMatch(
  brandVisualMatch[1],
  /title|subtitle|heading/i,
  'Brand visual detail images should only contain image imports, not extra title text.',
);

assert.ok(
  detailImageImports.every((image) => /^brandVisual\d+$/.test(image)),
  'Brand visual detail should use brandVisual imports, not infinite canvas uploads.',
);

assert.doesNotMatch(
  brandVisualMatch[1],
  /poster-wall-uploaded|infinite-canvas-uploaded/,
  'Brand visual detail must not reference infinite canvas upload directories.',
);

console.log('Brand visual detail image checks passed.');

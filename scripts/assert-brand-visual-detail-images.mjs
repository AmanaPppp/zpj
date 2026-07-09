import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
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

const brandVisual05Path = resolve(process.cwd(), 'src/assets/project-detail-optimized/brand-visual/5.webp');
const brandVisual05Buffer = readFileSync(brandVisual05Path);
const brandVisual05Hash = createHash('sha256').update(brandVisual05Buffer).digest('hex').toUpperCase();

assert.equal(
  brandVisual05Hash,
  '05C49275114621FFADAC09C42140EFCDC1A27A8BF8AD86A3E3ED385909F1B267',
  'Brand visual detail image 5 should match the uploaded replacement compressed as WebP.',
);

assert.ok(
  statSync(brandVisual05Path).size < 450_000,
  'Brand visual detail image 5 should stay compressed like the other optimized detail images.',
);

console.log('Brand visual detail image checks passed.');

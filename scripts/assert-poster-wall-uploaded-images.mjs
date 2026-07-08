import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const source = readFileSync(resolve(process.cwd(), 'src/components/InfiniteFluidPosterWall.tsx'), 'utf8');
const imageMatches = Array.from(source.matchAll(/image:\s*['"]([^'"]+)['"]/g), (match) => match[1]);

assert.equal(imageMatches.length, 35, 'Poster wall should use all 35 uploaded images.');
assert.ok(
  imageMatches.every((image) => image.startsWith('/infinite-canvas-uploaded/')),
  'Poster wall images should all come from /infinite-canvas-uploaded/.',
);
assert.doesNotMatch(source, /image:\s*['"]\/hero\//, 'Poster wall should not use old hero images.');
assert.doesNotMatch(source, /image:\s*['"]\/logo-gallery/, 'Poster wall should not use old logo gallery images.');

console.log('Poster wall uploaded image checks passed.');

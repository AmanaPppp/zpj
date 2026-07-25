import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'src/components/InfiniteFluidPosterWall.tsx'), 'utf8');
const posterBlock = source.match(/const posters: Poster\[] = \[([\s\S]*?)\n\];/);

assert.ok(posterBlock, 'Infinite poster wall posters array should exist.');

const dates = Array.from(
  posterBlock[1].matchAll(/createPoster\([^)]*?,\s*['"](\d{4}\.\d{2})['"]/g),
  (match) => match[1],
);

assert.ok(dates.length > 0, 'Infinite poster wall posters should include dates.');
assert.deepEqual(
  dates.filter((date) => !/^20(?:25|26)\.(?:0[1-9]|1[0-2])$/.test(date)),
  [],
  'Infinite poster wall dates should stay within 2025.01 through 2026.12 using YYYY.MM format.',
);

console.log('Poster wall date range checks passed.');

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(resolve(root, 'src/components/InfiniteFluidPosterWall.tsx'), 'utf8');

assert.doesNotMatch(
  source,
  /data-ratio=/,
  'Poster wall cards should render at one unified rectangle size, not per-card aspect ratios',
);

assert.match(
  source,
  /const\s+slotWidth\s*=/,
  'Poster wall should define a fixed slot width for every card',
);

assert.match(
  source,
  /const\s+slotHeight\s*=/,
  'Poster wall should define a fixed slot height for every card',
);

assert.match(
  source,
  /const\s+posterTiles\s*=\s*Array\.from\(\{\s*length:\s*160\s*\}/,
  'Poster wall should render enough repeated tiles to cover the drag-scaled viewport',
);

assert.match(
  source,
  /const\s+safeColumns\s*=\s*2/,
  'Poster wall should reserve horizontal safety columns for infinite wrapping',
);

assert.match(
  source,
  /const\s+safeRows\s*=\s*2/,
  'Poster wall should reserve vertical safety rows for infinite wrapping',
);

assert.match(
  source,
  /Math\.ceil\(viewportWidth \/ stepX\) \+ safeColumns \* 2 \+ 1/,
  'Poster wall should size columns from the viewport instead of hard-coding five columns',
);

assert.match(
  source,
  /roundUpToMultiple\(neededColumns,\s*columnOffsets\.length\)/,
  'Poster wall columns should align with the stagger pattern before wrapping',
);

assert.match(
  source,
  /Math\.floor\(cards\.length \/ columns\)/,
  'Poster wall should wrap only complete rows, not a partial final row',
);

assert.match(
  source,
  /wrapCoordinate\(layout\.baseX \+ offsetX,\s*wrapMinX,\s*wrapMinX \+ worldWidth\)/,
  'Horizontal wrapping should use a safety-padded grid period',
);

assert.match(
  source,
  /wrapCoordinate\(layout\.baseY \+ offsetY,\s*wrapMinY,\s*wrapMinY \+ worldHeight\)/,
  'Vertical wrapping should use a safety-padded grid period',
);

assert.match(
  source,
  /card\.style\.width = `\$\{slotWidth\}px`;/,
  'Every poster card should receive the same width',
);

assert.match(
  source,
  /card\.style\.height = `\$\{slotHeight\}px`;/,
  'Every poster card should receive the same height',
);

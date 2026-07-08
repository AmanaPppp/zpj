import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
const match = css.match(/\.subpage-cosmic-bg::after\s*\{\s*\n\s*z-index:\s*0;([\s\S]*?)\n\}/);

assert.ok(match, 'Subpage dotted background layer should exist.');

const block = match[1];

assert.match(
  block,
  /rgba\(255,\s*0,\s*74,\s*0\.92\)/,
  'Subpage dotted background should use the brighter red-pink dot color.',
);
assert.match(
  block,
  /background-size:\s*48px 48px,\s*96px 96px;/,
  'Subpage dotted background should use a tighter dot spacing like the reference.',
);
assert.match(
  block,
  /transparent 1\.15px/,
  'Subpage dots should be smaller and sharper than the previous star field.',
);

console.log('Subpage dotted background checks passed.');

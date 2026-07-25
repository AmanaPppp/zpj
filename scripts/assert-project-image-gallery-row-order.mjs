import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

const desktopGalleryRule = css.match(/\.project-image-page-gallery\s*\{([\s\S]*?)\n\}/);

assert.ok(desktopGalleryRule, 'Project image page gallery CSS rule should exist.');
assert.match(
  desktopGalleryRule[1],
  /display:\s*grid;/,
  'Project image page gallery should use grid for responsive masonry columns.',
);
assert.doesNotMatch(
  desktopGalleryRule[1],
  /column-count:/,
  'Project image page gallery should not use CSS columns because they order items top to bottom.',
);
assert.match(
  css,
  /\.project-image-page-column\s*\{[\s\S]*?display:\s*grid;/,
  'Project image page gallery should have column containers so images can fill the shortest column.',
);

console.log('Project image page gallery row-order checks passed.');

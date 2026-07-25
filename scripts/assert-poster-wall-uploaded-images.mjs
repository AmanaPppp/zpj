import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const source = readFileSync(resolve(process.cwd(), 'src/components/InfiniteFluidPosterWall.tsx'), 'utf8');
const posters = Array.from(
  source.matchAll(/createPoster\([^,]+,\s*[^,]+,\s*['"]([^'"]+)['"][^)]*\)/g),
  (match) => ({
    sourceFile: match[1],
    preserveExtension: /,\s*true\s*\)$/.test(match[0]),
  }),
);
const uploadedPosters = posters.filter((poster) => /^uploaded-\d+\.(?:png|jpe?g)$/i.test(poster.sourceFile));
const imageMatches = uploadedPosters.map((poster) => (
  poster.preserveExtension ? poster.sourceFile : poster.sourceFile.replace(/\.(?:png|jpe?g)$/i, '.webp')
));

assert.equal(uploadedPosters.length, 48, 'Poster wall should use all 48 uploaded images.');
assert.ok(
  imageMatches.every((image) => image.endsWith('.webp')),
  'Poster wall primary images should use optimized WebP assets.',
);
assert.match(source, /OPTIMIZED_POSTER_ROOT = '\/infinite-canvas-optimized'/);
assert.match(source, /preloadPosterWallImages/);
assert.doesNotMatch(source, /SOURCE_POSTER_ROOT/);
assert.doesNotMatch(source, /fallbackImage/);
assert.doesNotMatch(source, /image:\s*['"]\/infinite-canvas-uploaded\//);
assert.doesNotMatch(source, /image:\s*['"]\/hero\//, 'Poster wall should not use old hero images.');
assert.doesNotMatch(source, /image:\s*['"]\/logo-gallery/, 'Poster wall should not use old logo gallery images.');

for (const image of imageMatches) {
  const optimizedPath = resolve(process.cwd(), 'public/infinite-canvas-optimized', image);
  assert.ok(existsSync(optimizedPath), `${image} should exist in public/infinite-canvas-optimized.`);
  assert.ok(statSync(optimizedPath).size < 650_000, `${image} should stay below 650KB.`);
}

for (const { sourceFile } of uploadedPosters) {
  const sourcePath = resolve(process.cwd(), 'source-images/infinite-canvas-uploaded', sourceFile);
  assert.ok(existsSync(sourcePath), `${sourceFile} should be preserved under source-images.`);
}

console.log('Poster wall uploaded image checks passed.');

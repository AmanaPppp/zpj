import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const projectsSource = readFileSync(resolve(root, 'src/sections/ProjectsSection.tsx'), 'utf8');
const webglImageSource = readFileSync(resolve(root, 'src/components/ProjectWebGLImage.tsx'), 'utf8');

assert.doesNotMatch(
  projectsSource,
  /projectGalleryItems\.flatMap\(\(item\)\s*=>\s*\[item\.image,\s*\.{3}item\.detailImages\]\)/,
  'Startup preload must not include every nested detail image; large touchpoint images should load on demand.',
);

assert.match(
  projectsSource,
  /projectGalleryItems\.map\(\(item\)\s*=>\s*item\.image\)/,
  'Startup preload should be limited to project gallery cover images.',
);

assert.match(
  webglImageSource,
  /img\.loading\s*=\s*['"]lazy['"]/,
  'Fullscreen detail gallery images should lazy-load instead of decoding all large images on click.',
);

assert.match(
  webglImageSource,
  /img\.setAttribute\(['"]fetchpriority['"],\s*['"]low['"]\)/,
  'Fullscreen detail gallery images should use low fetch priority so the click transition stays responsive.',
);

assert.match(
  webglImageSource,
  /fallbackImage\.loading\s*=\s*['"]eager['"]/,
  'The clicked hero fallback image should remain eager for an immediate transition image.',
);

console.log('Project detail on-demand loading checks passed.');

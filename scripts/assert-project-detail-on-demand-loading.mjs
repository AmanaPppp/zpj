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
  /projectGalleryItems\.map\(\(item\)\s*=>\s*item\.previewImage\)/,
  'Startup preload should be limited to lightweight project gallery preview images.',
);

assert.match(
  projectsSource,
  /export\s+function\s+preloadInitialProjectDetailImages\(\)\s*:\s*Promise<unknown>/,
  'ProjectsSection should expose a sheet-time preloader for the first detail images.',
);

assert.match(
  projectsSource,
  /detailImages\.slice\(0,\s*PROJECT_DETAIL_INITIAL_PRELOAD_COUNT\)/,
  'Sheet-time preload should warm only the first few detail images for each project.',
);

assert.match(
  projectsSource,
  /preloadInitialProjectDetailImages\(\)\.catch\(\(\)\s*=>\s*undefined\)/,
  'Opening the project sheet should start warming first detail images in the background.',
);

assert.match(
  webglImageSource,
  /const\s+DETAIL_IMAGE_EAGER_COUNT\s*=\s*3/,
  'Fullscreen detail pages should eagerly load the first three images.',
);

assert.match(
  webglImageSource,
  /index\s*<\s*DETAIL_IMAGE_EAGER_COUNT/,
  'Fullscreen detail gallery should decide image priority by index.',
);

assert.match(
  webglImageSource,
  /img\.loading\s*=\s*isPriorityImage\s*\?\s*['"]eager['"]\s*:\s*['"]lazy['"]/,
  'Priority detail images should load eagerly while later images stay lazy.',
);

assert.match(
  webglImageSource,
  /img\.setAttribute\(['"]fetchpriority['"],\s*isPriorityImage\s*\?\s*['"]high['"]\s*:\s*['"]low['"]\)/,
  'Priority detail images should use high fetch priority while later images stay low priority.',
);

assert.match(
  webglImageSource,
  /preloadDetailImages\(detailImages\)/,
  'Clicking a project detail card should start warming its full detail image set immediately.',
);

assert.match(
  webglImageSource,
  /fallbackImage\.loading\s*=\s*['"]eager['"]/,
  'The clicked hero fallback image should remain eager for an immediate transition image.',
);

console.log('Project detail on-demand loading checks passed.');

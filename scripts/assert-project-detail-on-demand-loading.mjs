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
  'Startup preload should use only the four optimized gallery cover images, not nested detail images.',
);

assert.match(
  projectsSource,
  /<ProjectWebGLImage[\s\S]*?src=\{item\.image\}/,
  'Interactive project cards should render the same optimized cover image used for pointer interaction.',
);

assert.doesNotMatch(
  projectsSource,
  /export\s+function\s+preloadAllProjectDetailImages\(\)\s*:\s*Promise<unknown>/,
  'ProjectsSection must not expose a sheet-time preloader for every nested detail image.',
);

assert.doesNotMatch(
  projectsSource,
  /projectGalleryItems\.flatMap\(\(item\)\s*=>\s*item\.detailImages\)/,
  'Opening the sheet must not gather every nested detail image into one preload batch.',
);

assert.doesNotMatch(
  projectsSource,
  /preloadAllProjectDetailImages\(\)\.catch\(\(\)\s*=>\s*undefined\)/,
  'Opening the project sheet must not start downloading every detail image in the background.',
);

assert.match(
  webglImageSource,
  /const\s+DETAIL_IMAGE_EAGER_COUNT\s*=\s*4/,
  'Fullscreen detail pages should eagerly load the first four images.',
);

assert.match(
  webglImageSource,
  /const\s+DETAIL_IMAGE_INITIAL_MOUNT_COUNT\s*=\s*6/,
  'Fullscreen detail should mount the first six image nodes immediately.',
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
  /preloadDetailImages\(detailImages,\s*DETAIL_IMAGE_EAGER_COUNT\)/,
  'Clicking a project detail card should warm only the first priority detail images before the transition.',
);

assert.doesNotMatch(
  webglImageSource,
  /const\s+activateThumbnailHover[\s\S]*?preloadDetailImages\(detailImages\)/,
  'Hover liquid interaction must not start downloading every detail image.',
);

assert.match(
  webglImageSource,
  /createTextureFromImage\(transitionImage\)/,
  'Fullscreen transition should reuse the already visible preview image instead of waiting for a new texture request.',
);

assert.match(
  webglImageSource,
  /const\s+chunkSize\s*=\s*startIndex\s*===\s*0\s*\?\s*DETAIL_IMAGE_INITIAL_MOUNT_COUNT\s*:\s*2/,
  'Fullscreen detail should mount more initial image nodes immediately so cold-cache downloads start during the transition.',
);

assert.match(
  webglImageSource,
  /document\.body\.appendChild\(overlay\);\s*scrollPage\.focus\(\{ preventScroll: true \}\);\s*mountDetailImages\?\.\(\)/,
  'Fullscreen detail should mount its first image nodes immediately so cold-cache downloads start during the transition.',
);

assert.doesNotMatch(
  webglImageSource,
  /onComplete:\s*\(\)\s*=>\s*\{\s*overlay\.classList\.add\('is-settled'\);\s*mountDetailImages\?\.\(\)/,
  'Fullscreen detail must not wait for the transition animation to finish before mounting image nodes.',
);

assert.match(
  webglImageSource,
  /fallbackImage\.loading\s*=\s*['"]eager['"]/,
  'The clicked hero fallback image should remain eager for an immediate transition image.',
);

console.log('Project detail on-demand loading checks passed.');

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectsSource = readFileSync(resolve(root, 'src/sections/ProjectsSection.tsx'), 'utf8');
const webglImageSource = readFileSync(resolve(root, 'src/components/ProjectWebGLImage.tsx'), 'utf8');

assert.match(
  projectsSource,
  /const\s+\[projectSheetReady,\s*setProjectSheetReady\]/,
  'Project details should track when the shell animation has settled',
);

assert.match(
  projectsSource,
  /projectSheetReady\s*&&\s*\(\s*<DottedSurface/,
  'The WebGL dotted background should mount after the shell animation, not on the click frame',
);

assert.match(
  projectsSource,
  /scaleX:\s*startRect\s*\?\s*startRect\.width\s*\/\s*Math\.max\(window\.innerWidth,\s*1\)\s*:\s*1/,
  'Opening animation should start from the clicked card using transform scaleX, not layout width',
);

assert.match(
  projectsSource,
  /scaleY:\s*startRect\s*\?\s*startRect\.height\s*\/\s*Math\.max\(window\.innerHeight,\s*1\)\s*:\s*1/,
  'Opening animation should start from the clicked card using transform scaleY, not layout height',
);

assert.doesNotMatch(
  projectsSource,
  /gsap\.to\(modalRef\.current,\s*\{[\s\S]*?\b(?:height|width|left|top):\s*window\./,
  'Project shell opening animation should avoid layout properties that trigger reflow every frame',
);

assert.match(
  projectsSource,
  /deferWebGLMs=\{\s*projectSheetReady\s*\?\s*index\s*\*\s*\d+\s*:\s*\d+\s*\}/,
  'Project gallery WebGL effects should be staggered after the sheet settles',
);

assert.match(
  webglImageSource,
  /deferWebGLMs\?:\s*number/,
  'ProjectWebGLImage should accept a WebGL initialization delay',
);

assert.match(
  webglImageSource,
  /window\.setTimeout\(\s*\(\)\s*=>\s*\{\s*setupRenderer\(\)/,
  'ProjectWebGLImage should defer renderer creation instead of doing it synchronously on mount',
);

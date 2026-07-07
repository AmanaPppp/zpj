import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectsSource = readFileSync(resolve(root, 'src/sections/ProjectsSection.tsx'), 'utf8');
const introSource = readFileSync(resolve(root, 'src/components/IntroGate.tsx'), 'utf8');
const webglImageSource = readFileSync(resolve(root, 'src/components/ProjectWebGLImage.tsx'), 'utf8');

assert.match(
  projectsSource,
  /export\s+const\s+projectDetailPreloadImages\s*=\s*Array\.from\(\s*new\s+Set\(/,
  'ProjectsSection should export a deduped list of project cover images to preload',
);

assert.doesNotMatch(
  projectsSource,
  /projectGalleryItems\.flatMap\(\(item\)\s*=>\s*\[item\.image,\s*\.{3}item\.detailImages\]\)/,
  'Preload list must not include every nested detail image because large touchpoint assets make clicks janky',
);

assert.match(
  projectsSource,
  /projectGalleryItems\.map\(\(item\)\s*=>\s*item\.image\)/,
  'Preload list should include only gallery cover images',
);

assert.match(
  projectsSource,
  /export\s+function\s+preloadProjectDetailImages\(\)\s*:\s*Promise<unknown>/,
  'ProjectsSection should expose a startup preloader for project detail images',
);

assert.match(
  projectsSource,
  /new\s+Image\(\)/,
  'Project cover preloader should create Image objects so cover downloads start before the detail sheet opens',
);

assert.match(
  introSource,
  /import\s+\{\s*preloadProjectDetailImages\s*\}\s+from\s+['"]\.\.\/sections\/ProjectsSection['"]/,
  'IntroGate should import the project detail image preloader',
);

assert.match(
  introSource,
  /preloadProjectDetailImages\(\)/,
  'IntroGate should start preloading project detail images while the entrance overlay is visible',
);

assert.match(
  introSource,
  /!introAnimationDone\s*\|\|\s*!projectImagesReady/,
  'IntroGate should wait for both the entrance animation and lightweight project cover images before enabling entry',
);

assert.match(
  webglImageSource,
  /img\.loading\s*=\s*['"]lazy['"]/,
  'Fullscreen project detail images should be lazy-loaded after the user clicks in',
);

assert.match(
  webglImageSource,
  /fallbackImage\.loading\s*=\s*['"]eager['"]/,
  'Fullscreen hero fallback image should stay eager so the transition image appears immediately',
);

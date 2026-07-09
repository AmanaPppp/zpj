import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const projectsSource = readFileSync(resolve(root, 'src/sections/ProjectsSection.tsx'), 'utf8');
const webglImageSource = readFileSync(resolve(root, 'src/components/ProjectWebGLImage.tsx'), 'utf8');
const stylesSource = readFileSync(resolve(root, 'src/index.css'), 'utf8');
const setupRendererBody = webglImageSource.match(
  /const setupRenderer = \(\) => \{([\s\S]*?)\n    \};\n\n    const handlePointerMove/,
)?.[1] ?? '';

const previewFiles = [
  'brand-detail-01-preview.jpg',
  'brand-detail-02-preview.jpg',
  'brand-detail-03-preview.jpg',
  'pawsitivity-brand-proposal-preview.jpg',
];

for (const file of previewFiles) {
  const path = resolve(root, 'src/assets/project-detail/previews', file);
  assert.ok(existsSync(path), `${file} should exist as a lightweight gallery preview`);
  assert.ok(statSync(path).size < 450_000, `${file} should stay below 450KB`);
}

assert.match(
  projectsSource,
  /previewImage:\s*brandDetail03Preview/,
  'The touchpoint gallery card should have a lightweight preview image.',
);

assert.match(
  projectsSource,
  /new\s+Set\(projectGalleryItems\.map\(\(item\)\s*=>\s*item\.previewImage\)\)/,
  'Startup preload should use lightweight previews, not original large cover images.',
);

assert.match(
  projectsSource,
  /src=\{item\.previewImage\}/,
  'Project gallery thumbnails should render lightweight previews.',
);

assert.doesNotMatch(
  projectsSource,
  /deferWebGLMs=\{projectSheetReady\s*\?\s*index\s*\*\s*140\s*:\s*1200\}/,
  'Project gallery hover WebGL should not be delayed after the sheet opens.',
);

assert.doesNotMatch(
  projectsSource,
  /src=\{item\.image\}/,
  'Project gallery thumbnails must not render original large cover images.',
);

assert.match(
  webglImageSource,
  /const\s+imageRef\s*=\s*useRef<HTMLImageElement>\(null\)/,
  'Thumbnail WebGL should keep a ref to the already visible preview image.',
);

assert.match(
  webglImageSource,
  /createTextureFromImage\(image\)/,
  'Thumbnail WebGL should reuse the visible preview image as its texture.',
);

assert.doesNotMatch(
  setupRendererBody,
  /createTexture\(/,
  'Thumbnail WebGL should not start a second TextureLoader request for the same preview image.',
);

assert.match(
  stylesSource,
  /\.project-webgl-image:not\(\.is-webgl-ready\):hover img/,
  'Project gallery cards should have an immediate CSS hover fallback before WebGL is ready.',
);

assert.match(
  webglImageSource,
  /const\s+startThumbnailAnimation\s*=/,
  'Thumbnail WebGL should start rendering only when needed.',
);

assert.match(
  webglImageSource,
  /const\s+stopThumbnailAnimation\s*=/,
  'Thumbnail WebGL should stop rendering after hover settles.',
);

assert.doesNotMatch(
  webglImageSource,
  /animate\(0\);\s*\n\s*};\s*\n\s*const handlePointerMove/,
  'Thumbnail WebGL should not start a permanent render loop during setup.',
);

console.log('Project gallery preview performance checks passed.');

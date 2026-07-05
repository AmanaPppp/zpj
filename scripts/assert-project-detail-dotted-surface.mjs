import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sectionSource = readFileSync(resolve(root, 'src/sections/ProjectsSection.tsx'), 'utf8');
const cssSource = readFileSync(resolve(root, 'src/index.css'), 'utf8');
const componentPath = resolve(root, 'src/components/ui/dotted-surface.tsx');

assert.equal(existsSync(componentPath), true, 'Project detail should have a DottedSurface component');

const componentSource = readFileSync(componentPath, 'utf8');

assert.match(
  sectionSource,
  /import\s+\{\s*DottedSurface\s*\}\s+from\s+['"]@\/components\/ui\/dotted-surface['"]/,
  'ProjectsSection should import the dotted surface component',
);

assert.match(
  sectionSource,
  /<DottedSurface\s+className="project-detail-dotted-surface"\s*\/>/,
  'Project detail sheet should render the dotted wave background',
);

assert.match(
  componentSource,
  /import\s+\*\s+as\s+THREE\s+from\s+['"]three['"]/,
  'DottedSurface should use Three.js for the wave particle field',
);

assert.match(
  componentSource,
  /new\s+THREE\.Color\('#0b0b0f'\)/,
  'DottedSurface particles should be black',
);

assert.match(
  componentSource,
  /ResizeObserver/,
  'DottedSurface should size itself from its container instead of window dimensions',
);

assert.match(
  componentSource,
  /const\s+waveSpeed\s*=\s*0\.025;/,
  'DottedSurface should use a slower wave speed for calm motion',
);

assert.match(
  cssSource,
  /\.project-floating-card\s*\{[^}]*background:\s*#fff;/,
  'Project detail sheet should use a white background',
);

assert.match(
  cssSource,
  /\.project-detail-dotted-surface\s*\{[^}]*z-index:\s*0;/,
  'The dotted surface should sit behind the detail content',
);

assert.match(
  cssSource,
  /\.project-detail-dotted-surface\s*\{[^}]*position:\s*fixed;/,
  'The dotted surface should stay fixed while project detail content scrolls',
);

assert.match(
  cssSource,
  /\.project-sheet-scroll\s*\{[^}]*overflow-y:\s*auto;/,
  'Project detail content should scroll in its own content container',
);

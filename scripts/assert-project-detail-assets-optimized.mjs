import { readFileSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const maxImageBytes = 1_700_000;
const maxTotalBytes = 30_000_000;
const projectsSourcePath = resolve(root, 'src/sections/ProjectsSection.tsx');
const projectsSource = readFileSync(projectsSourcePath, 'utf8');

const importedAssetPaths = Array.from(
  projectsSource.matchAll(/from\s+['"](@\/assets\/[^'"]+\.(?:jpe?g|png|webp))['"]/g),
  (match) => match[1],
);

const projectDetailImports = importedAssetPaths.filter((path) =>
  path.startsWith('@/assets/project-detail'),
);

const unoptimizedRuntimeImports = projectDetailImports.filter((path) => {
  if (path.includes('/previews/')) return false;
  if (path.endsWith('/cursor-ama-mark.png')) return false;
  return !path.startsWith('@/assets/project-detail-optimized/');
});

assert.deepEqual(
  unoptimizedRuntimeImports,
  [],
  'Project detail runtime imports should use optimized assets, with original assets reserved for source files only.',
);

const importedImageFiles = projectDetailImports
  .map((path) => resolve(root, path.replace('@/', 'src/')))
  .filter((path) => imageExtensions.has(extname(path).toLowerCase()));

const oversized = importedImageFiles
  .map((path) => ({ path, size: statSync(path).size }))
  .filter(({ path, size }) => {
    if (path.includes(`${dirname(resolve(root, 'src/assets/project-detail/previews/x'))}`)) {
      return size > 450_000;
    }
    if (path.endsWith('cursor-ama-mark.png')) return size > 120_000;
    return size > maxImageBytes;
  });

const totalBytes = importedImageFiles.reduce((sum, path) => sum + statSync(path).size, 0);

assert.deepEqual(
  oversized,
  [],
  `Project detail runtime images should stay below ${Math.round(maxImageBytes / 1_000_000)}MB each.`,
);

assert.ok(
  totalBytes <= maxTotalBytes,
  `Project detail runtime images should total below ${Math.round(maxTotalBytes / 1_000_000)}MB; got ${Math.round(totalBytes / 1_000_000)}MB.`,
);

console.log('Project detail asset optimization checks passed.');

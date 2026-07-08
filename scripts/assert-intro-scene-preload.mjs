import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const scenePath = path.join(root, 'src', 'components', 'Scene3D.tsx');
const floatingPath = path.join(root, 'src', 'components', 'FloatingGeometries.tsx');
const introPath = path.join(root, 'src', 'components', 'IntroGate.tsx');

const sceneSource = fs.readFileSync(scenePath, 'utf8');
const floatingSource = fs.readFileSync(floatingPath, 'utf8');
const introSource = fs.readFileSync(introPath, 'utf8');

if (!/import\s+FloatingGeometries\s+from\s+['"]\.\/FloatingGeometries['"]/.test(sceneSource)) {
  throw new Error('Scene3D should mount FloatingGeometries during the intro so asteroid assets preload before entry.');
}

if (/DeferredFloatingGeometries/.test(sceneSource)) {
  throw new Error('Scene3D should not defer asteroid loading until after the portfolio entrance.');
}

if (!/onReady=\{\(\)\s*=>\s*\{/s.test(sceneSource) || !/window\.dispatchEvent\(new CustomEvent\(['"]portfolio-scene-ready['"]\)\)/.test(sceneSource)) {
  throw new Error('Scene3D should notify the intro gate when asteroid scene assets are ready.');
}

if (!/onReady\?:\s*\(\)\s*=>\s*void/.test(floatingSource)) {
  throw new Error('FloatingGeometries should expose an onReady callback.');
}

if (!/onReady\?\.\(\)/.test(floatingSource)) {
  throw new Error('FloatingGeometries should call onReady after models are loaded.');
}

if (!/useLoader\(THREE\.TextureLoader,\s*ASTEROID_TEXTURE_URLS\)/.test(floatingSource)) {
  throw new Error('FloatingGeometries should preload asteroid textures before reporting ready.');
}

if (!/portfolio-scene-ready/.test(introSource)) {
  throw new Error('IntroGate should wait for the scene-ready event before auto-entering.');
}

if (!/sceneReady/.test(introSource)) {
  throw new Error('IntroGate should track scene readiness separately from animation readiness.');
}

console.log('Intro scene preload checks passed.');

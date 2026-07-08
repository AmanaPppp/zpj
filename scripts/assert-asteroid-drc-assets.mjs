import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const floatingPath = path.join(root, 'src', 'components', 'FloatingGeometries.tsx');
const modelRoot = path.join(root, 'public', 'models', 'asteroids-pbr');
const sourceModelRoot = path.join(root, 'source-models', 'asteroids-pbr');
const dracoRoot = path.join(root, 'public', 'draco');
const asteroidIds = [1, 4, 8];

const source = fs.readFileSync(floatingPath, 'utf8');

if (!/DRACOLoader/.test(source)) {
  throw new Error('FloatingGeometries should use DRACOLoader for compressed asteroid models.');
}

if (/OBJLoader/.test(source)) {
  throw new Error('FloatingGeometries should no longer import or use OBJLoader for asteroids.');
}

if (!/model\.drc/.test(source)) {
  throw new Error('FloatingGeometries should load model.drc asteroid assets.');
}

if (!/setDecoderPath\(['"]\/draco\/['"]\)/.test(source)) {
  throw new Error('DRACOLoader should read decoder files from public /draco/.');
}

for (const id of asteroidIds) {
  const objPath = path.join(sourceModelRoot, `asteroid${id}`, 'model.obj');
  const drcPath = path.join(modelRoot, `asteroid${id}`, 'model.drc');

  if (!fs.existsSync(drcPath)) {
    throw new Error(`Missing compressed model: ${path.relative(root, drcPath)}`);
  }

  const objSize = fs.statSync(objPath).size;
  const drcSize = fs.statSync(drcPath).size;
  if (drcSize >= objSize * 0.1) {
    throw new Error(`Compressed asteroid${id} DRC is too large: ${drcSize} bytes vs ${objSize} byte OBJ.`);
  }
}

const publicModelFiles = fs
  .readdirSync(modelRoot, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name);

if (publicModelFiles.some((name) => name.endsWith('.obj') || name.endsWith('.glb'))) {
  throw new Error('Public asteroid models should only ship compressed DRC geometry, not OBJ or unused GLB files.');
}

for (const file of ['draco_decoder.wasm', 'draco_wasm_wrapper.js']) {
  const decoderPath = path.join(dracoRoot, file);
  if (!fs.existsSync(decoderPath)) {
    throw new Error(`Missing Draco decoder file: ${path.relative(root, decoderPath)}`);
  }
}

console.log('Asteroid DRC asset checks passed.');

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const source = join('node_modules', '@dimforge', 'rapier3d-compat', 'rapier_wasm3d_bg.wasm');
const target = join('dist', 'assets', 'rapier_wasm3d_bg.wasm');

if (existsSync(source)) {
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}

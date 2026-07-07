import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const source = readFileSync(join(root, 'src/components/ProjectWebGLImage.tsx'), 'utf8');
const styles = readFileSync(join(root, 'src/index.css'), 'utf8');

const checks = [
  {
    label: 'checks WebGL texture size against renderer capabilities',
    pass: /capabilities\.maxTextureSize/.test(source) && /canUseTextureInRenderer/.test(source),
  },
  {
    label: 'marks thumbnail canvas ready only after a usable texture loads',
    pass: /root\.classList\.add\('is-webgl-ready'\)/.test(source),
  },
  {
    label: 'marks thumbnail WebGL unavailable on failure',
    pass: /root\.classList\.add\('is-webgl-unavailable'\)/.test(source),
  },
  {
    label: 'keeps thumbnail canvas hidden until WebGL is ready',
    pass: /\.project-webgl-image canvas[\s\S]*?opacity:\s*0/.test(styles)
      && /\.project-webgl-image\.is-webgl-ready canvas[\s\S]*?opacity:\s*1/.test(styles),
  },
  {
    label: 'keeps fullscreen fallback visible unless transition WebGL is ready',
    pass: /\.project-image-transition-fallback[\s\S]*?opacity:\s*1/.test(styles)
      && /\.project-image-transition\.is-webgl-ready \.project-image-transition-fallback[\s\S]*?opacity:\s*0/.test(styles),
  },
];

const failures = checks.filter((check) => !check.pass);

if (failures.length > 0) {
  console.error('Project WebGL fallback regression checks failed:');
  for (const failure of failures) {
    console.error(`- ${failure.label}`);
  }
  process.exit(1);
}

console.log('Project WebGL fallback regression checks passed.');

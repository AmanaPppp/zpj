import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(resolve(root, 'src/sections/SkillsSection.tsx'), 'utf8');

assert.match(
  source,
  /const\s+portalContentRef\s*=\s*useRef<HTMLDivElement>\(null\)/,
  'SkillsSection should keep the fullscreen poster content on a separate ref',
);

assert.match(
  source,
  /className="work-portal-content"/,
  'The poster wall should be wrapped in a dedicated work-portal-content layer',
);

assert.match(
  source,
  /gsap\.set\(portalContent,\s*\{[\s\S]*autoAlpha:\s*0[\s\S]*\}\);/,
  'Opening should hide the poster wall while the overlay scales up from the Start button',
);

assert.match(
  source,
  /\.set\(portalOverlay,\s*\{[\s\S]*width:\s*'100vw'[\s\S]*height:\s*'100dvh'[\s\S]*\}\)[\s\S]*\.to\(portalContent,\s*\{[\s\S]*autoAlpha:\s*1/,
  'Opening should reveal the poster wall only after the overlay has reached fullscreen size',
);

assert.match(
  source,
  /\.to\(portalContent,\s*\{[\s\S]*autoAlpha:\s*0[\s\S]*\}\)[\s\S]*\.to\(\s*portalOverlay,\s*\{[\s\S]*scale:\s*1/,
  'Closing should fade the poster wall before shrinking the overlay back to the Start button',
);

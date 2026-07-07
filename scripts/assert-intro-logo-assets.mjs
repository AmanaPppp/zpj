import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const css = readFileSync(resolve(root, 'src/index.css'), 'utf8');
const intro = readFileSync(resolve(root, 'src/components/IntroGate.tsx'), 'utf8');
const posterWall = readFileSync(resolve(root, 'src/components/InfiniteFluidPosterWall.tsx'), 'utf8');

const failures = [];

if (/\.intro-gate-logo::before/.test(css)) {
  failures.push('Intro logo still defines an outer circle pseudo-element.');
}

if (/\.poster-wall-brand::before/.test(css)) {
  failures.push('Poster wall logo still defines an outer circle pseudo-element.');
}

for (const file of ['public/personal-logo-hover.webm', 'public/personal-logo-hover-poster.png']) {
  const fullPath = resolve(root, file);
  if (!existsSync(fullPath)) {
    failures.push(`${file} is missing.`);
    continue;
  }

  if (statSync(fullPath).size <= 0) {
    failures.push(`${file} is empty.`);
  }
}

if (!intro.includes('src="/personal-logo-hover.webm"')) {
  failures.push('Intro gate is not using the animated logo video.');
}

if (!posterWall.includes('src="/personal-logo-hover.webm"')) {
  failures.push('Poster wall brand is not using the animated logo video.');
}

if (intro.includes('poster="/personal-logo-static.png"') || posterWall.includes('poster="/personal-logo-static.png"')) {
  failures.push('Logo video elements still use the static logo as their poster.');
}

if (posterWall.includes('poster-wall-brand-static')) {
  failures.push('Poster wall brand still renders the static logo image.');
}

const enterStart = intro.indexOf('const enter = () => {');
const introMountAnimation = enterStart >= 0 ? intro.slice(0, enterStart) : intro;
const enterAnimation = enterStart >= 0 ? intro.slice(enterStart) : '';

if (/gsap\.set\(logo,[\s\S]*filter:\s*'blur\(/.test(introMountAnimation)) {
  failures.push('Intro logo initial mount should not use a blur fade-in.');
}

if (!/gsap\.set\(logo,\s*\{\s*autoAlpha:\s*0,\s*scale:\s*1\.8/.test(introMountAnimation)) {
  failures.push('Intro logo should start large, near the camera, at scale 1.8.');
}

if (!/tl\.to\(logo,\s*\{[\s\S]*scale:\s*1[\s\S]*duration:\s*1\.18[\s\S]*ease:\s*'expo\.out'/.test(introMountAnimation)) {
  failures.push('Intro logo should ease from large back to its normal scale.');
}

if (/\.set\(\s*logo,\s*\{[\s\S]*scale:\s*2\.1/.test(enterAnimation) || /\.to\(\s*logo,\s*\{[\s\S]*scale:\s*0\.58/.test(enterAnimation)) {
  failures.push('Enter transition should not run the logo large-to-small animation.');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Intro logo assets look correct.');

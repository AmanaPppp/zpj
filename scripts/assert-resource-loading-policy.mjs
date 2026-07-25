import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const failures = [];

const introGate = read('src/components/IntroGate.tsx');
if (introGate.includes('preloadProjectDetailImages')) {
  failures.push('IntroGate must not preload project detail images during first entry.');
}

const skillsSection = read('src/sections/SkillsSection.tsx');
if (/useEffect\(\(\)\s*=>\s*{\s*preloadPosterWallImages\(\)/s.test(skillsSection)) {
  failures.push('SkillsSection must not preload the entire poster wall on mount.');
}

const posterWall = read('src/components/InfiniteFluidPosterWall.tsx');
if (posterWall.includes('Promise.all(posterWallImageUrls.map(preloadPosterWallImage))')) {
  failures.push('Poster wall preloading must be capped instead of loading every poster at once.');
}

if (posterWall.includes('loading="eager"')) {
  failures.push('Poster wall tiles must not mark every image as eager.');
}

if (!posterWall.includes('schedulePosterWallImageWarmup')) {
  failures.push('Poster wall must expose a batched warmup helper for post-entry loading.');
}

const app = read('src/App.tsx');
if (!app.includes('portfolio-enter') || !app.includes('schedulePosterWallImageWarmup')) {
  failures.push('App must schedule post-entry resource warmup after the portfolio has opened.');
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Resource loading policy checks passed.');

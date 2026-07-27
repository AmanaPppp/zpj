import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appSource = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');

const failures = [];

if (appSource.includes("import MusicPlayer from './components/MusicPlayer'")) {
  failures.push('App.tsx must not import MusicPlayer.');
}

if (/<MusicPlayer\s*\/>/.test(appSource)) {
  failures.push('App.tsx must not render MusicPlayer.');
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Music player removal checks passed.');

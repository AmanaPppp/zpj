import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const introGateSource = fs.readFileSync(path.join(root, 'src/components/IntroGate.tsx'), 'utf8');

const failures = [];

if (/overlay\.remove\(\)/.test(introGateSource)) {
  failures.push('IntroGate must not manually remove its React-owned overlay node.');
}

if (!introGateSource.includes('setDismissed(true)')) {
  failures.push('IntroGate should dismiss through React state after the exit animation.');
}

if (!/if\s*\(\s*dismissed\s*\)\s*return\s+null;/.test(introGateSource)) {
  failures.push('IntroGate should render null after React state marks it dismissed.');
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('IntroGate React-owned dismissal checks passed.');

import fs from 'node:fs';
import path from 'node:path';

const introPath = path.join(process.cwd(), 'src', 'components', 'IntroGate.tsx');
const introSource = fs.readFileSync(introPath, 'utf8');

if (!/const markReady = \(\) => \{[\s\S]*?if \(disposed \|\| entered \|\| !introAnimationDone \|\| !sceneReady\) return;/.test(introSource)) {
  throw new Error('IntroGate should keep scene readiness as the gate for entering the portfolio.');
}

if (!/onComplete: \(\) => \{[\s\S]*?introAnimationDone = true;[\s\S]*?startIdleTweens\(\);[\s\S]*?markReady\(\);[\s\S]*?\}/.test(introSource)) {
  throw new Error('IntroGate should start ring idle motion as soon as the intro animation finishes.');
}

const markReadyMatch = introSource.match(/const markReady = \(\) => \{([\s\S]*?)\n    \};/);
if (!markReadyMatch) {
  throw new Error('IntroGate markReady block was not found.');
}

if (/startIdleTweens\(\)/.test(markReadyMatch[1])) {
  throw new Error('IntroGate should not wait for sceneReady before starting ring idle motion.');
}

console.log('Intro loading ring motion checks passed.');

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = fs.createWriteStream(path.join(root, 'vite.stdout.log'), { flags: 'a' });
const err = fs.createWriteStream(path.join(root, 'vite.stderr.log'), { flags: 'a' });

out.write(`\nStarting Vite wrapper with ${process.execPath}\n`);

const child = spawn(process.execPath, [
  'node_modules/vite/bin/vite.js',
  '--config',
  'vite.sandbox.config.mjs',
  '--configLoader',
  'native',
  '--host',
  '127.0.0.1',
  '--port',
  '3000',
], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

child.stdout.pipe(out);
child.stderr.pipe(err);

child.on('exit', (code, signal) => {
  err.write(`\nVite exited with code ${code ?? 'null'} signal ${signal ?? 'null'}\n`);
});

child.on('error', (error) => {
  err.write(`\nFailed to start Vite: ${error.stack || error.message}\n`);
});

process.stdin.resume();

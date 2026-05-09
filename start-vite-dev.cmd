@echo off
cd /d F:\zpj\app
"C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules\vite\bin\vite.js --config vite.sandbox.config.mjs --configLoader native --host 127.0.0.1 --port 3000 > vite.stdout.log 2> vite.stderr.log

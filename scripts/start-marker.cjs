const fs = require('node:fs');
fs.writeFileSync('start-marker.txt', `started ${new Date().toISOString()}\n`);
setInterval(() => {}, 1000);

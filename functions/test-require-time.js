const fs = require('fs');
const index = fs.readFileSync('./index.js', 'utf8');
const reqRegex = /require\(['"]([^'"]+)['"]\)/g;
let match;
while ((match = reqRegex.exec(index)) !== null) {
  const mod = match[1];
  const start = Date.now();
  try {
    require(mod.startsWith('.') ? mod : mod);
    const time = Date.now() - start;
    if (time > 50) {
      console.log(`Took ${time}ms to require ${mod}`);
    }
  } catch(e) {}
}

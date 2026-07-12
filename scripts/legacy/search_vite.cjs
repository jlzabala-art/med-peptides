const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (let file of list) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  }
  return results;
}

const files = walk('src');
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('import.meta.env')) {
    console.log(f, 'contains import.meta.env');
  }
}

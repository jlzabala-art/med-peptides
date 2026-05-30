const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;
walk(path.join(__dirname, '../src'), (filePath) => {
  if (filePath.match(/\.(jsx?|tsx?|json|ts)$/)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('atlas-health-app')) {
      const newContent = content.replace(/atlas-health-app(-27a3a)?/g, 'med-peptides-app');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated:', filePath);
      modifiedFiles++;
    }
  }
});
console.log(`Finished replacing. Modified ${modifiedFiles} files.`);

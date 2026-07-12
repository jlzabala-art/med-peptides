const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'functions')
];

const fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else {
      if (fileExtensions.includes(path.extname(fullPath))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content;
        
        // Handle Med-Peptides with case variations
        newContent = newContent.replace(/Med-Peptides/g, 'Atlas Health');
        newContent = newContent.replace(/med-peptides/g, 'atlas-health');
        
        // Also handle the email domains and project URLs if necessary, 
        // e.g. "atlas-health.com" instead of "med-peptides.com"
        // The above replace already changes med-peptides.com to atlas-health.com!

        if (newContent !== content) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log('Updated:', fullPath);
        }
      }
    }
  }
}

targetDirs.forEach(dir => processDir(dir));
console.log('Done.');

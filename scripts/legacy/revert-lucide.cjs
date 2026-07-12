const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let files = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of files) {
    let p = path.join(dir, entry.name);
    if(entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      walkDir(p);
    } else if(entry.isFile() && (p.endsWith('.js') || p.endsWith('.jsx'))) {
      let content = fs.readFileSync(p, 'utf8');
      
      // Match all lines like: import X from 'lucide-react/dist/esm/icons/x';
      // or import X from "lucide-react/dist/esm/icons/x";
      const regex = /import\s+([A-Z][a-zA-Z0-9_]*)\s+from\s+['"]lucide-react\/dist\/esm\/icons\/[a-z0-9-]+['"];?/g;
      
      let matches = [];
      let match;
      while ((match = regex.exec(content)) !== null) {
        matches.push(match[1]);
      }
      
      if (matches.length > 0) {
        // Remove all old lines
        content = content.replace(regex, '');
        
        // Add new grouped import
        const newImport = `import { ${matches.join(', ')} } from 'lucide-react';\n`;
        
        // Insert after the last import or at top
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
          const endOfLine = content.indexOf('\n', lastImportIndex);
          content = content.slice(0, endOfLine + 1) + newImport + content.slice(endOfLine + 1);
        } else {
          content = newImport + content;
        }
        
        // Cleanup multiple blank lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        fs.writeFileSync(p, content, 'utf8');
        console.log(`Reverted ${matches.length} imports in ${p}`);
      }
    }
  }
}

console.log("Starting revert...");
walkDir('./src');
console.log("Revert complete!");

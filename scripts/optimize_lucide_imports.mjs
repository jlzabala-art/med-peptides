import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Convert PascalCase to kebab-case
function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Ensure the directory is correct
const files = glob.sync('src/**/*.{js,jsx}');

let totalModified = 0;

for (const file of files) {
  if (!fs.statSync(file).isFile()) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Regex to match: import { X, Y, Z } from 'lucide-react';
  // Note: handles multiline imports as well
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/g;
  
  let modified = false;
  
  content = content.replace(importRegex, (match, importsStr) => {
    // Split by comma, clean up whitespace
    const icons = importsStr.split(',').map(i => i.trim()).filter(i => i);
    
    // Generate new imports
    const newImports = icons.map(icon => {
      // Handle aliasing if present: e.g. import { X as CloseIcon }
      if (icon.includes(' as ')) {
         const parts = icon.split(' as ').map(p => p.trim());
         const kebabName = toKebabCase(parts[0]);
         return `import ${parts[1]} from 'lucide-react/dist/esm/icons/${kebabName}';`;
      } else {
         const kebabName = toKebabCase(icon);
         return `import ${icon} from 'lucide-react/dist/esm/icons/${kebabName}';`;
      }
    }).join('\n');
    
    modified = true;
    return newImports;
  });
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    totalModified++;
  }
}

console.log(`Optimized lucide imports in ${totalModified} files.`);

const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
      let dirPath = path.join(dir, f);
      try {
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
          walkDir(dirPath);
        } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
          try {
            let content = fs.readFileSync(dirPath, 'utf8');
            let newContent = content.replace(/import\.meta\.env\.VITE_([A-Z0-9_]+)/g, 'process.env.NEXT_PUBLIC_$1');
            
            // Also replace import.meta.env.MODE or DEV if they exist
            newContent = newContent.replace(/import\.meta\.env\.MODE/g, 'process.env.NODE_ENV');
            newContent = newContent.replace(/import\.meta\.env\.DEV/g, '(process.env.NODE_ENV !== "production")');
            newContent = newContent.replace(/import\.meta\.env\.PROD/g, '(process.env.NODE_ENV === "production")');
            
            if (content !== newContent) {
              console.log('Modified:', dirPath);
              fs.writeFileSync(dirPath, newContent);
            }
          } catch(e) {}
        }
      } catch(e) {}
    });
  } catch(e) {}
}

walkDir('./src');
console.log('Done replacing env vars!');

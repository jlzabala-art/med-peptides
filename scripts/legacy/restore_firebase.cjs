const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir('src');
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace imports
    if (content.includes("import * as fb from '")) {
        const match = content.match(/import \* as fb from '([^']+firebase)';/);
        if (match) {
            const firebasePath = match[1];
            // Find assignments
            const assignments = [...content.matchAll(/const\s+([a-zA-Z0-9_]+)\s*=\s*fb\?\.([a-zA-Z0-9_]+);/g)];
            if (assignments.length > 0) {
                const vars = assignments.map(a => a[1] === a[2] ? a[1] : `${a[2]} as ${a[1]}`);
                const newImport = `import { ${vars.join(', ')} } from '${firebasePath}';`;
                content = content.replace(match[0], newImport);
                assignments.forEach(a => {
                    content = content.replace(a[0], "");
                    // Also replace without spaces
                    content = content.replace(new RegExp(`const ${a[1]}=fb\\?\\.${a[2]};`, 'g'), "");
                });
            }
        }
    }
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Restored:", file);
    }
}

const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    const lines = content.split('\n');
    const newLines = [];
    const lucideImports = new Set();
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        if (line.includes("from 'lucide-react/dist/esm/icons/") || line.includes('from "lucide-react/dist/esm/icons/')) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 4 && parts[0] === 'import' && parts[2] === 'from') {
                const iconName = parts[1].replace('{', '').replace('}', '').replace(',', '');
                lucideImports.add(iconName);
                hasChanges = true;
                continue;
            }
        }
        newLines.push(line);
    }
    
    if (hasChanges) {
        let insertIdx = 0;
        for (let i = 0; i < newLines.length; i++) {
            if (newLines[i].startsWith('import ')) {
                insertIdx = i + 1;
            }
        }
        
        const importStr = `import { ${Array.from(lucideImports).join(', ')} } from 'lucide-react';`;
        newLines.splice(insertIdx, 0, importStr);
        
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        console.log(`Updated ${filePath} with ${lucideImports.size} icons`);
    }
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                walk(full);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            console.log("Checking", full);
            processFile(full);
        }
    }
}

console.log("Starting JS replacement script...");
walk('./src');
console.log("Finished!");

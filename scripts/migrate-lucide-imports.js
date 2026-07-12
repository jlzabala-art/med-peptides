#!/usr/bin/env node
/**
 * migrate-lucide-imports.js
 * 
 * Converts barrel lucide-react imports:
 *   import { X, Y } from 'lucide-react'
 * To granular ESM imports (already tree-shakeable):
 *   import X from 'lucide-react/dist/esm/icons/x'
 *   import Y from 'lucide-react/dist/esm/icons/y'
 * 
 * Usage: node migrate-lucide-imports.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Convert PascalCase icon names to kebab-case filenames
function toKebab(name) {
  return name
    .replace(/([A-Z])/g, (m, p1, offset) => (offset > 0 ? '-' : '') + p1.toLowerCase())
    .replace(/^-/, '')
    // Special cases
    .replace('2', '2')
    .toLowerCase();
}

// Find all files with barrel lucide-react imports
const result = execSync(
  `grep -rln "from 'lucide-react'" src/ 2>/dev/null; grep -rln 'from "lucide-react"' src/ 2>/dev/null`,
  { cwd: process.cwd() }
).toString().trim();

const files = [...new Set(result.split('\n').filter(Boolean))];
console.log(`Found ${files.length} files with barrel lucide-react imports\n`);

let totalConverted = 0;
let skipped = 0;

for (const file of files) {
  const absPath = path.resolve(file);
  let content = fs.readFileSync(absPath, 'utf8');
  
  // Match all lucide barrel imports (both single and multi-line)
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;
  let match;
  let changed = false;
  
  while ((match = importRegex.exec(content)) !== null) {
    const full = match[0];
    const iconList = match[1];
    
    // Parse the icon names, handling aliases like "X as CloseIcon"
    const icons = iconList.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const parts = s.split(/\s+as\s+/);
        return {
          original: parts[0].trim(),
          alias: parts[1]?.trim() || null
        };
      });
    
    // Build replacement lines
    const newImports = icons.map(({ original, alias }) => {
      const kebab = toKebab(original);
      const importedName = alias || original;
      if (alias) {
        return `import { default as ${alias} } from 'lucide-react/dist/esm/icons/${kebab}';`;
      }
      return `import ${original} from 'lucide-react/dist/esm/icons/${kebab}';`;
    }).join('\n');
    
    content = content.replace(full, newImports);
    changed = true;
    totalConverted += icons.length;
    console.log(`  ✓ ${file}: converted ${icons.map(i => i.original).join(', ')}`);
  }
  
  if (changed) {
    fs.writeFileSync(absPath, content, 'utf8');
  }
}

console.log(`\n✅ Done: ${totalConverted} icon imports converted across ${files.length} files`);
console.log(`   Skipped: ${skipped}`);

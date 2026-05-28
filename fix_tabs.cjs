const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('Tab.jsx') || fullPath.endsWith('Widget.jsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getFiles('src/components/admin');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix TDZ for async functions
  const tdzRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{/g;
  if (tdzRegex.test(content)) {
    content = content.replace(tdzRegex, (match, name, args) => {
      return `async function ${name}(${args}) {`;
    });
    changed = true;
  }

  // Add Widget indicator if it doesn't exist and the file ends with Tab.jsx
  if (file.endsWith('Tab.jsx') && !content.includes('Widget:')) {
    const componentName = path.basename(file, '.jsx');
    const widgetDiv = `
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: ${componentName} | Props: none
      </div>
    `;
    
    // Attempt to inject right before the final `</div>\n  );\n}` or `</>\n  );\n}`
    const finalDivRegex = /(<\/(?:div|>)>)\s*\n\s*\);\n\s*\}\s*$/;
    if (finalDivRegex.test(content)) {
      content = content.replace(finalDivRegex, (match, closingTag) => {
        return widgetDiv + '\n' + match;
      });
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

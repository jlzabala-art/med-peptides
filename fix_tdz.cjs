const fs = require('fs');
const glob = require('glob');

glob('src/components/admin/**/*.jsx', (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // We want to replace `const fetchX = async () => {` with `async function fetchX() {`
    // but only if it matches `const \w+ = async \([^)]*\) => {` or similar.
    let changed = false;
    content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{/g, (match, name, args) => {
      changed = true;
      return `async function ${name}(${args}) {`;
    });
    
    // Also replace `const fetchX = useCallback(async () => {`
    // Wait, useCallback is fine because it's wrapped, but if it's used before it's assigned, it throws.
    // Actually, `const fetchX = useCallback(async () => {` -> `const fetchX = useCallback(async function() {` doesn't hoist the const.
    // So for useCallback, we'd need a different approach, but most are just `const fetch = async () =>`.
    
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed ${file}`);
    }
  });
});

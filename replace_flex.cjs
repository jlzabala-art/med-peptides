const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".jsx")) {
      results.push(file);
    }
  });
  return results;
}

const files = walk("src/components");
let totalChanged = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;
  
  // We want to find column definitions that look like `render: (x) => ...` and replace `display: 'flex'` with `display: 'inline-flex'`
  // We'll use a regex that matches `render:` followed by anything up to `display: 'flex'` within 150 chars.
  // Since regex in JS doesn't support variable length lookbehind, we'll use string replacement with a replacer function.

  const regex = /(render:\s*\([^)]*\)\s*=>[\s\S]{0,150}?)(display:\s*['"]flex['"])/g;
  
  const newContent = content.replace(regex, (match, p1, p2) => {
    modified = true;
    return p1 + "display: 'inline-flex'";
  });

  if (modified) {
    fs.writeFileSync(file, newContent, "utf8");
    console.log("Updated", file);
    totalChanged++;
  }
});
console.log("Total files changed:", totalChanged);

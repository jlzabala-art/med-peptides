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
let found = false;
files.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  const regex = /render:\s*\([^)]*\)\s*=>[\s\S]{0,100}display:\s*['"]flex['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    console.log("Found in", file);
    console.log(match[0]);
    console.log("---");
    found = true;
  }
});
if (!found) console.log("None found!");

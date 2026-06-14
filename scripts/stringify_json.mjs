import fs from 'fs';

const files = [
  'src/data/v2/catalog.v2.json',
  'src/data/v2/products.v2.json',
  'src/data/protocolBlueprintsV2.json'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    const data = fs.readFileSync(file, 'utf-8');
    // Escape backticks and dollars if any
    const escaped = data.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    const jsContent = `export default JSON.parse(\`${escaped}\`);\n`;
    const newFile = file.replace('.json', '.js');
    fs.writeFileSync(newFile, jsContent, 'utf-8');
    fs.unlinkSync(file); // remove the old json
    console.log(`Converted ${file} to ${newFile}`);
  }
}

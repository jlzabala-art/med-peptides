import fs from 'fs';
import * as parser from '@babel/parser';

function testSection(filePath, startLine, endLine, label) {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  const sectionCode = lines.slice(startLine - 1, endLine).join('\n');
  
  const codeToParse = `const test = () => ( <>\n${sectionCode}\n</> );`;
  
  try {
    parser.parse(codeToParse, {
      sourceType: 'module',
      plugins: ['jsx']
    });
    console.log(`[PASS] ${label} (Lines ${startLine}-${endLine}) is perfectly balanced!`);
    return true;
  } catch (err) {
    console.log(`[FAIL] ${label} (Lines ${startLine}-${endLine}) has error:`, err.message);
    if (err.loc) {
      console.log(`Error line inside block: ${err.loc.line}`);
      console.log(`Error column inside block: ${err.loc.column}`);
    }
    return false;
  }
}

testSection('src/templates/ProductDetail.jsx', 770, 1966, 'pd-info-col complete');

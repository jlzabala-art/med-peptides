import fs from 'fs';
import * as parser from '@babel/parser';

try {
  const code = fs.readFileSync('src/templates/ProductDetail.jsx', 'utf-8');
  console.log('Parsing ProductDetail.jsx...');
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('ProductDetail.jsx is valid JSX!');
} catch (err) {
  console.error('Error parsing ProductDetail.jsx:', err.message);
  if (err.loc) {
    console.error('Location:', err.loc);
    // print surrounding lines
    const lines = fs.readFileSync('src/templates/ProductDetail.jsx', 'utf-8').split('\n');
    const start = Math.max(0, err.loc.line - 5);
    const end = Math.min(lines.length, err.loc.line + 5);
    for (let i = start; i < end; i++) {
      console.error(`${i + 1}: ${lines[i]}`);
    }
  }
}

try {
  const code = fs.readFileSync('src/templates/ProtocolTemplate.jsx', 'utf-8');
  console.log('Parsing ProtocolTemplate.jsx...');
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('ProtocolTemplate.jsx is valid JSX!');
} catch (err) {
  console.error('Error parsing ProtocolTemplate.jsx:', err.message);
  if (err.loc) {
    console.error('Location:', err.loc);
    const lines = fs.readFileSync('src/templates/ProtocolTemplate.jsx', 'utf-8').split('\n');
    const start = Math.max(0, err.loc.line - 5);
    const end = Math.min(lines.length, err.loc.line + 5);
    for (let i = start; i < end; i++) {
      console.error(`${i + 1}: ${lines[i]}`);
    }
  }
}

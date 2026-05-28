const fs = require('fs');

const files = [
  'src/templates/PeptideCollectionPage.jsx',
  'src/templates/SupplementCollectionPage.jsx',
  'src/templates/ProtocolCollectionPage.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import '\.\.\/styles\/peptide_collection\.css';\n?/g, '');
  content = content.replace(/import '\.\.\/styles\/protocol_collection\.css';\n?/g, '');
  content = content.replace(/import '\.\.\/styles\/supplement_collection\.css';\n?/g, '');
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Removed legacy CSS imports');

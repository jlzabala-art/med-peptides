const fs = require('fs');
const original = fs.readFileSync('src/components/wholesaler/CatalogCreatorFlow.jsx', 'utf8');

// We will keep imports and helpers
const importsMatch = original.match(/import[\s\S]*?from[\s\S]*?;\n\n/);
const imports = importsMatch ? importsMatch[0] : '';

// ... let's just write the whole thing because it's easier and cleaner.

import fs from 'fs';
const content = fs.readFileSync('src/components/product/layouts/PeptideDetail.jsx', 'utf8');
if (content.includes('const normalizeSupplier = (raw) => {')) {
  console.log('Injected successfully');
} else {
  console.log('Failed to inject');
}

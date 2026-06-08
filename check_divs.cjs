const fs = require('fs');
const content = fs.readFileSync('src/components/admin/AdminWholesellersTab.jsx', 'utf8');
const detailStart = content.indexOf('function WholesellerDetail');
const detailEnd = content.indexOf('export default function AdminWholesellersTab');
const detail = content.slice(detailStart, detailEnd);
let open = 0;
let tags = [];
const regex = /<\/?div[^>]*>/g;
let match;
while ((match = regex.exec(detail)) !== null) {
  if (match[0].startsWith('</')) open--;
  else if (!match[0].endsWith('/>')) open++;
  tags.push({ tag: match[0], open });
}
console.log('Open divs at end:', open);

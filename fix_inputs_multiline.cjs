const fs = require('fs');

const filesToUpdate = [
  'src/components/admin/AdminAgencyDealsTab.jsx',
  'src/components/admin/AdminCompetitorsTab.jsx',
  'src/components/admin/AdminLeadsTab.jsx',
  'src/pages/Sales/Checkout.jsx',
  'src/pages/Sales/QuotationList.jsx',
  'src/pages/Purchase/POList.jsx'
];

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace <input type="text"... >
  content = content.replace(
    /<input\s+([\s\S]*?)type="(text|number|email|tel)"([\s\S]*?)(?:className="[^"]*")?([\s\S]*?)(?:style=\{\{[\s\S]*?\}\})?([\s\S]*?)\/?>/g,
    '<TextField type="$2" $1 $3 $4 $5 />'
  );
  
  if (content !== original) {
    if (!content.includes('TextField')) {
      content = `import { TextField } from '../ui';\n` + content;
    }
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
  }
});

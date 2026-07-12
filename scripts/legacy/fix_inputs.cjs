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

  // Replace simple text inputs
  content = content.replace(
    /<input\s+type="(text|number|email|tel)"([^>]+)style=\{\{[^\}]+\}\}([^>]*)>/g,
    '<TextField type="$1" $2 $3 />'
  );
  content = content.replace(
    /<input\s+type="(text|number|email|tel)"([^>]+)className="[^"]+"([^>]*)>/g,
    '<TextField type="$1" $2 $3 />'
  );
  // Remove trailing slashes and self-close properly if not already self-closed
  content = content.replace(/<TextField([^>]+?)\s*\/\s*>\s*<\/TextField>/g, '<TextField$1 />');
  
  if (content !== original) {
    if (!content.includes('TextField')) {
      content = `import { TextField } from '../ui';\n` + content;
    }
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
  }
});

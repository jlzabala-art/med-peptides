const fs = require('fs');
const files = [
  'src/components/admin/AdminLeadsTab.jsx',
  'src/pages/Sales/QuotationList.jsx',
  'src/pages/Purchase/POList.jsx',
  'src/templates/Checkout.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Depth for import
  const depth = file.split('/').length - 2;
  const relativePath = depth === 0 ? './components/ui' : '../'.repeat(depth) + 'components/ui';

  const needsTextField = content.includes('<TextField');
  const needsCheckbox = content.includes('<Checkbox');
  const needsSelect = content.includes('<Select');

  let importComponents = [];
  if (needsTextField && !content.includes('TextField')) importComponents.push('TextField');
  if (needsCheckbox && !content.includes('Checkbox')) importComponents.push('Checkbox');
  if (needsSelect && !content.includes('Select')) importComponents.push('Select');

  if (importComponents.length > 0) {
    if (new RegExp(`from\\s+['"]${relativePath}['"]`).test(content)) {
      content = content.replace(
        new RegExp(`(import\\s+\\{[^\\]]+)(\\}\\s+from\\s+['"]${relativePath}['"])`),
        `$1, ${importComponents.join(', ')} $2`
      );
    } else {
      content = content.replace(
        /(import React[^;]*;\n)/,
        `$1import { ${importComponents.join(', ')} } from '${relativePath}';\n`
      );
    }
    fs.writeFileSync(file, content);
    console.log('Fixed imports:', file);
  }
});

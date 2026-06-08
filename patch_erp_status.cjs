const fs = require('fs');
const files = [
  'src/components/shared/ERPActivityTimeline.jsx',
  'src/pages/Purchase/BillList.jsx',
  'src/pages/Purchase/POList.jsx',
  'src/pages/Purchase/RFQList.jsx',
  'src/pages/Sales/QuotationList.jsx',
  'src/pages/Sales/SalesOrderList.jsx',
  'src/components/admin/AdminWholesellersTab.jsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace import
  content = content.replace(/import ERPStatusBadge from '\.\.\/\.\.\/components\/shared\/ERPStatusBadge';/, "import { StatusChip } from '../../components/ui';");
  content = content.replace(/import ERPStatusBadge from '\.\.\/shared\/ERPStatusBadge';/, "import { StatusChip } from '../ui';");
  content = content.replace(/import ERPStatusBadge from '\.\/ERPStatusBadge';/, "import { StatusChip } from '../ui';");

  // Remove duplicate StatusChip import in AdminWholesellersTab if it happened
  content = content.replace(/import \{ Tabs, StatusChip \} from '\.\.\/ui';\nimport \{ StatusChip \} from '\.\.\/ui';/, "import { Tabs, StatusChip } from '../ui';");
  
  // Also fix AdminWholesellersTab.jsx if I previously just imported it without replacing ERPStatusBadge import
  // My previous patch in AdminWholesellersTab was:
  // content = content.replace(/import ERPStatusBadge from '\.\.\/shared\/ERPStatusBadge';/, "import ERPStatusBadge from '../shared/ERPStatusBadge';\nimport { Tabs, StatusChip } from '../ui';");
  // So let's clean that up
  content = content.replace(/import ERPStatusBadge from '\.\.\/shared\/ERPStatusBadge';\nimport \{ Tabs, StatusChip \} from '\.\.\/ui';/, "import { Tabs, StatusChip } from '../ui';");

  // Replace tag
  content = content.replace(/<ERPStatusBadge /g, "<StatusChip ");
  
  fs.writeFileSync(file, content);
  console.log('patched', file);
}

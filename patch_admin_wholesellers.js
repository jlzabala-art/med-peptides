const fs = require('fs');
const file = 'src/components/admin/AdminWholesellersTab.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace SupplierStatusBadge with StatusChip
content = content.replace(/import ERPStatusBadge from '\.\.\/shared\/ERPStatusBadge';/, "import ERPStatusBadge from '../shared/ERPStatusBadge';\nimport { Tabs, StatusChip } from '../ui';");

// Replace <SupplierStatusBadge status={...} /> with <StatusChip status={...} />
content = content.replace(/<SupplierStatusBadge status=\{([^\}]+)\} \/>/g, "<StatusChip status={$1} />");

// Remove SupplierStatusBadge definition
content = content.replace(/\/\/ Helper for status badge[\s\S]+?\}\n\n\/\/ ── Wholeseller Detail/, "// ── Wholeseller Detail");

// Refactor Zoho Style Tabs Menu to use Tabs component
content = content.replace(/\{\/\* Zoho Style Tabs Menu \*\/\}[\s\S]+?\{\/\* Detail Content \(Scrollable\) \*\/\}/, 
`{/* Zoho Style Tabs Menu */}
      <Tabs
        activeTab={detailTab}
        onChange={setDetailTab}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'pos', label: 'Purchase Orders' },
          { id: 'bills', label: 'Bills' },
          { id: 'history', label: 'Sync History' }
        ]}
      />
      {/* Detail Content (Scrollable) */}`);

fs.writeFileSync(file, content);
console.log('patched', file);

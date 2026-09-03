const fs = require('fs');
const path = require('path');

const files = [
  'src/features/products/components/ProductsTable.jsx',
  'src/components/admin/physicians/AdminPhysiciansTab.jsx',
  'src/components/shared/UniversalPatientsTable.jsx',
  'src/components/shared/UniversalPrescriptionsTable.jsx',
  'src/components/admin/suppliers/SupplierTableView.jsx',
];

files.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  console.log(`\n--- Auditing ${file} ---`);
  console.log(`DataTable:`, content.includes('<DataTable') || content.includes('DataTable'));
  console.log(`GlobalSearchBar:`, content.includes('<GlobalSearchBar'));
  console.log(`gcp-table-container:`, content.includes('gcp-table-container'));
  console.log(`table-layout: fixed:`, content.includes('table-layout'));
  console.log(`CopyableId:`, content.includes('<CopyableId'));
  console.log(`StatusBadge / StatusChip:`, content.includes('<StatusBadge') || content.includes('<StatusChip'));
  console.log(`Breadcrumbs:`, content.includes('<Breadcrumb'));
  console.log(`KPIs (MetricCard, etc):`, content.includes('<MetricCard') || content.includes('kpis') || content.includes('Stats'));
  console.log(`EmptyState:`, content.includes('<EmptyState'));
});

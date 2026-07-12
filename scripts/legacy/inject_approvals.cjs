const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/AdminFinanceTab.jsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('AdminApprovalsWidget')) {
  // Add import
  content = content.replace(
    "import PayoutManagerWidget from './gadgets/PayoutManagerWidget';",
    "import PayoutManagerWidget from './gadgets/PayoutManagerWidget';\nimport AdminApprovalsWidget from './gadgets/AdminApprovalsWidget';"
  );

  // Inject widget after KPI grid
  content = content.replace(
    "{/* KPIs Grid */}",
    "<AdminApprovalsWidget />\n\n      {/* KPIs Grid */}"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully injected AdminApprovalsWidget into AdminFinanceTab.jsx');
} else {
  console.log('AdminApprovalsWidget already injected.');
}

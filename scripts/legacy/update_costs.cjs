const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/AdminCostsTab.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const marginColumn = `    {
      key: 'retail_price',
      header: 'Retail Price',
      align: 'right',
      sortValue: (p) => p.price || 0,
      render: (p) => (
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
          \${p.price || 0}
        </span>
      )
    },
    {
      key: 'gross_margin',
      header: 'Gross Margin (%)',
      align: 'center',
      sortValue: (p) => {
        const cost = p.costPrice || 0;
        const price = p.price || 0;
        if (price === 0) return 0;
        return ((price - cost) / price) * 100;
      },
      render: (p) => {
        const cost = p.costPrice || 0;
        const price = p.price || 0;
        if (price === 0) return <span style={{color: 'gray'}}>N/A</span>;
        const margin = ((price - cost) / price) * 100;
        const isLow = margin < 40;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{
              fontWeight: 800,
              color: isLow ? '#ef4444' : '#10b981',
              backgroundColor: isLow ? '#fee2e2' : '#d1fae5',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.8rem'
            }}>
              {margin.toFixed(1)}%
            </span>
            {isLow && <span title="Low Margin Alert (Below 40%)" style={{cursor: 'help'}}>⚠️</span>}
          </div>
        );
      }
    },`;

// Inject before "if (loading)" or just after the calculated_cost column
const targetStr = `    {
      key: 'calculated_cost',`;
if (!content.includes('gross_margin')) {
  content = content.replace(targetStr, marginColumn + "\n" + targetStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully added Gross Margin column to AdminCostsTab.jsx');
} else {
  console.log('Gross Margin already exists in AdminCostsTab.jsx');
}

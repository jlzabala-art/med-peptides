const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/admin/OrdersTab.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add filterSource state
content = content.replace(
  "  const [filterStatus, setFilterStatus] = useState('All');",
  "  const [filterStatus, setFilterStatus] = useState('All');\n  const [filterSource, setFilterSource] = useState('All');"
);

// 2. Add source filtering in `filtered`
content = content.replace(
  "      filterStatus === 'All' || o.status?.toLowerCase() === filterStatus.toLowerCase();",
  "      filterStatus === 'All' || o.status?.toLowerCase() === filterStatus.toLowerCase();\n    const matchesSource = filterSource === 'All' || (o.source && o.source.toLowerCase() === filterSource.toLowerCase());"
);

// 3. Return matchesSource in the filter
content = content.replace(
  "    return matchesStatus && matchesSearch && matchesDate;\n  });",
  "    return matchesStatus && matchesSearch && matchesDate && matchesSource;\n  });"
);

// 4. Update getActiveFilters
content = content.replace(
  "    if (filterStatus && filterStatus !== 'All') {",
  `    if (filterSource && filterSource !== 'All') {
      active.push({ label: 'Source', value: filterSource === 'b2c_home' ? 'B2C (Home)' : 'B2B (Portal)', type: 'sourceFilter' });
    }
    if (filterStatus && filterStatus !== 'All') {`
);

// 5. Update handleFilterRemove
content = content.replace(
  "    if (f.type === 'statusFilter') setFilterStatus('All');",
  "    if (f.type === 'statusFilter') setFilterStatus('All');\n    if (f.type === 'sourceFilter') setFilterSource('All');"
);

// 6. Update renderCustomFilters to add Source dropdown
content = content.replace(
  "    return (\n      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>",
  `    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <select 
          value={filterSource} 
          onChange={(e) => setFilterSource(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
        >
          <option value="All">All Sources</option>
          <option value="b2c_home">B2C (Home)</option>
          <option value="b2b_portal">B2B (Portal)</option>
        </select>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('OrdersTab.jsx patched successfully');

export const exportToCSV = (data, filename, columns) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  let headers = [];
  let rows = [];

  if (columns && columns.length > 0) {
    headers = columns.map(c => c.header);
    rows = data.map(item => {
      return columns.map(c => {
        let val = '';
        try {
          if (typeof c.accessor === 'function') {
            val = c.accessor(item);
          } else if (typeof c.accessor === 'string') {
            val = item[c.accessor];
          }
        } catch (e) {
          console.warn('Error formatting CSV column', c.header, e);
          val = 'Error';
        }
        
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        
        // Escape quotes by doubling them, and wrap field in quotes
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      }).join(',');
    });
  } else {
    // Auto-detect columns from the first object
    headers = Object.keys(data[0]);
    rows = data.map(item => {
      return headers.map(h => {
        let val = item[h];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      }).join(',');
    });
  }

  const csv = headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

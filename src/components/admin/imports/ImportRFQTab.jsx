import React from 'react';
import BaseImportTab from './BaseImportTab';
import { getStatusColor } from './utils';

export default function ImportRFQTab() {
  const handleSave = async (data) => {
    console.log("Saving RFQ...", data);
    // TODO: Connect to Firestore
  };

  const renderDiffTable = ({ parsedData, selectedRows, toggleRow, toggleAll }) => (
    <table className="gcp-table" style={{ width: '100%', fontSize: '0.9rem' }}>
      <thead>
        <tr>
          <th style={{ width: '40px', textAlign: 'center' }}>
            <input type="checkbox" checked={selectedRows.size === parsedData.length} onChange={(e) => toggleAll(e.target.checked)} />
          </th>
          <th>AI Confidence</th>
          <th>Status</th>
          <th>Requested Item</th>
          <th>Qty Requested</th>
          <th>Inventory Stock</th>
          <th>Fulfillment Action</th>
        </tr>
      </thead>
      <tbody>
        {parsedData.map((item, idx) => {
          // Mock Stock Check logic
          const simulatedStock = Math.floor(Math.random() * 200);
          const quantityRequested = parseInt(item.quantity) || 50;
          const needsBackorder = quantityRequested > simulatedStock;
          const status = needsBackorder ? 'MODIFIED' : 'NEW';
          const colors = getStatusColor(status);
          const score = item.confidence_score || 0;
          let confColor = '#10b981'; // Green
          if (score < 50) confColor = '#ef4444'; // Red
          else if (score < 80) confColor = '#f59e0b'; // Yellow
          
          const isChecked = selectedRows.has(idx);

          return (
            <tr key={idx} style={{ backgroundColor: score < 50 && isChecked ? '#fef2f2' : (needsBackorder ? '#fffbeb' : 'transparent'), opacity: isChecked ? 1 : 0.5 }}>
              <td style={{ textAlign: 'center' }}>
                <input type="checkbox" checked={isChecked} onChange={() => toggleRow(idx)} />
              </td>
              <td style={{ fontWeight: 700, color: confColor }}>
                {score}%
              </td>
              <td>
                <span style={{ 
                  backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                }}>
                  {needsBackorder ? 'Backorder' : 'In Stock'}
                </span>
              </td>
              <td>
                <strong>{item.peptide_name}</strong>
                {item.dosage && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dosage}</div>}
              </td>
              <td><strong>{quantityRequested} {item.units || ''}</strong></td>
              <td>
                <span style={{ color: needsBackorder ? '#d97706' : '#10b981', fontWeight: 600 }}>
                  {simulatedStock} units available
                </span>
              </td>
              <td>
                {needsBackorder ? (
                  <span style={{ color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📦 Purchase Order Required (-{quantityRequested - simulatedStock})
                  </span>
                ) : (
                  <span style={{ color: '#10b981' }}>Ready to Dispatch</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <BaseImportTab 
      title="Import Client RFQ (Stock Validator)"
      description="Upload a client's Request for Quote (PDF/Excel). The AI will instantly cross-reference requested quantities against your live inventory."
      context="RFQ"
      renderDiffTable={renderDiffTable}
      onSave={handleSave}
    />
  );
}

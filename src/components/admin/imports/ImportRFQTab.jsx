import React from 'react';
import BaseImportTab from './BaseImportTab';
import { getStatusColor } from './utils';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ImportRFQTab() {
  const handleSave = async (data) => {
    console.log("Saving RFQ...", data);
    try {
      await addDoc(collection(db, 'agency_rfqs'), {
        clientName: 'Magenta Compounding Pharmacy', // Default client name
        supplierName: 'LotusLand', // Default supplier name
        items: data.map(item => ({
          peptide_name: item.peptide_name || 'Unknown Item',
          dosage: item.dosage || '',
          quantity: parseInt(item.quantity, 10) || 1,
          units: item.units || 'vials',
          supplierUnitCost: 0,
          marginPercent: 20,
          clientUnitPrice: 0
        })),
        marginType: 'global',
        globalMargin: 20,
        poAttached: false,
        poFileUrl: null,
        sharedWithSupplier: false,
        status: 'NEW',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error saving RFQ:", err);
      throw new Error("Failed to save RFQ to database: " + err.message);
    }
  };

  const renderDiffTable = ({ parsedData, selectedRows, toggleRow, toggleAll, updateRow }) => (
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
                <input 
                  type="text" 
                  value={item.peptide_name || ''} 
                  onChange={(e) => updateRow(idx, 'peptide_name', e.target.value)}
                  style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', fontWeight: 'bold' }} 
                />
                <div style={{ marginTop: '4px' }}>
                  <input 
                    type="text" 
                    value={item.dosage || ''} 
                    placeholder="Dosage"
                    onChange={(e) => updateRow(idx, 'dosage', e.target.value)}
                    style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }} 
                  />
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input 
                    type="number" 
                    value={item.quantity || ''} 
                    onChange={(e) => updateRow(idx, 'quantity', parseInt(e.target.value, 10))}
                    style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right', fontWeight: 'bold' }} 
                  />
                  <input 
                    type="text" 
                    value={item.units || ''} 
                    placeholder="Units"
                    onChange={(e) => updateRow(idx, 'units', e.target.value)}
                    style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px' }} 
                  />
                </div>
              </td>
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

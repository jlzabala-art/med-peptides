import React from 'react';
import { Checkbox } from '../../../components/ui';
import BaseImportTab from './BaseImportTab';
import { getStatusColor } from './utils';

import * as XLSX from 'xlsx';
import { Download } from '@/lib/icons';
import productRepository from '../../../repositories/productRepository';

export default function ImportCoATab() {
  const handleSave = async (data) => {
    console.log("Saving CoA...", data);
    try {
      await productRepository.importCoAs(data);
      alert('Certificates saved successfully!');
    } catch (error) {
      console.error('Error saving certificates:', error);
      alert('Failed to save certificates.');
    }
  };

  const renderDiffTable = ({ parsedData, selectedRows, toggleRow, toggleAll, updateRow }) => {
    const exportErrors = () => {
      const errors = parsedData.filter(item => parseFloat(item.purity_percentage) < 98);
      const worksheet = XLSX.utils.js_to_sheet(errors);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Quarantined");
      XLSX.writeFile(workbook, "Quarantined_Batches.xlsx");
    };

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={exportErrors} className="gcp-btn gcp-btn--secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '4px 12px' }}>
            <Download size={14} /> Export Quarantined to Excel
          </button>
        </div>
        <div className="gcp-table-container">
        <table className="gcp-table" style={{ width: '100%', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <Checkbox checked={selectedRows.size === parsedData.length} onChange={(e) => toggleAll(e.target.checked)} />
              </th>
              <th>AI Confidence</th>
              <th>Status</th>
              <th>Batch Number</th>
              <th>Product Tested</th>
              <th>Purity %</th>
              <th>Action Required</th>
            </tr>
          </thead>
          <tbody>
            {parsedData.map((item, idx) => {
              const purity = parseFloat(item.purity_percentage);
              const isQuarantined = purity < 98;
              const status = isQuarantined ? 'ALERT' : 'UNCHANGED';
              const colors = getStatusColor(status);
              const score = item.confidence_score || 0;
              let confColor = '#10b981'; // Green
              if (score < 50) confColor = '#ef4444'; // Red
              else if (score < 80) confColor = '#f59e0b'; // Yellow

              const isChecked = selectedRows.has(idx);

              return (
                <tr key={idx} style={{ backgroundColor: score < 50 && isChecked ? '#fef2f2' : (isQuarantined ? '#fef2f2' : 'transparent'), opacity: isChecked ? 1 : 0.5 }}>
                  <td style={{ textAlign: 'center' }}>
                    <Checkbox checked={isChecked} onChange={() => toggleRow(idx)} />
                  </td>
                  <td data-label="AI Confidence" style={{ fontWeight: 700, color: confColor }}>
                    {score}%
                  </td>
                  <td data-label="Status">
                    <span style={{ 
                      backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {colors.label}
                    </span>
                  </td>
                  <td data-label="Batch Number">
                    <input 
                      type="text" 
                      value={item.batch_number || ''} 
                      onChange={(e) => updateRow(idx, 'batch_number', e.target.value)}
                      style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', fontWeight: 'bold' }} 
                    />
                  </td>
                  <td data-label="Product Tested">
                    <input 
                      type="text" 
                      value={item.peptide_name || ''} 
                      onChange={(e) => updateRow(idx, 'peptide_name', e.target.value)}
                      style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px' }} 
                    />
                  </td>
                  <td data-label="Purity %">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        step="0.1"
                        value={item.purity_percentage || ''} 
                        onChange={(e) => updateRow(idx, 'purity_percentage', parseFloat(e.target.value))}
                        style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right', fontWeight: 'bold', color: isQuarantined ? '#ef4444' : '#10b981' }} 
                      />%
                    </div>
                  </td>
                  <td data-label="Action Required">
                    {isQuarantined ? (
                      <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⚠️ Requires Manager Override
                      </span>
                    ) : (
                      <span style={{ color: '#10b981' }}>Clear for Inventory</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    );
  };

  return (
    <BaseImportTab 
      title="Import Certificates (Auto-Quarantine)"
      description="Upload Certificates of Analysis (PDF/Images). The AI will extract purity levels and automatically flag batches under 98% purity for managerial review."
      context="COA"
      renderDiffTable={renderDiffTable}
      onSave={handleSave}
    />
  );
}
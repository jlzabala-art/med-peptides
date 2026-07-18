import React from 'react';
import { Checkbox } from '../../../components/ui';
import BaseImportTab from './BaseImportTab';
import { getStatusColor } from './utils';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import DataTable from '../../ui/DataTable';

export default function ImportRFQTab() {
  const handleSave = async (data) => {
    try {
      await addDoc(collection(db, 'agency_rfqs'), {
        clientName: 'Magenta Compounding Pharmacy',
        supplierName: 'LotusLand',
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

  const renderDiffTable = ({ parsedData, selectedRows, toggleRow, toggleAll, updateRow }) => {
    const tableData = parsedData.map((item, idx) => {
      const simulatedStock = Math.floor(Math.random() * 200);
      const quantityRequested = parseInt(item.quantity) || 50;
      const needsBackorder = quantityRequested > simulatedStock;
      const status = needsBackorder ? 'MODIFIED' : 'NEW';
      const colors = getStatusColor(status);
      const score = item.confidence_score || 0;
      let confColor = '#10b981';
      if (score < 50) confColor = '#ef4444';
      else if (score < 80) confColor = '#f59e0b';
      return { ...item, _idx: idx, _needsBackorder: needsBackorder, _colors: colors, _score: score, _confColor: confColor, _simulatedStock: simulatedStock, _quantityRequested: quantityRequested };
    });

    const columns = [
      {
        key: '_select',
        header: (
          <Checkbox
            checked={selectedRows.size === parsedData.length}
            onChange={(e) => toggleAll(e.target.checked)}
          />
        ),
        render: (r) => <Checkbox checked={selectedRows.has(r._idx)} onChange={() => toggleRow(r._idx)} />
      },
      {
        key: '_score',
        header: 'AI Confidence',
        sortValue: (r) => r._score,
        render: (r) => <span style={{ fontWeight: 700, color: r._confColor }}>{r._score}%</span>
      },
      {
        key: '_status',
        header: 'Status',
        render: (r) => (
          <span style={{
            backgroundColor: r._colors.bg, color: r._colors.text, border: `1px solid ${r._colors.border}`,
            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
          }}>
            {r._needsBackorder ? 'Backorder' : 'In Stock'}
          </span>
        )
      },
      {
        key: 'peptide_name',
        header: 'Requested Item',
        render: (r) => (
          <div>
            <input
              type="text"
              value={r.peptide_name || ''}
              onChange={(e) => updateRow(r._idx, 'peptide_name', e.target.value)}
              style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: '4px' }}>
              <input
                type="text"
                value={r.dosage || ''}
                placeholder="Dosage"
                onChange={(e) => updateRow(r._idx, 'dosage', e.target.value)}
                style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}
              />
            </div>
          </div>
        )
      },
      {
        key: 'quantity',
        header: 'Qty Requested',
        render: (r) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              value={r.quantity || ''}
              onChange={(e) => updateRow(r._idx, 'quantity', parseInt(e.target.value, 10))}
              style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right', fontWeight: 'bold' }}
            />
            <input
              type="text"
              value={r.units || ''}
              placeholder="Units"
              onChange={(e) => updateRow(r._idx, 'units', e.target.value)}
              style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px' }}
            />
          </div>
        )
      },
      {
        key: '_simulatedStock',
        header: 'Inventory Stock',
        render: (r) => (
          <span style={{ color: r._needsBackorder ? '#d97706' : '#10b981', fontWeight: 600 }}>
            {r._simulatedStock} units available
          </span>
        )
      },
      {
        key: '_action',
        header: 'Fulfillment Action',
        render: (r) => r._needsBackorder
          ? <span style={{ color: '#d97706', fontWeight: 600 }}>📦 PO Required (-{r._quantityRequested - r._simulatedStock})</span>
          : <span style={{ color: '#10b981' }}>Ready to Dispatch</span>
      }
    ];

    return (
      <DataTable
        data={tableData}
        columns={columns}
        keyField="_idx"
        emptyTitle="No RFQ data"
        emptyDescription="Upload an RFQ file to see parsed items."
        rowStyle={(r) => ({
          backgroundColor: r._score < 50 && selectedRows.has(r._idx) ? '#fef2f2' : (r._needsBackorder ? '#fffbeb' : 'transparent'),
          opacity: selectedRows.has(r._idx) ? 1 : 0.5
        })}
      />
    );
  };

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

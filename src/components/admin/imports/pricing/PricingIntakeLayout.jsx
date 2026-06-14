import Upload from "lucide-react/dist/esm/icons/upload";
import FileSpreadsheet from "lucide-react/dist/esm/icons/file-spreadsheet";
import Settings from "lucide-react/dist/esm/icons/settings";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import React, { useState } from 'react';




import AIPriceExtractionPanel from './AIPriceExtractionPanel';
import PriceChangeCenter from './PriceChangeCenter';
import SupplierComparisonMode from './SupplierComparisonMode';
import ZohoBooksSyncPanel from './ZohoBooksSyncPanel';
import PricingActionCenter from './PricingActionCenter';

export default function PricingIntakeLayout({ activeImport, onSelect }) {
  if (!activeImport) {
    return (
      <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
        {/* Left: Upload Area */}
        <div style={{ 
          flex: 1, 
          background: '#fff', 
          border: '2px dashed #cbd5e1', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          cursor: 'pointer'
        }}>
          <Upload size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Upload Price Document</h3>
          <p style={{ margin: 0, color: '#64748b', textAlign: 'center' }}>
            Supplier Price List, Invoice, PO, Quotation,<br />Excel Catalog, or PDF.
          </p>
          <button style={{
            marginTop: '24px',
            padding: '10px 20px',
            background: '#0071bd',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }} onClick={() => onSelect({ id: '1', supplier: 'Lotusland' })}>
            Simulate Price Analysis
          </button>
        </div>

        {/* Right: Settings and Rules */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Settings size={18} color="#0f172a" />
              <span style={{ fontWeight: 600 }}>Supplier Settings</span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Configure fallback currency and default margins.</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={18} color="#0f172a" />
              <span style={{ fontWeight: 600 }}>Import Rules</span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Auto-reject increases > 20% and alert on MOQ changes.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', minHeight: '600px' }}>
      {/* Left Column: Source & General Results */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto'
      }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={20} color="#0071bd" />
            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '16px' }}>Lotusland_Prices_2026.xlsx</span>
          </div>
          <button onClick={() => onSelect(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 500 }}>
            Close
          </button>
        </div>

        <AIPriceExtractionPanel />
        <SupplierComparisonMode />
      </div>

      {/* Right Column: Workflow Actions */}
      <div style={{ 
        width: '500px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        overflowY: 'auto',
        paddingRight: '8px'
      }}>
        <PriceChangeCenter />
        <ZohoBooksSyncPanel />
        <PricingActionCenter />
      </div>

    </div>
  );
}
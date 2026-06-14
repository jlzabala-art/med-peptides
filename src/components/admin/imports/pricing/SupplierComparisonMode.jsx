import GitCompare from "lucide-react/dist/esm/icons/git-compare";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import React from 'react';



export default function SupplierComparisonMode() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        background: '#f8fafc'
      }}>
        <GitCompare size={18} color="#0f172a" />
        <span style={{ fontWeight: 600, color: '#0f172a' }}>Supplier Comparison</span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Comparison Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Tirzepatide 15mg</span>
          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, background: '#dcfce7', padding: '4px 8px', borderRadius: '12px' }}>
            Switch saves 5.7%
          </span>
        </div>

        {/* Suppliers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Current: Lotusland</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>$140</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#065f46' }}>Supplier B</span>
              <CheckCircle2 size={14} color="#10b981" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#065f46' }}>$132</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Supplier C</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>$145</span>
          </div>
        </div>

      </div>
    </div>
  );
}
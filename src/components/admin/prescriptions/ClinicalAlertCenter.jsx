import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import React from 'react';


export default function ClinicalAlertCenter() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #fecaca',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #fecaca', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        background: '#fef2f2'
      }}>
        <AlertTriangle size={18} color="#ef4444" />
        <span style={{ fontWeight: 600, color: '#991b1b' }}>Clinical Alerts</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '4px', background: '#ef4444', borderRadius: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>Overlapping Therapies Detected</div>
            <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
              Patient is prescribed two overlapping GLP-1 therapies (Tirzepatide and Semaglutide history). Review recommended.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
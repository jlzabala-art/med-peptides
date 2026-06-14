import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Building from "lucide-react/dist/esm/icons/building";
import Globe from "lucide-react/dist/esm/icons/globe";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import FileText from "lucide-react/dist/esm/icons/file-text";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import React from 'react';







export default function AIPriceExtractionPanel() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#8b5cf6" />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>AI Extraction Results</span>
        </div>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          color: '#8b5cf6', 
          background: '#ede9fe', 
          padding: '4px 8px', 
          borderRadius: '12px' 
        }}>
          98% Confidence
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Building size={16} color="#64748b" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Supplier</div>
              <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>Lotusland</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Globe size={16} color="#64748b" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Region</div>
              <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>China (USD)</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <FileText size={16} color="#64748b" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Document</div>
              <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>Price List</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Calendar size={16} color="#64748b" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Catalog Date</div>
              <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>Oct 2026</div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ marginTop: '8px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>245</span>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Found</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>232</span>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Matched</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>81</span>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Changes</span>
          </div>
        </div>

      </div>
    </div>
  );
}
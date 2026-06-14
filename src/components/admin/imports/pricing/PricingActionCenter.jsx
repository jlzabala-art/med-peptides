import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Calculator from "lucide-react/dist/esm/icons/calculator";
import Search from "lucide-react/dist/esm/icons/search";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React from 'react';







export default function PricingActionCenter() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px'
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ArrowRight size={18} color="#0071bd"/> Workflow Actions
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button style={{
          padding: '10px 16px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          justifyContent: 'flex-start'
        }}>
          <CheckCircle size={16} /> Approve All Price Reductions
        </button>

        <button style={{
          padding: '10px 16px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          justifyContent: 'flex-start'
        }}>
          <XCircle size={16} /> Reject Price Increases {`> 10%`}
        </button>

        <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />

        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 8px 0' }}>AI Assistant</h3>

        <button style={{
          padding: '10px 16px',
          background: '#f8fafc',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}>
          <Search size={16} color="#8b5cf6" /> Find Better Prices in Catalog
        </button>

        <button style={{
          padding: '10px 16px',
          background: '#f8fafc',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}>
          <Calculator size={16} color="#0071bd" /> Recalculate Margins
        </button>

        <button style={{
          padding: '10px 16px',
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}>
          <ShieldAlert size={16} color="#ef4444" /> Review Margin Risks
        </button>
      </div>
    </div>
  );
}
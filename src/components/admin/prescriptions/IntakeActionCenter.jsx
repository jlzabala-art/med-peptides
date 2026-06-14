import FileText from "lucide-react/dist/esm/icons/file-text";
import Calculator from "lucide-react/dist/esm/icons/calculator";
import PackageCheck from "lucide-react/dist/esm/icons/package-check";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Users from "lucide-react/dist/esm/icons/users";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import React from 'react';







export default function IntakeActionCenter() {
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
        <FileText size={18} color="#0f172a" />
        <span style={{ fontWeight: 600, color: '#0f172a' }}>Quick Actions</span>
      </div>
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button style={{
          padding: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          color: '#0f172a',
          fontWeight: 500,
          fontSize: '13px',
          textAlign: 'left'
        }}>
          <Calculator size={16} color="#0071bd" />
          Generate Quote
        </button>
        <button style={{
          padding: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          color: '#0f172a',
          fontWeight: 500,
          fontSize: '13px',
          textAlign: 'left'
        }}>
          <PackageCheck size={16} color="#10b981" />
          Reserve Inventory
        </button>
        <button style={{
          padding: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          color: '#0f172a',
          fontWeight: 500,
          fontSize: '13px',
          textAlign: 'left'
        }}>
          <UserPlus size={16} color="#8b5cf6" />
          Create Protocol
        </button>
        <button style={{
          padding: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          color: '#0f172a',
          fontWeight: 500,
          fontSize: '13px',
          textAlign: 'left'
        }}>
          <Users size={16} color="#f59e0b" />
          Assign Follow-up
        </button>
      </div>
      <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <button style={{
          width: '100%',
          padding: '12px',
          background: '#0071bd',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          Complete Intake <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
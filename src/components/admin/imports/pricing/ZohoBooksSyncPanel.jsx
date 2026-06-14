import Database from "lucide-react/dist/esm/icons/database";
import Link from "lucide-react/dist/esm/icons/link";
import RefreshCcw from "lucide-react/dist/esm/icons/refresh-ccw";
import React from 'react';




export default function ZohoBooksSyncPanel() {
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
        justifyContent: 'space-between',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="#0071bd" />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Zoho Books Sync</span>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link size={12} /> Connected
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>124</div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Products to Update</div>
          </div>
          <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>3</div>
            <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: 500 }}>SKU Conflicts</div>
          </div>
        </div>

        <button style={{
          width: '100%',
          padding: '12px',
          background: '#0071bd',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}>
          <RefreshCcw size={16} /> Sync Approved Prices to Zoho
        </button>
        <button style={{
          width: '100%',
          padding: '12px',
          background: 'transparent',
          color: '#64748b',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Review Conflicts First
        </button>
      </div>
    </div>
  );
}
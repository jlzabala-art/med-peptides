import Database from "lucide-react/dist/esm/icons/database";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import React from 'react';



export default function InvoiceEmptyState() {
  return (
    <div style={{ 
      background: 'white', borderRadius: '12px', border: '1px dashed var(--border)',
      padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', flex: 1
    }}>
      <div style={{ background: 'var(--bg-subtle)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
        <Database size={32} color="var(--color-text-tertiary)" />
      </div>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>No invoices synchronized yet.</h3>
      <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-secondary)', maxWidth: 400, lineHeight: 1.5 }}>
        Atlas Health connects securely to Zoho Books to provide deep financial intelligence. Connect your account to synchronize invoices and view collection risks.
      </p>
      <button 
        style={{
          background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px',
          padding: '0.6rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}
      >
        <Link2 size={16} /> Connect Zoho Books
      </button>
    </div>
  );
}
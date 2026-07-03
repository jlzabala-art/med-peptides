import FilePlus from "lucide-react/dist/esm/icons/file-plus";
import React from 'react';


export default function QuotationEmptyState({ onCreateNew }) {
  return (
    <div style={{ 
      background: 'white', borderRadius: '12px', border: '1px dashed var(--border)',
      padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center'
    }}>
      <div style={{ background: 'var(--bg-subtle)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
        <FilePlus size={32} color="var(--color-text-tertiary)" />
      </div>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>No Quotations Yet</h3>
      <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-secondary)', maxWidth: 400, lineHeight: 1.5 }}>
        Create your first commercial proposal to start tracking your sales pipeline, syncing with Zoho Books, and leveraging Atlas AI pricing.
      </p>
      <button 
        onClick={onCreateNew}
        style={{
          background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px',
          padding: '0.6rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
        }}
      >
        Create First Proposal
      </button>
    </div>
  );
}
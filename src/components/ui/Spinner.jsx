import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import React from 'react';


export default function Spinner({ size = 24, text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
      <Loader2 size={size} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      {text && <span style={{ fontSize: '0.9rem' }}>{text}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
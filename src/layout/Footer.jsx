import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: '1px solid rgba(0, 54, 102, 0.1)',
      background: 'var(--surface, #f8fafc)',
      padding: '1.5rem 2rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Left: Copyright */}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          © {year} ReGen PEPT. All rights reserved.
        </span>

        {/* Center: Research disclaimer */}
        <span style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.72rem', color: 'var(--text-muted)',
          background: 'rgba(0, 54, 102, 0.05)',
          border: '1px solid rgba(0, 54, 102, 0.1)',
          borderRadius: '8px', padding: '0.4rem 0.75rem',
        }}>
          <Lock size={11} strokeWidth={1.5} />
          Research Use Only — Not for human consumption
        </span>

        {/* Right: Legal links */}
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {[['Terms', '/legal'], ['Privacy', '/legal']].map(([label, path]) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500,
                padding: 0, transition: 'color 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
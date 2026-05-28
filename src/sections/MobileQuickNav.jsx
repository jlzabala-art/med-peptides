 
/**
 * MobileQuickNav
 * ─────────────────────────────────────────────────────────────────────────────
 * An OPTIONAL guest home section that wraps the BottomNav component.
 *
 * WHY THIS EXISTS:
 *   BottomNav was previously a fixed-position mobile footer. It's been moved
 *   here so the code effort is preserved and the admin can optionally re-enable
 *   it as an inline section on the guest home. Disabled by default.
 *
 * ONLY VISIBLE on mobile (≤768px) — on desktop it renders nothing.
 */

import BottomNav from '../layout/BottomNav';
import { useNavigate } from 'react-router-dom';

export default function MobileQuickNav({ onOpenSearch, onOpenCart, cartCount = 0 }) {
  const navigate = useNavigate();

  return (
    <section
      className="mobile-quick-nav-section"
      style={{
        display: 'block',
        padding: '1.5rem 1rem',
        background: 'transparent',
      }}
      aria-label="Quick navigation shortcuts"
    >
      {/* Label */}
      <p style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginBottom: '0.75rem',
      }}>
        Quick Navigation
      </p>

      {/* The nav bar, now inline (not fixed) */}
      <BottomNav
        onGoHome={() => navigate('/')}
        onOpenSearch={onOpenSearch}
        onOpenCart={onOpenCart}
        onOpenProducts={() => navigate('/collection')}
        cartCount={cartCount}
      />
    </section>
  );
}

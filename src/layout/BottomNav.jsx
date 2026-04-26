import React, { memo, useCallback, useState } from 'react';
import { Home, ShoppingCart, Beaker, X } from 'lucide-react';

// ─── Styles extracted outside component to avoid re-creation on each render ───
const BOTTOM_NAV_STYLES = `
  /* Floating Island wrapper */
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
    left: 1rem;
    right: 1rem;
    z-index: 1000;
    background: rgba(2, 14, 28, 0.8);
    backdrop-filter: blur(16px) saturate(1.8);
    -webkit-backdrop-filter: blur(16px) saturate(1.8);
    border: 0.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 0.55rem 0.5rem;
    justify-content: space-around;
    align-items: center;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.45),
      0 1px 0 rgba(255,255,255,0.06) inset;
    /* GPU acceleration — avoids blur FPS drop on scroll */
    transform: translateZ(0);
    will-change: transform;
  }

  /* Hide on desktop — mobile-only component */
  @media (min-width: 768px) {
    .mobile-bottom-nav {
      display: none !important;
    }
  }

  /* Nav button */
  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.45);
    cursor: pointer;
    padding: 0.45rem 1.2rem;
    font-size: 0.62rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 600;
    position: relative;
    border-radius: 16px;
    transition: color 0.25s ease;
    /* CSS-driven strokeWidth transition via filter */
    -webkit-font-smoothing: antialiased;
  }

  .bottom-nav-item svg {
    transition: color 0.25s ease;
  }

  .bottom-nav-item.active {
    color: #00d4ff;
  }

  /* Active indicator dot */
  .active-dot {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%) scale(0);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #00d4ff;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .bottom-nav-item.active .active-dot {
    transform: translateX(-50%) scale(1);
  }

  .icon-badge-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bottom-nav-badge {
    position: absolute;
    top: -6px;
    right: -8px;
    background: #00d4ff;
    color: #020e1c;
    border-radius: 50%;
    font-size: 0.6rem;
    font-weight: 800;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  /* Multi-type pill badge */
  .bottom-nav-badge-pill {
    position: absolute;
    top: -8px;
    right: -12px;
    display: flex;
    align-items: center;
    gap: 2px;
    background: rgba(0, 212, 255, 0.15);
    border: 1.5px solid rgba(0, 212, 255, 0.6);
    border-radius: 10px;
    padding: 1px 4px;
    backdrop-filter: blur(8px);
    font-size: 0.55rem;
    font-weight: 800;
    color: #00d4ff;
    white-space: nowrap;
    line-height: 1.3;
    pointer-events: none;
  }

  /* Cart breakdown panel (tap to reveal) */
  .cart-breakdown-panel {
    position: fixed;
    bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
    left: 1rem;
    right: 1rem;
    z-index: 1001;
    background: rgba(2, 14, 28, 0.95);
    backdrop-filter: blur(20px) saturate(2);
    -webkit-backdrop-filter: blur(20px) saturate(2);
    border: 0.5px solid rgba(0, 212, 255, 0.25);
    border-radius: 20px;
    padding: 1rem 1.25rem;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    animation: panel-slide-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes panel-slide-up {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .breakdown-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .breakdown-panel-title {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
  }

  .breakdown-panel-close {
    background: none;
    border: none;
    color: rgba(255,255,255,0.4);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .breakdown-rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .breakdown-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.55rem 0.75rem;
    background: rgba(255,255,255,0.04);
    border-radius: 12px;
    border: 0.5px solid rgba(255,255,255,0.06);
  }

  .breakdown-row-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255,255,255,0.75);
  }

  .breakdown-row-count {
    font-size: 1rem;
    font-weight: 800;
    color: #00d4ff;
  }

  .breakdown-open-btn {
    margin-top: 0.75rem;
    width: 100%;
    padding: 0.6rem;
    background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.08));
    border: 1px solid rgba(0,212,255,0.3);
    border-radius: 12px;
    color: #00d4ff;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s ease;
  }

  .breakdown-open-btn:hover {
    background: linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,212,255,0.12));
  }

  /* Pop animation on tap */
  @keyframes active-pop {
    0%   { transform: scale(1); }
    35%  { transform: scale(0.88); }
    70%  { transform: scale(1.12); }
    100% { transform: scale(1); }
  }

  .bottom-nav-item.popping {
    animation: active-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

// ─── Individual nav button with pop-feedback ──────────────────────────────────
const NavItem = memo(({ label, icon: Icon, active, onClick, badge, breakdown }) => {
  const [popping, setPopping] = useState(false);

  const handleClick = useCallback(() => {
    setPopping(true);
    onClick?.();
  }, [onClick]);

  const handleAnimationEnd = useCallback(() => setPopping(false), []);

  const { protocols = 0, kits = 0, peptides = 0 } = breakdown || {};
  const hasBreakdown = breakdown && (protocols > 0 || kits > 0 || peptides > 0);

  return (
    <button
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      className={`bottom-nav-item${active ? ' active' : ''}${popping ? ' popping' : ''}`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <div className="icon-badge-container">
        <Icon size={22} />
        {badge > 0 && (
          hasBreakdown ? (
            <span className="bottom-nav-badge-pill">
              {protocols > 0 && <span>🧬{protocols}</span>}
              {kits > 0 && <span>📦{kits}</span>}
              {peptides > 0 && <span>🧪{peptides}</span>}
            </span>
          ) : (
            <span className="bottom-nav-badge">{badge}</span>
          )
        )}
      </div>
      <span>{label}</span>
      <span className="active-dot" aria-hidden="true" />
    </button>
  );
});

NavItem.displayName = 'NavItem';

// ─── Cart Breakdown Panel ─────────────────────────────────────────────────────
const CartBreakdownPanel = memo(({ breakdown, onClose, onOpenCart }) => {
  const { protocols = 0, kits = 0, peptides = 0 } = breakdown;
  const rows = [
    { emoji: '🧬', label: 'Protocols', count: protocols },
    { emoji: '📦', label: 'Kits', count: kits },
    { emoji: '🧪', label: 'Peptides', count: peptides },
  ].filter(r => r.count > 0);

  return (
    <div className="cart-breakdown-panel" role="dialog" aria-label="Cart breakdown">
      <div className="breakdown-panel-header">
        <span className="breakdown-panel-title">🛒 Cart Summary</span>
        <button className="breakdown-panel-close" onClick={onClose} aria-label="Close breakdown">
          <X size={16} />
        </button>
      </div>
      <div className="breakdown-rows">
        {rows.map(({ emoji, label, count }) => (
          <div key={label} className="breakdown-row">
            <span className="breakdown-row-label">
              <span>{emoji}</span>
              <span>{label}</span>
            </span>
            <span className="breakdown-row-count">{count}</span>
          </div>
        ))}
      </div>
      <button className="breakdown-open-btn" onClick={() => { onClose(); onOpenCart(); }}>
        View Full Cart →
      </button>
    </div>
  );
});

CartBreakdownPanel.displayName = 'CartBreakdownPanel';

// ─── Main component ──────────────────────────────────────────────────────────
function BottomNav({ onGoHome, onOpenCart, onOpenProducts, cartCount = 0, cartBreakdown = {}, activeTab = 'home' }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleCartTap = useCallback(() => {
    if (cartCount > 0) {
      setShowBreakdown(prev => !prev);
    } else {
      onOpenCart?.();
    }
  }, [cartCount, onOpenCart]);

  const handleCloseBreakdown = useCallback(() => setShowBreakdown(false), []);

  const { protocols = 0, kits = 0, peptides = 0 } = cartBreakdown;
  const hasBreakdown = protocols > 0 || kits > 0 || peptides > 0;

  return (
    <>
      <style>{BOTTOM_NAV_STYLES}</style>

      {/* Breakdown panel — appears above nav on cart tap */}
      {showBreakdown && hasBreakdown && (
        <CartBreakdownPanel
          breakdown={cartBreakdown}
          onClose={handleCloseBreakdown}
          onOpenCart={onOpenCart}
        />
      )}

      <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
        <NavItem
          label="Home"
          icon={Home}
          active={activeTab === 'home'}
          onClick={onGoHome}
        />
        <NavItem
          label="Catalog"
          icon={Beaker}
          active={activeTab === 'products'}
          onClick={onOpenProducts}
        />
        <NavItem
          label="Cart"
          icon={ShoppingCart}
          active={activeTab === 'cart' || showBreakdown}
          onClick={handleCartTap}
          badge={cartCount}
          breakdown={hasBreakdown ? cartBreakdown : null}
        />
      </nav>
    </>
  );
}

// Memoize — re-render when cartCount, cartBreakdown, or activeTab changes
export default memo(BottomNav, (prev, next) =>
  prev.cartCount === next.cartCount &&
  prev.activeTab === next.activeTab &&
  prev.cartBreakdown === next.cartBreakdown
);
import React from 'react';
import { Home, ShoppingCart, Beaker } from 'lucide-react';

/**
 * BottomNav Optimized for ReGen PEPT
 * Includes Safe Area support and Active State logic
 */
export default function BottomNav({
  onGoHome,

  onOpenCart,
  onOpenProducts,
  cartCount,
  activeTab = 'home' // Nueva prop para indicar la sección actual
}) {

  return (
    <nav className="mobile-bottom-nav">
      <button
        onClick={onGoHome}
        className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        aria-label="Go to Home"
      >
        <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span>Home</span>
      </button>

      <button
        onClick={onOpenProducts}
        className={`bottom-nav-item ${activeTab === 'products' ? 'active' : ''}`}
        aria-label="View Products"
      >
        <Beaker size={22} strokeWidth={activeTab === 'products' ? 2.5 : 2} />
        <span>Catalog</span>
      </button>



      <button
        onClick={onOpenCart}
        className={`bottom-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
        style={{ position: 'relative' }}
        aria-label={`Open Cart with ${cartCount} items`}
      >
        <div className="icon-badge-container">
          <ShoppingCart size={22} strokeWidth={activeTab === 'cart' ? 2.5 : 2} />
          {cartCount > 0 && (
            <span className="bottom-nav-badge animate-pop">{cartCount}</span>
          )}
        </div>
        <span>Cart</span>
      </button>
    </nav>
  );
}
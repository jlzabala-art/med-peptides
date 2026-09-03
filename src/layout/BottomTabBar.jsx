"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Grid, ShoppingBag, User } from '@/lib/icons';
import { useCart } from '../context/CartProvider';
import { useUIStore } from '../stores/uiStore';

export default function BottomTabBar() {
  const { cartCount } = useCart();
  const setActiveModal = useUIStore(s => s.setActiveModal);
  const pathname = usePathname();

  // We hide the bottom bar on desktop screens using CSS media queries
  return (
    <nav className="bottom-tab-bar rp-mobile-only glass-panel">
      <Link 
        href="/" 
        className={`tab-item ${pathname === '/' ? 'active' : ''}`}
      >
        <Home size={20} strokeWidth={2.2} />
        <span style={{ fontSize: '0.68rem', fontWeight: 600, marginTop: '2px' }}>Home</span>
      </Link>

      <Link 
        href="/collection/peptides" 
        className={`tab-item ${pathname?.startsWith('/collection') || pathname?.startsWith('/catalog') ? 'active' : ''}`}
      >
        <Grid size={20} strokeWidth={2.2} />
        <span style={{ fontSize: '0.68rem', fontWeight: 600, marginTop: '2px' }}>Explore</span>
      </Link>

      <button 
        className="tab-item"
        onClick={() => setActiveModal('search')}
        aria-label="Search"
      >
        <Search size={20} strokeWidth={2.2} />
        <span style={{ fontSize: '0.68rem', fontWeight: 600, marginTop: '2px' }}>Search</span>
      </button>

      <button 
        className="tab-item cart-tab"
        onClick={() => setActiveModal('cart')}
        aria-label="Orders"
      >
        <div className="cart-icon-wrapper">
          <ShoppingBag size={20} strokeWidth={2.2} />
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, marginTop: '2px' }}>Orders</span>
      </button>

      <Link 
        href="/patient" 
        className={`tab-item ${pathname?.startsWith('/patient') || pathname?.startsWith('/doctor') || pathname?.startsWith('/login') ? 'active' : ''}`}
      >
        <User size={20} strokeWidth={2.2} />
        <span style={{ fontSize: '0.68rem', fontWeight: 600, marginTop: '2px' }}>Account</span>
      </Link>
    </nav>
  );
}

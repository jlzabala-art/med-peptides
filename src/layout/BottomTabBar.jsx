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
        <Home size={22} strokeWidth={2.5} />
        <span>Inicio</span>
      </Link>

      <Link 
        href="/catalog" 
        className={`tab-item ${pathname?.startsWith('/catalog') ? 'active' : ''}`}
      >
        <Grid size={22} strokeWidth={2.5} />
        <span>Catálogo</span>
      </Link>

      <button 
        className="tab-item"
        onClick={() => setActiveModal('search')}
        aria-label="Buscar"
      >
        <Search size={22} strokeWidth={2.5} />
        <span>Buscar</span>
      </button>

      <button 
        className="tab-item cart-tab"
        onClick={() => setActiveModal('cart')}
        aria-label="Carrito"
      >
        <div className="cart-icon-wrapper">
          <ShoppingBag size={22} strokeWidth={2.5} />
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </div>
        <span>Carrito</span>
      </button>

      <Link 
        href="/dashboard" 
        className={`tab-item ${pathname?.startsWith('/dashboard') || pathname?.startsWith('/patient') ? 'active' : ''}`}
      >
        <User size={22} strokeWidth={2.5} />
        <span>Perfil</span>
      </Link>
    </nav>
  );
}

import { NavLink } from 'react-router-dom';
import { Home, Search, Grid, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartProvider';
import { useUIStore } from '../stores/uiStore';

export default function BottomTabBar() {
  const { cartCount } = useCart();
  const setActiveModal = useUIStore(s => s.setActiveModal);

  // We hide the bottom bar on desktop screens using CSS media queries
  return (
    <nav className="bottom-tab-bar rp-mobile-only glass-panel">
      <NavLink 
        to="/" 
        end
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <Home size={22} strokeWidth={2.5} />
        <span>Inicio</span>
      </NavLink>

      <NavLink 
        to="/catalog" 
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <Grid size={22} strokeWidth={2.5} />
        <span>Catálogo</span>
      </NavLink>

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

      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <User size={22} strokeWidth={2.5} />
        <span>Perfil</span>
      </NavLink>
    </nav>
  );
}

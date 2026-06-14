import Home from "lucide-react/dist/esm/icons/home";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Search from "lucide-react/dist/esm/icons/search";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";




import { useLocation } from 'react-router-dom';
import '../styles/bottom-nav.css';

function BottomNav({ onGoHome, onOpenSearch, onOpenCart, onOpenProducts, cartCount = 0 }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isProducts =
    location.pathname.startsWith('/collection') ||
    location.pathname.startsWith('/product');

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {/* Home */}
      <button
        className={`bottom-nav-item ${isHome ? 'bottom-nav-item--active' : ''}`}
        onClick={onGoHome}
        aria-label="Home"
      >
        <span className="bottom-nav-icon">
          <Home size={22} strokeWidth={isHome ? 2.5 : 2} />
        </span>
        <span className="bottom-nav-label">Home</span>
      </button>

      {/* Peptides / Products */}
      <button
        className={`bottom-nav-item ${isProducts ? 'bottom-nav-item--active' : ''}`}
        onClick={onOpenProducts}
        aria-label="Products"
      >
        <span className="bottom-nav-icon">
          <FlaskConical size={22} strokeWidth={isProducts ? 2.5 : 2} />
        </span>
        <span className="bottom-nav-label">Peptides</span>
      </button>

      {/* Search */}
      <button
        className="bottom-nav-item"
        onClick={onOpenSearch}
        aria-label="Search"
      >
        <span className="bottom-nav-icon">
          <Search size={22} strokeWidth={2} />
        </span>
        <span className="bottom-nav-label">Search</span>
      </button>

      {/* Cart */}
      <button
        className="bottom-nav-item bottom-nav-item--cart"
        onClick={onOpenCart}
        aria-label={`Cart (${cartCount} items)`}
      >
        <span className="bottom-nav-icon" style={{ position: 'relative' }}>
          <ShoppingCart size={22} strokeWidth={2} />
          {cartCount > 0 && (
            <span className="bottom-nav-badge">{cartCount > 9 ? '9+' : cartCount}</span>
          )}
        </span>
        <span className="bottom-nav-label">Cart</span>
      </button>
    </nav>
  );
}

export default BottomNav;
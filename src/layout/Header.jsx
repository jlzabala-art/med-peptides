import { Menu, X, ShoppingCart, Search, ChevronDown, LogIn, LogOut, ShieldCheck, MapPin, User, LayoutDashboard, Settings, FlaskConical, HelpCircle, Info, Phone, FileText, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { REGION_FLAGS } from '../data/regions';
import { COUNTRIES } from '../data/countries';
import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { productCategories } from '../data/productConstants';
import { useAuth } from '../context/AuthContext';

import BrandLogo from '../components/common/BrandLogo';

const KNOWLEDGE_ITEMS = ['Calculator', 'FAQ', 'Legal'];
const COMPANY_ITEMS = [
  { label: 'About', path: '/about', icon: <Info size={16} /> },
  { label: 'Contact', path: '/contact', icon: <Phone size={16} /> },
  { label: 'FAQ', path: '/faq', icon: <HelpCircle size={16} /> },
  { label: 'Legal & Privacy', path: '/legal', icon: <FileText size={16} /> }
];
const CATALOG_ITEMS = ['Research Catalog', 'Investigational Pathways', 'Supplies', 'Custom Synthesis'];
const TOP_NAV = [
  { label: 'Home', path: '/' },
  { label: 'Quality', path: '/quality' },
  { label: 'Protocol Builder', path: '/protocol-builder' },
  { label: 'Calculator', path: '/calculator' }
];


export default function Header({ scrolled, cartCount, onOpenCart, onOpenSearch, region, selectedCountryCode, onOpenRegion, onSelectProduct, onSelectCategory, isHome, onGoHome, products }) {
  const isOpaque = scrolled || !isHome;
  const { user, isProfessional, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [objectivesSubOpen, setObjectivesSubOpen] = useState(false);
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [mobileObjectivesOpen, setMobileObjectivesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const companyRef = useRef(null);
  const catalogRef = useRef(null);
  const accountRef = useRef(null);
  const settingsRef = useRef(null);
  
  // Universal Flag & Name Lookup
  const currentCountry = COUNTRIES.find(c => c.code === (selectedCountryCode || region));
  const displayFlag = REGION_FLAGS[selectedCountryCode] || currentCountry?.flag || REGION_FLAGS[region] || '🌐';
  const displayCountryName = currentCountry?.name || (region === 'row' ? 'Global' : (region || 'Global').toUpperCase());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (companyRef.current && !companyRef.current.contains(e.target)) {
        setCompanyOpen(false);
      }
      if (catalogRef.current && !catalogRef.current.contains(e.target)) {
        setCatalogOpen(false);
        setObjectivesSubOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNav = (path) => {
    navigate(path);
    setCompanyOpen(false);
    setCatalogOpen(false);
    setObjectivesSubOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinkStyle = {
    color: isOpaque ? 'var(--text-main)' : 'rgba(255,255,255,0.9)',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
  };

  // Lock/unlock body scroll when mobile menu opens
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      padding: 0,
      transition: 'all 0.3s ease',
      backgroundColor: isOpaque ? 'rgba(255, 255, 255, 0.97)' : 'transparent',
      backdropFilter: isOpaque ? 'blur(12px)' : 'none',
      borderBottom: isOpaque ? '1px solid var(--border)' : '1px solid transparent',
      boxShadow: isOpaque ? 'var(--shadow-sm)' : 'none'
    }}>
      {/* Disclaimer Top Bar */}
      <div style={{
        backgroundColor: isOpaque ? 'var(--primary)' : 'rgba(0, 0, 0, 0.3)',
        color: 'white',
        fontSize: '0.65rem',
        textAlign: 'center',
        padding: '0.4rem 1rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        transition: 'all 0.3s ease',
        borderBottom: isOpaque ? 'none' : '1px solid rgba(255,255,255,0.1)'
      }}>
        Authorized and Restricted for Laboratory Research Use Only
      </div>

      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: isOpaque ? '0.75rem 0' : '1rem 0',
        transition: 'all 0.3s ease'
      }}>
        {/* Logo Section */}
        <div 
          onClick={onGoHome}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            position: 'relative',
            zIndex: 10
          }}
          className="header-layout-brand"
        >
          {/* Compact logo on mobile, full logo on desktop */}
          <span className="desktop-only"><BrandLogo variant={isOpaque ? 'dark' : 'white'} size="default" /></span>
          <span className="mobile-only"><BrandLogo variant={isOpaque ? 'dark' : 'white'} size="compact" /></span>
        </div>
        
        {/* Right Side: Desktop Nav + Actions + Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Desktop Nav */}
          <nav className="desktop-nav" style={{ gap: '1.5rem' }}>
            {TOP_NAV.map(nav => (
              <Link
                key={nav.path}
                to={nav.path}
                style={navLinkStyle}
                onMouseOver={(e) => { e.currentTarget.style.color = isOpaque ? 'var(--secondary)' : 'white'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = isOpaque ? 'var(--text-main)' : 'rgba(255,255,255,0.9)'; }}
              >
                {nav.label}
              </Link>
            ))}

            {/* Catalog Dropdown */}
            <div ref={catalogRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setCatalogOpen(!catalogOpen);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  lineHeight: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: isOpaque ? 'var(--text-main)' : 'rgba(255,255,255,0.9)',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = isOpaque ? 'var(--secondary)' : 'white' }}
                onMouseOut={(e) => { e.currentTarget.style.color = isOpaque ? 'var(--text-main)' : 'rgba(255,255,255,0.9)' }}
              >
                Catalog <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: catalogOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              {catalogOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.75rem)',
                  left: 0,
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border)',
                  minWidth: '220px',
                  overflow: 'visible',
                  zIndex: 100,
                }}>
                  {CATALOG_ITEMS.map((item) => (
                    <div key={item} style={{ position: 'relative' }}>
                      <Link 
                        to={
                          item === 'Research Catalog' ? '/products' : 
                          item === 'Investigational Pathways' ? '/collection/investigation-pathways' : 
                          item === 'Supplies' ? '/supplies' : 
                          '/custom-synthesis'
                        }
                        onClick={() => {
                          setCatalogOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1.25rem',
                          textDecoration: 'none',
                          color: 'var(--text-main)',
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          borderBottom: '1px solid var(--background)',
                          transition: 'background 0.15s',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--background)'; e.currentTarget.style.color = 'var(--primary)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-main)'; }}
                      >
                        {item}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Company Dropdown */}
            <div ref={companyRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setCompanyOpen(!companyOpen);
                  setCatalogOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  lineHeight: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: isOpaque ? 'var(--text-main)' : 'rgba(255,255,255,0.9)',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = isOpaque ? 'var(--secondary)' : 'white' }}
                onMouseOut={(e) => { e.currentTarget.style.color = isOpaque ? 'var(--text-main)' : 'rgba(255,255,255,0.9)' }}
              >
                Resources <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: companyOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              {companyOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.75rem)',
                  right: 0,
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border)',
                  minWidth: '200px',
                  overflow: 'hidden',
                  zIndex: 100,
                }}>
                  {COMPANY_ITEMS.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setCompanyOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1.25rem',
                        textDecoration: 'none',
                        color: 'var(--text-main)',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        borderBottom: '1px solid var(--background)',
                        transition: 'background 0.15s',
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--background)'; e.currentTarget.style.color = 'var(--primary)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-main)'; }}
                    >
                      <span style={{ color: 'var(--primary)', display: 'flex' }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>


            {/* Unified User & Region Selector (Desktop) */}
            <div className="desktop-only" ref={settingsRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  backgroundColor: isOpaque ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${isOpaque ? 'var(--border)' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '999px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: isOpaque ? 'var(--text-main)' : 'white',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = isOpaque ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = isOpaque ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.1)'; }}
              >
                {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {isProfessional ? <ShieldCheck size={14} color="var(--success)" /> : <User size={14} />}
                    <span>{user.displayName?.split(' ')[0] || 'Account'}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <User size={14} />
                    <span>Login</span>
                  </div>
                )}
                <ChevronDown size={12} style={{ transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>

              {settingsOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '280px',
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border)',
                  padding: '1.25rem',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  animation: 'headerFadeIn 0.2s ease-out'
                }}>
                  {/* User Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                           {user ? (user.displayName || user.email) : 'Guest Scientist'}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: user ? (isProfessional ? 'var(--success)' : 'var(--primary)') : 'var(--text-muted)' }}>
                           {user ? (isProfessional ? 'Professional Account' : 'Standard Account') : 'No account detected'}
                        </span>
                     </div>
                     {!user && (
                        <button 
                          onClick={() => { handleNav('/login'); setSettingsOpen(false); }}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px', border: 'none', background: 'var(--primary)', cursor: 'pointer', color: 'white' }}
                        >
                          Login
                        </button>
                     )}
                  </div>

                  {user && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <button
                        onClick={() => { handleNav('/dashboard'); setSettingsOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.6rem 0.75rem', background: 'none', border: 'none',
                          color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600,
                          cursor: 'pointer', borderRadius: '10px', textAlign: 'left',
                          transition: 'background 0.2s', width: '100%'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--background)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <LayoutDashboard size={16} color="var(--primary)" /> Dashboard
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { handleNav('/admin'); setSettingsOpen(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.6rem 0.75rem', background: 'none', border: 'none',
                            color: 'var(--error, #ef4444)', fontSize: '0.85rem', fontWeight: 600,
                            cursor: 'pointer', borderRadius: '10px', textAlign: 'left',
                            transition: 'background 0.2s', width: '100%'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                        >
                          <LayoutDashboard size={16} color="var(--error, #ef4444)" /> Admin Board
                        </button>
                      )}
                      <button
                        onClick={() => { handleNav('/settings'); setSettingsOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.6rem 0.75rem', background: 'none', border: 'none',
                          color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600,
                          cursor: 'pointer', borderRadius: '10px', textAlign: 'left',
                          transition: 'background 0.2s', width: '100%'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--background)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <User size={16} color="var(--primary)" /> Profile Settings
                      </button>
                      <button
                        onClick={() => { logout(); setSettingsOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.6rem 0.75rem', background: 'none', border: 'none',
                          color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600,
                          cursor: 'pointer', borderRadius: '10px', textAlign: 'left',
                          transition: 'background 0.2s', width: '100%'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--background)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}

                  <div style={{ height: '1px', background: 'var(--border)', margin: '0.2rem 0' }} />
                  
                  {/* Region & Currency Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Research Region</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {displayFlag} {displayCountryName}
                        </span>
                      </div>
                      <button 
                        onClick={() => { onOpenRegion(); setSettingsOpen(false); }}
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', cursor: 'pointer', color: 'var(--primary)' }}
                      >
                        Change
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Trading Currency</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>USD (US Dollar)</span>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '0.6rem', 
                    backgroundColor: 'var(--background)', 
                    borderRadius: '10px',
                    fontSize: '0.65rem',
                    lineHeight: '1.4',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)'
                  }}>
                    Prices shown in USD. Global logistics hubs manage dispatch for {region?.toUpperCase()}.
                  </div>
                </div>
              )}
            </div>

            {/* Search button — desktop AND mobile header */}
            <button 
              onClick={onOpenSearch}
              aria-label="Open search"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isOpaque ? 'var(--text-main)' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Search size={22} />
            </button>

            <button 
              onClick={onOpenCart}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isOpaque ? 'var(--primary)' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--secondary)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  border: '2px solid white'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Hamburger Button — shown only on mobile via className */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            style={{ 
              color: isOpaque ? 'var(--text-main)' : 'white', 
              background: 'none', 
              border: 'none', 
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s ease'
            }}
          >
            <Menu size={26} />
          </button>
        </div>
      </div>

    </header>

      {/* Premium Mobile Menu Drawer — rendered via portal to escape header stacking context */}
      {mobileMenuOpen && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 14, 28, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={() => setMobileMenuOpen(false)}>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .drawer-link {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 0.85rem 1rem;
              color: var(--text-main);
              font-weight: 600;
              font-size: 1.05rem;
              text-decoration: none;
              border-radius: 12px;
              transition: all 0.2s ease;
            }
            .drawer-link:active {
              background-color: var(--background);
              transform: scale(0.98);
            }
            .drawer-section-title {
              font-size: 0.75rem;
              font-weight: 800;
              color: var(--text-muted);
              text-transform: uppercase;
              letter-spacing: 0.1em;
              padding: 1.5rem 1rem 0.5rem 1rem;
              display: block;
            }
          `}</style>
          <div style={{
            width: '85%',
            maxWidth: '360px',
            height: '100%',
            backgroundColor: 'white',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--background)'
            }}>
              <BrandLogo variant="dark" size="compact" />
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'white', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {/* Main Navigation */}
              <span className="drawer-section-title">Navigation</span>
              <Link to="/" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/quality" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>Quality Assurance</Link>
              <Link to="/protocol-builder" className="drawer-link" onClick={() => setMobileMenuOpen(false)}>Protocol Builder</Link>
              <Link to="/calculator" className="drawer-link" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 700 }}><FlaskConical size={18} /> Calculator</Link>
              
              <div style={{ marginTop: '0.5rem' }}>
                <button 
                  onClick={() => setMobileCatalogOpen(!mobileCatalogOpen)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'none', border: 'none', padding: '0.85rem 1rem',
                    color: 'var(--text-main)', fontWeight: 600, fontSize: '1.05rem', textAlign: 'left'
                  }}
                >
                  Catalog <ChevronDown size={18} style={{ transform: mobileCatalogOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
                </button>
                {mobileCatalogOpen && (
                  <div style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {CATALOG_ITEMS.map(item => (
                      <Link 
                        key={item} 
                        to={
                          item === 'Research Catalog' ? '/products' : 
                          item === 'Investigational Pathways' ? '/collection/investigation-pathways' : 
                          item === 'Supplies' ? '/supplies' : 
                          '/custom-synthesis'
                        } 
                        className="drawer-link" 
                        style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '0.25rem' }}>
                <button 
                  onClick={() => setMobileCompanyOpen(!mobileCompanyOpen)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'none', border: 'none', padding: '0.85rem 1rem',
                    color: 'var(--text-main)', fontWeight: 600, fontSize: '1.05rem', textAlign: 'left'
                  }}
                >
                  Resources <ChevronDown size={18} style={{ transform: mobileCompanyOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
                </button>
                {mobileCompanyOpen && (
                  <div style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {COMPANY_ITEMS.map(item => (
                      <Link 
                        key={item.path} 
                        to={item.path} 
                        className="drawer-link" 
                        style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Research Settings Section (Moved to Submenu) */}
              <div style={{ marginTop: '0.25rem' }}>
                <button 
                  onClick={() => setMobileSettingsOpen(!mobileSettingsOpen)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'none', border: 'none', padding: '0.85rem 1rem',
                    color: 'var(--text-main)', fontWeight: 600, fontSize: '1.05rem', textAlign: 'left'
                  }}
                >
                  Regional Settings <Globe size={18} style={{ opacity: 0.6 }} />
                </button>
                {mobileSettingsOpen && (
                  <div style={{ 
                    margin: '0 0.5rem 0.5rem 0.5rem', 
                    padding: '1.25rem', 
                    backgroundColor: 'var(--background)', 
                    borderRadius: '16px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Research Region</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {displayFlag} {displayCountryName}
                        </span>
                      </div>
                      <button 
                        onClick={() => { onOpenRegion(); setMobileMenuOpen(false); }}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px', border: '1px solid var(--primary)', background: 'white', color: 'var(--primary)' }}
                      >
                        Change
                      </button>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Currency: <strong style={{ color: 'var(--text-main)' }}>USD</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* User Account Section */}
              <span className="drawer-section-title">Professional Account</span>
              <div style={{ padding: '0.5rem' }}>
                {user ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <User size={18} />
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700 }}>{user.displayName || 'Authorized Scientist'}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--success)' }}>Active Session</span>
                      </div>
                    </div>
                    <Link to="/dashboard" className="drawer-link" onClick={() => setMobileMenuOpen(false)}><LayoutDashboard size={18} /> Dashboard</Link>
                    {isAdmin && (
                      <Link to="/admin" className="drawer-link" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--error, #ef4444)' }}>
                        <LayoutDashboard size={18} /> Admin Board
                      </Link>
                    )}                    <button 
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', textAlign: 'left' }}
                      className="drawer-link"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '0.5rem' }}>
                    <Link 
                      to="/login" 
                      className="drawer-link" 
                      style={{ backgroundColor: 'var(--primary)', color: 'white', justifyContent: 'center' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login / Register
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                Institutional research support 24/7 available for registered professionals.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

/* eslint-disable no-unused-vars */
import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Menu, X, ShoppingCart, Search, ChevronDown, LogIn, LogOut, User, LayoutDashboard, Globe, Home, ShieldCheck, Calculator, BookOpen, Beaker, HelpCircle, FlaskConical, ClipboardList, Package, ShoppingBag, Brain, Users, Activity, BookCopy, GraduationCap, BookMarked, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { REGION_FLAGS } from '../data/regions';
import { COUNTRIES } from '../data/countries';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import BrandLogo from '../components/common/BrandLogo';
import { TOP_NAV, CATALOGS_MENU, ACADEMIA_MENU, RESOURCES_MENU, ROLE_NAV_MENUS } from '../navigation/navConfig';
import CatalogMegaMenu from '../navigation/CatalogMegaMenu';

import ResourcesDropdown from '../navigation/ResourcesDropdown';
import WorkplaceDropdown from '../navigation/WorkplaceDropdown';
import UserDropdown from '../navigation/UserDropdown';

// ── Static style constants (allocated once, not per render) ──────────────────
const S = {
  drawerLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.8rem 1rem',
    color: 'var(--text-main)',
    fontWeight: 600,
    fontSize: '1rem',
    textDecoration: 'none',
    borderRadius: '10px',
    transition: 'background 0.18s ease',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  sectionTitle: {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    padding: '1.25rem 1rem 0.4rem',
    display: 'block',
  },
  dropdownCard: {
    position: 'absolute',
    top: 'calc(100% + 0.75rem)',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    border: '0.5px solid var(--border)',
    overflow: 'hidden',
    zIndex: 200,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.7rem 1.25rem',
    textDecoration: 'none',
    color: 'var(--text-main)',
    fontWeight: 500,
    fontSize: '0.875rem',
    borderBottom: '0.5px solid var(--background)',
    transition: 'background 0.15s',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
};

const ROLE_LABELS = {
  admin: 'Admin View',
  clinic: 'Clinic View',
  doctor: 'Physician View',
  physician: 'Physician View',
  wholesaler: 'Wholesaler View',
  sales_agent: 'Agent View',
  staff: 'Staff View',
  patient: 'Patient View',
  guest: 'Guest View'
};

function Header(props) {
  const { scrolled, cartCount, cartBreakdown = {}, onOpenCart, onOpenSearch, region, selectedCountryCode, onOpenRegion, onSelectProduct, onSelectCategory, isHome, onGoHome, products, setActiveModal } = props;
  const isOpaque = scrolled || !isHome;
  const { user, isProfessional, isAdmin, activeRole, logout } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const logoUrl = tenant?.branding?.logoUrl;
  const tenantName = tenant?.name;

  // ── Mobile drawer ────────────────────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Single string tracks which accordion is open: null | 'catalog' | 'academia' | 'resources' | 'settings'
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const toggleMobile = (key) => setMobileExpanded(prev => (prev === key ? null : key));

  // ── Desktop dropdowns — single source of truth ───────────────────────────────
  // Possible values: null | 'catalog' | 'academia' | 'resources' | 'workplace' | 'user'
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navRef = useRef(null);

  const role = isAdmin ? 'admin' : isProfessional ? 'professional' : 'guest';
  
  // Universal Flag & Name Lookup
  const currentCountry = COUNTRIES.find(c => c.code === (selectedCountryCode || region));
  const displayFlag = REGION_FLAGS[selectedCountryCode] || currentCountry?.flag || REGION_FLAGS[region] || '🌐';
  const displayCountryName = currentCountry?.name || (region === 'row' ? 'Global' : (region || 'Global').toUpperCase());

  // Close any open dropdown when clicking outside the nav bar
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAll = useCallback(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, []);

  const handleNav = (path) => {
    navigate(path);
    closeAll();
  };

  const navColor = 'var(--text-main)';
  const navLinkStyle = {
    color: navColor,
    fontWeight: 550,
    fontSize: '0.875rem',
    cursor: 'pointer',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
    letterSpacing: '0.01em',
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
    <header className={`site-header ${isOpaque ? 'site-header--opaque' : ''}`}>
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
        borderBottom: isOpaque ? 'none' : '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '1.8rem'
      }}>
        {activeRole === 'guest' || !user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span>Guest View</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span style={{ opacity: 0.9 }}>Log in to access professional portals</span>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                padding: '0.1rem 0.5rem',
                fontSize: '0.6rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                marginLeft: '0.25rem',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.borderColor = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              Log In
            </button>
          </div>
        ) : (
          <span>{ROLE_LABELS[activeRole] || `${activeRole.toUpperCase()} VIEW`}</span>
        )}
      </div>

      <div className="container header-container">
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
          <span className="site-header__logo-desktop">
            {logoUrl ? (
              <img src={logoUrl} alt={tenantName || "Partner Logo"} style={{ height: '40px', objectFit: 'contain' }} />
            ) : (
              <BrandLogo variant="dark" size="default" />
            )}
          </span>
          <span className="site-header__logo-mobile">
            {logoUrl ? (
              <img src={logoUrl} alt={tenantName || "Partner Logo"} style={{ height: '32px', objectFit: 'contain' }} />
            ) : (
              <BrandLogo variant="dark" size="compact" />
            )}
          </span>
        </div>
        
        {/* Right Side: Desktop Nav + Actions + Mobile Hamburger */}
          <div ref={navRef} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* REGULAR NAV */}
            <nav className="site-header__nav">
            {/* REGULAR NAV */}
            {(ROLE_NAV_MENUS[activeRole] || ROLE_NAV_MENUS.guest).map(nav => {
              const isDropdown = !!nav.dropdown;
              const isActive = activeDropdown === nav.dropdown;

              if (!isDropdown) {
                return (
                  <Link
                    key={nav.path}
                    to={nav.path}
                    style={navLinkStyle}
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--secondary)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = navColor; }}
                  >
                    {nav.label}
                  </Link>
                );
              }

              return (
                <div key={nav.label} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActiveDropdown(isActive ? null : nav.dropdown)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                      background: 'none', border: 'none', padding: 0, margin: 0,
                      lineHeight: 'inherit', fontFamily: 'inherit',
                      fontWeight: 550, fontSize: '0.875rem',
                      color: navColor, cursor: 'pointer',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--secondary)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = navColor; }}
                  >
                    {nav.label}
                    <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: isActive ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>

                  {isActive && nav.dropdown === 'catalog' && (
                    <CatalogMegaMenu onClose={() => setActiveDropdown(null)} />
                  )}
                  {isActive && nav.dropdown === 'academia' && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 12px)', left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '14px', padding: '0.5rem',
                      minWidth: '220px', boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                      display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 1000,
                    }}>
                      {ACADEMIA_MENU.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setActiveDropdown(null)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.6rem 1rem', borderRadius: '10px',
                            fontSize: '0.875rem', fontWeight: 500,
                            color: 'var(--text-primary)', textDecoration: 'none',
                            transition: 'background 0.15s',
                            pointerEvents: item.soon ? 'none' : 'auto',
                            opacity: item.soon ? 0.5 : 1,
                          }}
                          onMouseOver={e => !item.soon && (e.currentTarget.style.background = 'var(--background)')}
                          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          {item.label}
                          {item.soon && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--secondary)', background: 'var(--secondary-alpha, rgba(100,200,150,0.12))', padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.05em' }}>COMING SOON</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                  {isActive && nav.dropdown === 'resources' && (
                    <ResourcesDropdown onClose={() => setActiveDropdown(null)} />
                  )}
                </div>
              );
            })}
          </nav>


          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>



            {/* User / Settings Dropdown (Desktop) */}
            <div className="site-header__user-dropdown-wrapper" style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '999px', cursor: 'pointer', transition: 'all 0.2s ease',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem', fontWeight: 600,
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'; }}
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
                <ChevronDown size={12} style={{ transform: activeDropdown === 'user' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>

              {activeDropdown === 'user' && (
                <UserDropdown
                  user={user}
                  isProfessional={isProfessional}
                  isAdmin={isAdmin}
                  role={role}
                  displayFlag={displayFlag}
                  displayCountryName={displayCountryName}
                  region={region}
                  onOpenRegion={onOpenRegion}
                  onNav={handleNav}
                  onLogout={() => { logout(); setActiveDropdown(null); }}
                  onClose={() => setActiveDropdown(null)}
                />
              )}
            </div>






            {/* Atlas AI Google Cloud Style Button */}
            <button 
              onClick={() => setActiveModal('ai')}
              aria-label="Open Atlas AI"
              style={{
                background: 'rgba(66, 133, 244, 0.1)',
                border: '1px solid rgba(66, 133, 244, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#4285F4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.4rem',
                marginRight: '0.25rem',
                transition: 'all 0.2s ease',
                gap: '0.35rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(66, 133, 244, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(66, 133, 244, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Sparkles size={18} fill="#4285F4" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Atlas AI</span>
            </button>

            {/* Search button — desktop AND mobile header */}
            <button 
              onClick={onOpenSearch}
              aria-label="Open search"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-main)',
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
                color: 'var(--primary)',
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
              {cartCount > 0 && (() => {
                const { protocols = 0, kits = 0, peptides = 0 } = cartBreakdown;
                const hasBreakdown = protocols > 0 || kits > 0 || peptides > 0;

                if (hasBreakdown) {
                  // Multi-type pill: show each non-zero type
                  return (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      background: 'rgba(0,212,255,0.15)',
                      border: '1.5px solid rgba(0,212,255,0.6)',
                      borderRadius: '12px',
                      padding: '1px 5px',
                      backdropFilter: 'blur(8px)',
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      color: '#00d4ff',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.2,
                    }}>
                      {protocols > 0 && <span title="Protocols">🧬{protocols}</span>}
                      {kits > 0 && <span title="Kits" style={{ marginLeft: protocols > 0 ? '3px' : 0 }}>📦{kits}</span>}
                      {peptides > 0 && <span title="Peptides" style={{ marginLeft: (protocols > 0 || kits > 0) ? '3px' : 0 }}>🧪{peptides}</span>}
                    </span>
                  );
                }

                // Fallback: simple numeric badge
                return (
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
                );
              })()}
            </button>
          </div>

          {/* Hamburger Button — shown only on mobile via className */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            style={{ 
              color: 'var(--text-main)', 
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
            .mobile-nav-link {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              padding: 0.85rem 1rem;
              font-weight: 600;
              text-decoration: none;
              color: var(--text-main);
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
              {logoUrl ? (
                <img src={logoUrl} alt={tenantName || "Partner Logo"} style={{ height: '32px', objectFit: 'contain' }} />
              ) : (
                <BrandLogo variant="dark" size="compact" />
              )}
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'white', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

              {/* ── Main links ─────────────────────────────────── */}
              <span style={S.sectionTitle}>Navigation</span>
              <button
                  className="mobile-nav-link"
                  onClick={() => { onOpenSearch(); setMobileMenuOpen(false); }}
                >
                  <Search size={18} /> Search
              </button>

              {/* DYNAMIC ROLE-BASED MOBILE NAV */}
              {(() => {
                const navItems = ROLE_NAV_MENUS[activeRole] || ROLE_NAV_MENUS.guest;
                
                // Map Lucide name strings to actual components
                const ICON_MAP = {
                  Home: Home,
                  ShieldCheck: ShieldCheck,
                  Brain: Brain,
                  Users: Users,
                  Activity: Activity,
                  BookOpen: BookOpen,
                  Package: Package,
                  BookCopy: BookCopy,
                  GraduationCap: GraduationCap,
                  BookMarked: BookMarked,
                  Globe: Globe,
                };

                return (
                  <>
                    {navItems.map(item => {
                      if (!item.dropdown) {
                        const IconComponent = ICON_MAP[item.icon] || Home;
                        return (
                          <Link 
                            key={item.label}
                            to={item.path} 
                            style={S.drawerLink} 
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <IconComponent size={18} /> {item.label}
                          </Link>
                        );
                      }

                      if (item.dropdown === 'catalog') {
                        return (
                          <div key={item.label}>
                            <button
                              style={S.drawerLink}
                              onClick={() => toggleMobile('catalog')}
                              aria-expanded={mobileExpanded === 'catalog'}
                            >
                              <BookOpen size={18} /> {item.label}
                              <ChevronDown size={16} style={{ marginLeft: 'auto', transform: mobileExpanded === 'catalog' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }} />
                            </button>
                            {mobileExpanded === 'catalog' && (
                              <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                {CATALOGS_MENU.map(subItem => (
                                  <Link
                                    key={subItem.path}
                                    to={subItem.path}
                                    style={{
                                      ...S.drawerLink, fontSize: '0.9rem',
                                      color: 'var(--text-primary)',
                                      paddingTop: '0.55rem', paddingBottom: '0.55rem',
                                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    }}
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (item.dropdown === 'academia') {
                        return (
                          <div key={item.label}>
                            <button
                              style={S.drawerLink}
                              onClick={() => toggleMobile('academia')}
                              aria-expanded={mobileExpanded === 'academia'}
                            >
                              <GraduationCap size={18} /> {item.label}
                              <ChevronDown size={16} style={{ marginLeft: 'auto', transform: mobileExpanded === 'academia' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }} />
                            </button>
                            {mobileExpanded === 'academia' && (
                              <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                {ACADEMIA_MENU.map(subItem => (
                                  <Link
                                    key={subItem.path}
                                    to={subItem.path}
                                    style={{
                                      ...S.drawerLink, fontSize: '0.9rem',
                                      color: subItem.soon ? 'var(--text-muted)' : 'var(--text-primary)',
                                      paddingTop: '0.55rem', paddingBottom: '0.55rem',
                                      opacity: subItem.soon ? 0.55 : 1,
                                      pointerEvents: subItem.soon ? 'none' : 'auto',
                                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    }}
                                    onClick={() => !subItem.soon && setMobileMenuOpen(false)}
                                  >
                                    {subItem.label}
                                    {subItem.soon && (
                                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--secondary)', background: 'var(--secondary-alpha, rgba(100,200,150,0.12))', padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.05em' }}>COMING SOON</span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (item.dropdown === 'resources') {
                        return (
                          <div key={item.label}>
                            <button
                              style={S.drawerLink}
                              onClick={() => toggleMobile('resources')}
                              aria-expanded={mobileExpanded === 'resources'}
                            >
                              <BookMarked size={18} /> {item.label}
                              <ChevronDown size={16} style={{ marginLeft: 'auto', transform: mobileExpanded === 'resources' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }} />
                            </button>
                            {mobileExpanded === 'resources' && (
                              <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                {RESOURCES_MENU.map(subItem => (
                                  <Link
                                    key={subItem.path}
                                    to={subItem.path}
                                    style={{ ...S.drawerLink, fontSize: '0.9rem', color: 'var(--text-muted)', paddingTop: '0.55rem', paddingBottom: '0.55rem' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })}

                    {/* ── Regional settings accordion (always available) ── */}
                    <button
                      style={S.drawerLink}
                      onClick={() => toggleMobile('settings')}
                      aria-expanded={mobileExpanded === 'settings'}
                    >
                      <Globe size={18} /> Regional Settings
                      <ChevronDown size={16} style={{ marginLeft: 'auto', transform: mobileExpanded === 'settings' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s', opacity: 0.6 }} />
                    </button>
                    {mobileExpanded === 'settings' && (
                      <div style={{ margin: '0 0.5rem 0.5rem 0.5rem', padding: '1.25rem', backgroundColor: 'var(--background)', borderRadius: '16px', border: '1px solid var(--border)' }}>
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
                  </>
                );
              })()}

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
                    <Link to="/paciente" className="drawer-link" onClick={() => setMobileMenuOpen(false)}><LayoutDashboard size={18} /> Dashboard</Link>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
                    <Link
                      to="/login"
                      className="drawer-link"
                      style={{ backgroundColor: 'var(--primary)', color: 'white', justifyContent: 'center', borderRadius: '12px' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn size={18} /> Login
                    </Link>
                    <Link
                      to={{ pathname: '/login', search: '?tab=register' }}
                      className="drawer-link"
                      style={{ backgroundColor: 'transparent', color: 'var(--primary)', justifyContent: 'center', border: '1.5px solid var(--primary)', borderRadius: '12px' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn size={18} /> Register
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

export default memo(Header);

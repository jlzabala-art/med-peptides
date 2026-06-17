import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import Shield from 'lucide-react/dist/esm/icons/shield';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import User from 'lucide-react/dist/esm/icons/user';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import FlaskConical from 'lucide-react/dist/esm/icons/flask-conical';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import Search from 'lucide-react/dist/esm/icons/search';
import Check from 'lucide-react/dist/esm/icons/check';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Grid from 'lucide-react/dist/esm/icons/grid';
import X from 'lucide-react/dist/esm/icons/x';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';

const PORTALS = [
  {
    id: 'admin',
    label: 'Admin Console',
    description: 'Operations, configuration & master data',
    icon: Shield,
    route: '/admin',
    color: '#3b82f6', // blue-500
    group: 'Operations',
  },
  {
    id: 'wholesaler',
    label: 'Logistics Portal',
    description: 'Shipments, warehouse & B2B orders',
    icon: Building2,
    route: '/wholesaler',
    color: '#f59e0b', // amber-500
    group: 'Operations',
  },
  {
    id: 'b2c',
    label: 'Patient Shop',
    description: 'Patient storefront',
    icon: ShoppingCart,
    route: '/',
    color: '#ec4899', // pink-500
    group: 'Commercial',
  },
  {
    id: 'account_manager',
    label: 'Account Manager Portal',
    description: 'Manage clinical accounts & sales',
    icon: Briefcase,
    route: '/account-manager',
    color: '#8b5cf6', // violet-500
    group: 'Commercial',
  },
  {
    id: 'doctor',
    label: 'Clinical Portal',
    description: 'Prescriptions & doctor dashboard',
    icon: Stethoscope,
    route: '/doctor',
    color: '#10b981', // emerald-500
    group: 'Clinical',
  },
  {
    id: 'patient',
    label: 'Patient Portal',
    description: 'Patient records & treatments',
    icon: User,
    route: '/patient',
    color: '#8b5cf6', // violet-500
    group: 'Clinical',
  },
  {
    id: 'compounding_pharmacy',
    label: 'Pharmacy Portal',
    description: 'Compounding & formulas',
    icon: FlaskConical,
    route: '/pharmacy-dashboard',
    color: '#06b6d4', // cyan-500
    group: 'Clinical',
  },
];

// Helper to track recent portals in localStorage
const RECENT_KEY = 'regenpept_recent_portals';
function getRecentPortalIds() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function addRecentPortal(id) {
  try {
    let recents = getRecentPortalIds();
    recents = [id, ...recents.filter((r) => r !== id)].slice(0, 3);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
  } catch (e) {
    // ignore
  }
}

export default function AdminPortalSwitcher() {
  const { isAdmin, activeRole, switchActiveRole } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && !isMobile) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isMobile]);

  const currentPortal = useMemo(() => {
    return (
      PORTALS.find((p) => p.id === activeRole) || {
        id: activeRole,
        label: 'Portal Switcher',
        description: 'Unknown Workspace',
        icon: LayoutDashboard,
        route: '/',
        color: '#64748b',
      }
    );
  }, [activeRole]);

  const recentPortals = useMemo(() => {
    const recentIds = getRecentPortalIds().filter((id) => id !== currentPortal.id);
    return recentIds.map((id) => PORTALS.find((p) => p.id === id)).filter(Boolean);
  }, [currentPortal.id]);

  const handleSwitch = (portal) => {
    addRecentPortal(currentPortal.id);
    switchActiveRole(portal.id);
    navigate(portal.route);
    setIsOpen(false);
  };

  // Filter and flatten structure for keyboard navigation
  const listItems = useMemo(() => {
    const term = search.toLowerCase();
    const filtered = PORTALS.filter(
      (p) =>
        p.label.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.group.toLowerCase().includes(term)
    );

    const items = [];
    if (search === '') {
      // Add current
      items.push({ type: 'header', label: 'Current Portal' });
      items.push({ type: 'portal', portal: currentPortal });

      if (recentPortals.length > 0) {
        items.push({ type: 'header', label: 'Recent Portals' });
        recentPortals.forEach((p) => items.push({ type: 'portal', portal: p }));
      }

      items.push({ type: 'header', label: 'All Portals' });

      // Group them
      const groups = [...new Set(PORTALS.map((p) => p.group))];
      groups.forEach((groupName) => {
        const groupPortals = PORTALS.filter((p) => p.group === groupName);
        if (groupPortals.length > 0) {
          items.push({ type: 'group_label', label: groupName });
          groupPortals.forEach((p) => items.push({ type: 'portal', portal: p }));
        }
      });
    } else {
      // Flat list when searching
      filtered.forEach((p) => items.push({ type: 'portal', portal: p }));
    }
    return items;
  }, [search, currentPortal, recentPortals]);

  // Extract only clickable portal items to calculate index mappings
  const clickableItems = useMemo(() => {
    return listItems
      .map((item, index) => ({ item, index }))
      .filter((x) => x.item.type === 'portal');
  }, [listItems]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (clickableItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const currentPos = clickableItems.findIndex((ci) => ci.index === prev);
        if (currentPos === -1 || currentPos === clickableItems.length - 1)
          return clickableItems[0].index;
        return clickableItems[currentPos + 1].index;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const currentPos = clickableItems.findIndex((ci) => ci.index === prev);
        if (currentPos <= 0) return clickableItems[clickableItems.length - 1].index;
        return clickableItems[currentPos - 1].index;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0) {
        const target = listItems[focusedIndex];
        if (target && target.type === 'portal') {
          handleSwitch(target.portal);
        }
      } else if (search && clickableItems.length > 0) {
        handleSwitch(clickableItems[0].item.portal);
      }
    }
  };

  // Scroll into view when focused
  useEffect(() => {
    if (focusedIndex >= 0 && containerRef.current) {
      const el = containerRef.current.querySelector(`[data-index="${focusedIndex}"]`);
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex]);

  if (!isAdmin) return null;

  // UI Components
  const PortalRow = ({ portal, index, isCurrent }) => {
    const isFocused = index === focusedIndex;

    return (
      <div
        data-index={index}
        onMouseEnter={() => setFocusedIndex(index)}
        onClick={() => handleSwitch(portal)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.6rem 1rem',
          cursor: 'pointer',
          borderRadius: '8px',
          margin: '0',
          background: isFocused
            ? 'var(--color-bg-subtle, #f1f5f9)'
            : isCurrent
              ? 'rgba(0, 54, 102, 0.03)'
              : 'transparent',
          border: isCurrent && !isFocused ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
          transition: 'all 0.15s ease',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: `${portal.color}15`,
            color: portal.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <portal.icon size={18} strokeWidth={2.5} />
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}
            >
              {portal.label}
            </span>
            {isCurrent && (
              <span
                style={{
                  fontSize: '0.7rem',
                  background: '#e2e8f0',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  color: '#475569',
                  fontWeight: 600,
                }}
              >
                Active
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              lineHeight: 1.3,
              marginTop: '0.1rem',
            }}
          >
            {portal.description}
          </span>
        </div>

        {isCurrent && <Check size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />}
      </div>
    );
  };

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onKeyDown={handleKeyDown}
    >
      <button
        onClick={() => {
          if (!isOpen) {
            setSearch('');
            setFocusedIndex(-1);
          }
          setIsOpen(!isOpen);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: isOpen ? 'rgba(0, 54, 102, 0.08)' : 'rgba(0, 54, 102, 0.04)',
          border: '1px solid rgba(0, 54, 102, 0.1)',
          padding: '0.5rem 0.8rem',
          borderRadius: '20px',
          cursor: 'pointer',
          color: 'var(--color-primary)',
          fontWeight: 600,
          fontSize: '0.85rem',
          height: '100%',
          transition: 'all 0.2s',
          outline: 'none',
        }}
        title="Switch portal view"
      >
        <style>
          {`
            @media (max-width: 720px) {
              .admin-switcher-label { display: none; }
            }
          `}
        </style>
        <div style={{ color: currentPortal.color, display: 'flex', alignItems: 'center' }}>
          {currentPortal.icon && <currentPortal.icon size={16} />}
        </div>
        <span className="admin-switcher-label" style={{ color: 'var(--color-text-primary)' }}>
          {currentPortal.label}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--color-text-tertiary)',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen &&
          (isMobile ? (
            // MOBILE BOTTOM SHEET
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '85vh',
                  background: 'white',
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                  zIndex: 10000,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Drag handle & Header */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '4px',
                      background: '#cbd5e1',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      width: '100%',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 1.5rem',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                      Switch Portal
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      style={{ background: 'none', border: 'none', padding: '0.5rem' }}
                    >
                      <X size={20} color="#64748b" />
                    </button>
                  </div>
                </div>

                <div style={{ padding: '0.5rem 1rem 1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                      }}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search workspaces..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setFocusedIndex(-1);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem 0.8rem 2.5rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '1rem',
                        background: '#f8fafc',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div
                  ref={containerRef}
                  style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}
                >
                  {listItems.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      No portals found.
                    </div>
                  ) : (
                    listItems.map((item, i) => {
                      if (item.type === 'header') {
                        return (
                          <div
                            key={`hdr-${i}`}
                            style={{
                              padding: '1rem 1rem 0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#94a3b8',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {item.label}
                          </div>
                        );
                      } else if (item.type === 'group_label') {
                        return (
                          <div
                            key={`grp-${i}`}
                            style={{
                              padding: '0.75rem 1.5rem 0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#475569',
                            }}
                          >
                            {item.label}
                          </div>
                        );
                      } else {
                        return (
                          <PortalRow
                            key={item.portal.id}
                            portal={item.portal}
                            index={i}
                            isCurrent={item.portal.id === currentPortal.id}
                          />
                        );
                      }
                    })
                  )}
                </div>
              </motion.div>
            </>
          ) : (
            // DESKTOP POPOVER
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                left: 0,
                width: '640px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid var(--color-border)',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Search Bar */}
              <div
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--color-border)',
                  background: '#f8fafc',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search portals..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setFocusedIndex(-1);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem 1rem 0.6rem 2.5rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: 'white',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      gap: '0.3rem',
                    }}
                  >
                    <kbd
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        padding: '0.1rem 0.4rem',
                        fontSize: '0.6rem',
                        color: '#64748b',
                      }}
                    >
                      ↑↓
                    </kbd>
                    <kbd
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        padding: '0.1rem 0.4rem',
                        fontSize: '0.6rem',
                        color: '#64748b',
                      }}
                    >
                      ↵
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Portal List - Grid Layout */}
              <div
                ref={containerRef}
                style={{ maxHeight: '480px', overflowY: 'auto', padding: '1rem' }}
              >
                {listItems.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No portals found for "{search}"
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.5rem',
                    }}
                  >
                    {listItems.map((item, i) => {
                      if (item.type === 'header' || item.type === 'group_label') {
                        return (
                          <div
                            key={`hdr-${i}`}
                            style={{
                              gridColumn: '1 / -1',
                              padding:
                                item.type === 'header'
                                  ? '1rem 0.5rem 0.25rem'
                                  : '0.5rem 0.5rem 0.25rem',
                              fontSize: item.type === 'header' ? '0.7rem' : '0.75rem',
                              fontWeight: item.type === 'header' ? 700 : 600,
                              color: item.type === 'header' ? '#94a3b8' : '#475569',
                              textTransform: item.type === 'header' ? 'uppercase' : 'none',
                              letterSpacing: item.type === 'header' ? '0.05em' : 'normal',
                            }}
                          >
                            {item.label}
                          </div>
                        );
                      } else {
                        return (
                          <PortalRow
                            key={`${item.type}-${i}-${item.portal.id}`}
                            portal={item.portal}
                            index={i}
                            isCurrent={item.portal.id === currentPortal.id}
                          />
                        );
                      }
                    })}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div
                style={{
                  borderTop: '1px solid var(--color-border)',
                  padding: '0.5rem',
                  display: 'flex',
                  background: '#f8fafc',
                }}
              >
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/admin/access-levels');
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Grid size={14} /> Manage Portals
                </button>
                <div style={{ width: '1px', background: 'var(--color-border)' }} />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/admin/settings');
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Settings size={14} /> Portal Settings
                </button>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}

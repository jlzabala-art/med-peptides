"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext';
import { useAdminRoleSimulation } from '../../../hooks/admin/useAdminRoleSimulation';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, User, Stethoscope, Building2, FlaskConical, LayoutDashboard, ShoppingCart, Search, Check, Settings, Grid, X, Briefcase } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

// Icons

const PORTALS = [
  {
    id: 'admin',
    label: 'Super Admin Console',
    description: 'Full master governance & all operations',
    icon: Shield,
    route: '/admin',
    color: '#003666',
    group: 'Operations',
    isSimulatedRole: true,
  },
  {
    id: 'medical_director',
    label: 'Medical Director',
    description: 'Executive clinical oversight & prescription approvals',
    icon: Stethoscope,
    route: '/admin',
    color: '#0f766e',
    group: 'Clinical',
    isSimulatedRole: true,
  },
  {
    id: 'doctor',
    label: 'Physician / Prescriber',
    description: 'Clinical prescriptions & patient protocols',
    icon: Stethoscope,
    route: '/doctor',
    color: '#0d9488',
    group: 'Clinical',
    isSimulatedRole: true,
  },
  {
    id: 'clinic',
    label: 'Medical Clinic',
    description: 'Practice management & affiliated physicians',
    icon: Building2,
    route: '/doctor',
    color: '#0284c7',
    group: 'Clinical',
    isSimulatedRole: true,
  },
  {
    id: 'compounding_pharmacy',
    label: 'Compounding Pharmacy',
    description: 'Custom peptide formulas & compounding orders',
    icon: FlaskConical,
    route: '/pharmacy-dashboard',
    color: '#06b6d4',
    group: 'Clinical',
    isSimulatedRole: true,
  },
  {
    id: 'wholesaler',
    label: 'Wholesaler / Distributor',
    description: 'B2B volume purchasing & wholesale catalogs',
    icon: Building2,
    route: '/wholesaler-dashboard',
    color: '#c2410c',
    group: 'Commercial',
    isSimulatedRole: true,
  },
  {
    id: 'supplier',
    label: 'Supplier / Manufacturer',
    description: 'Supply chain procurement & RFQs',
    icon: Building2,
    route: '/admin',
    color: '#f59e0b',
    group: 'Operations',
    isSimulatedRole: true,
  },
  {
    id: 'account_manager',
    label: 'Account Manager',
    description: 'Clinic accounts, sales pipelines & quotes',
    icon: Briefcase,
    route: '/admin',
    color: '#8b5cf6',
    group: 'Commercial',
    isSimulatedRole: true,
  },
  {
    id: 'patient_coordinator',
    label: 'Patient Coordinator',
    description: 'Patient care logistics & communications',
    icon: User,
    route: '/admin',
    color: '#0ea5e9',
    group: 'Clinical',
    isSimulatedRole: true,
  },
  {
    id: 'patient',
    label: 'Patient Health Portal',
    description: 'Personal health protocols & lab results',
    icon: User,
    route: '/patient',
    color: '#7c3aed',
    group: 'Clinical',
    isSimulatedRole: true,
  },
  {
    id: 'b2c',
    label: 'Patient Storefront',
    description: 'Direct consumer catalog & shopping',
    icon: ShoppingCart,
    route: '/',
    color: '#ec4899',
    group: 'Commercial',
    isSimulatedRole: false,
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
  const { isAdmin, userProfile, activeRole, switchActiveRole } = useAuth();
  const { simulatedRole, setSimulatedRole } = useAdminRoleSimulation();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);

  // Responsive listener
  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll on mobile while bottom sheet is open
  useEffect(() => {
    if (isOpen && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, isMobile]);

  // Click outside to close (desktop only; mobile uses full backdrop overlay)
  useEffect(() => {
    if (!isOpen || isMobile) return;
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile]);

  // Focus search input when opened on desktop
  useEffect(() => {
    if (isOpen && !isMobile) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isMobile]);

  const currentPortal = useMemo(() => {
    // Check if we are simulating a role first
    if (simulatedRole && simulatedRole !== 'admin') {
      const sim = PORTALS.find((p) => p.id === simulatedRole || p.alias === simulatedRole);
      if (sim) return sim;
    }
    return (
      PORTALS.find((p) => p.id === activeRole || p.alias === activeRole) || {
        id: activeRole || 'admin',
        label: 'Admin Console',
        description: 'Full master access',
        icon: Shield,
        route: '/admin',
        color: '#003666',
      }
    );
  }, [activeRole, simulatedRole]);

  const recentPortals = useMemo(() => {
    const recentIds = getRecentPortalIds().filter((id) => id !== currentPortal.id);
    return recentIds.map((id) => PORTALS.find((p) => p.id === id)).filter(Boolean);
  }, [currentPortal.id]);

  const handleSwitch = (portal) => {
    addRecentPortal(currentPortal.id);
    const targetRoleId = portal.id;

    if (portal.isSimulatedRole || isAdmin) {
      setSimulatedRole(targetRoleId === 'admin' ? 'admin' : targetRoleId);
      if (switchActiveRole) {
        switchActiveRole(targetRoleId);
      }
      if (portal.route && window.location.pathname !== portal.route) {
        router.push(portal.route);
      }
    } else {
      setSimulatedRole('admin');
      if (switchActiveRole) {
        switchActiveRole(targetRoleId);
      }
      if (portal.route) {
        router.push(portal.route);
      }
    }
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

  const isKeyboardNavRef = useRef(false);

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
      isKeyboardNavRef.current = true;
      setFocusedIndex((prev) => {
        const currentPos = clickableItems.findIndex((ci) => ci.index === prev);
        if (currentPos === -1 || currentPos === clickableItems.length - 1)
          return clickableItems[0].index;
        return clickableItems[currentPos + 1].index;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      isKeyboardNavRef.current = true;
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

  // Scroll into view ONLY when navigating via keyboard (not on mouse hover)
  useEffect(() => {
    if (focusedIndex >= 0 && containerRef.current && isKeyboardNavRef.current) {
      const el = containerRef.current.querySelector(`[data-index="${focusedIndex}"]`);
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex]);

  const isMasterAdmin = isAdmin || userProfile?.role === 'admin' || userProfile?.roles?.includes('admin') || activeRole === 'admin' || Boolean(simulatedRole);
  if (!isMasterAdmin) return null;

  // UI Components
  const PortalRow = ({ portal, index, isCurrent }) => {
    const isFocused = index === focusedIndex;

    return (
      <div
        data-index={index}
        onMouseEnter={() => {
          isKeyboardNavRef.current = false;
          setFocusedIndex(index);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSwitch(portal);
        }}
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
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          triggerHaptic('light');
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
          WebkitTapHighlightColor: 'transparent',
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

      {/* MOBILE BOTTOM SHEET (PORTALED TO BODY TO ESCAPE HEADER BACKDROP-FILTER) */}
      {mounted && typeof document !== 'undefined' && isMobile &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 99999,
                    backdropFilter: 'blur(3px)',
                    WebkitBackdropFilter: 'blur(3px)',
                  }}
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
                    maxHeight: '90vh',
                    background: 'white',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    zIndex: 100000,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Drag handle & Header */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '0.65rem 0 0.25rem',
                      touchAction: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '4.5px',
                        background: '#cbd5e1',
                        borderRadius: '3px',
                        marginBottom: '0.5rem',
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 1.25rem',
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                        Switch Workspace Portal
                      </h3>
                      <button
                        onClick={() => setIsOpen(false)}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          padding: '0.4rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={18} color="#64748b" />
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '0.5rem 1rem 0.75rem' }}>
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
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '16px',
                          background: '#f8fafc',
                          boxSizing: 'border-box',
                          outline: 'none',
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
                                padding: '1rem 1.25rem 0.4rem',
                                fontSize: '0.72rem',
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
                                padding: '0.75rem 1.25rem 0.25rem',
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
                              key={`mob-portal-${item.portal.id}-${i}`}
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
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* DESKTOP POPOVER (IN PLACE) */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                left: 0,
                width: 'min(580px, calc(100vw - 32px))',
                maxWidth: 'calc(100vw - 32px)',
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
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
                    router.push('/admin/access-levels');
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
                    router.push('/admin/settings');
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
          )}
      </AnimatePresence>
    </div>
  );
}

// Updated CommandPalette with premium glassmorphism, recent history, and keyboard hints
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Search from "lucide-react/dist/esm/icons/search";
import Box from "lucide-react/dist/esm/icons/box";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Zap from "lucide-react/dist/esm/icons/zap";
import Command from "lucide-react/dist/esm/icons/command";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { searchProductsAndProtocols, searchUsers, searchOrders } from '../services/searchProviders';

const fuzzyMatch = (q, text) => text?.toLowerCase().includes(q.toLowerCase());

// Complete portal configs with placeholders for missing portals
const PORTAL_CONFIGS = {
  admin: {
    placeholder: 'Search items, orders, suppliers, RFQs, or commands…',
    routePrefix: '/admin',
    quickActions: [
      { id: 'qa-ai',       label: 'Ask Atlas AI',           icon: Sparkles, type: 'Action', action: 'ask-ai' },
      { id: 'qa-user',     label: 'Create New User',        icon: Sparkles, type: 'Action', path: '/admin/users?new=true' },
      { id: 'qa-product',  label: 'Add New Item',           icon: Box,      type: 'Action', path: '/admin/products?new=true' },
      { id: 'qa-rfq',      label: 'New Purchase RFQ',       icon: Sparkles, type: 'Action', path: '/admin/purchase-rfqs' },
      { id: 'qa-po',       label: 'New Purchase Order',     icon: Sparkles, type: 'Action', path: '/admin/purchase-orders' },
      { id: 'qa-bill',     label: 'New Supplier Bill',      icon: Sparkles, type: 'Action', path: '/admin/purchase-bills' },
      { id: 'qa-quotation',label: 'New Sales Quotation',    icon: Sparkles, type: 'Action', path: '/admin/quotations' },
    ],
  },
  doctor: {
    placeholder: 'Search patients, products, protocols, or commands...',
    routePrefix: '/doctor',
    quickActions: [
      { id: 'qa-ai', label: 'Ask Atlas AI', icon: Sparkles, type: 'Action', action: 'ask-ai' },
      { id: 'qa-patient', label: 'Register New Patient', icon: Sparkles, type: 'Action', path: '/doctor/patients?new=true' },
    ],
  },
  patient: {
    placeholder: 'Search products, protocols, orders, or commands...',
    routePrefix: '/patient',
    quickActions: [
      { id: 'qa-ai', label: 'Ask Atlas AI', icon: Sparkles, type: 'Action', action: 'ask-ai' },
    ],
  },
  wholesaler: {
    placeholder: 'Search products, orders, or commands...',
    routePrefix: '/wholesaler',
    quickActions: [
      { id: 'qa-ai', label: 'Ask Atlas AI', icon: Sparkles, type: 'Action', action: 'ask-ai' },
    ],
  },
  clinic: {
    placeholder: 'Search patients, appointments, or commands...',
    routePrefix: '/clinic',
    quickActions: [
      { id: 'qa-ai', label: 'Ask Atlas AI', icon: Sparkles, type: 'Action', action: 'ask-ai' },
    ],
  },
  pharmacy: {
    placeholder: 'Search products, prescriptions, or commands...',
    routePrefix: '/pharmacy',
    quickActions: [
      { id: 'qa-ai', label: 'Ask Atlas AI', icon: Sparkles, type: 'Action', action: 'ask-ai' },
    ],
  },
  supplier: {
    placeholder: 'Search APIs, raw materials, or commands...',
    routePrefix: '/supplier',
    quickActions: [
      { id: 'qa-ai', label: 'Ask Atlas AI', icon: Sparkles, type: 'Action', action: 'ask-ai' },
    ],
  },
};

const getActionIcon = (actionId) => {
  if (actionId === 'qa-ai') return Sparkles;
  if (actionId === 'qa-product') return Box;
  return Sparkles;
};

export default function CommandPalette({ isOpen, onClose, navGroups = [], pinnedItems = [], onNavigate, onAskAI, portalType = 'admin' }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const config = useMemo(() => PORTAL_CONFIGS[portalType] || PORTAL_CONFIGS.admin, [portalType]);
  const QUICK_ACTIONS = useMemo(() => config.quickActions, [config]);

  // Build system routes from pinned and groups (unchanged)
  const systemRoutes = useMemo(() => {
    const routes = [];
    pinnedItems.forEach(item => {
      routes.push({
        id: `route-${item.id}`,
        label: item.label,
        path: `${config.routePrefix}/${item.id === 'dashboard' ? '' : item.id}`,
        icon: item.icon || LayoutDashboard,
        type: 'Module',
      });
    });
    navGroups.forEach(group => {
      group.items.forEach(item => {
        routes.push({
          id: `route-${item.id}`,
          label: item.label,
          path: `${config.routePrefix}/${item.id}`,
          icon: item.icon || LayoutDashboard,
          type: 'Module',
        });
      });
    });
    return routes;
  }, [navGroups, pinnedItems, config]);

  // ---------- RECENT HISTORY ----------
  const [recent, setRecent] = useState(() => {
    try {
      const stored = localStorage.getItem('cmd-palette-recent');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addToRecent = (item) => {
    const entry = { id: item.id, label: item.label, path: item.path, type: 'Recent' };
    setRecent(prev => {
      const filtered = prev.filter(r => r.id !== entry.id);
      const updated = [entry, ...filtered].slice(0, 5);
      localStorage.setItem('cmd-palette-recent', JSON.stringify(updated));
      return updated;
    });
  };

  // ---------- EFFECTS ----------
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      const recentItems = recent.map(r => ({ ...r, type: 'Recent' }));
      setResults([...recentItems, ...QUICK_ACTIONS, ...systemRoutes.slice(0, 5)]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, systemRoutes, QUICK_ACTIONS, recent]);

  const performSearch = useCallback(async (q) => {
    if (!q.trim()) {
      const recentItems = recent.map(r => ({ ...r, type: 'Recent' }));
      setResults([...recentItems, ...QUICK_ACTIONS, ...systemRoutes.slice(0, 5)]);
      return;
    }
    setIsLoading(true);
    const lowerQ = q.toLowerCase();
    const actionResults = QUICK_ACTIONS.filter(a => fuzzyMatch(lowerQ, a.label));
    const routeResults = systemRoutes.filter(r => fuzzyMatch(lowerQ, r.label));
    try {
      const [algoliaResults, userResults, orderResults] = await Promise.all([
        searchProductsAndProtocols(q, config.routePrefix),
        searchUsers(q, portalType, user),
        searchOrders(q, portalType, user)
      ]);
      setResults([
        ...actionResults,
        ...routeResults,
        ...algoliaResults.products,
        ...algoliaResults.protocols,
        ...userResults,
        ...orderResults,
      ]);
    } catch (err) {
      console.error('Omni-search error:', err);
    } finally {
      setIsLoading(false);
      setSelectedIndex(0);
    }
  }, [QUICK_ACTIONS, systemRoutes, config, portalType, user, recent]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  const handleSelect = (item) => {
    if (item.type === 'Recent' && item.path) {
      navigate(item.path);
    } else if (item.action === 'ask-ai') {
      if (onAskAI) onAskAI(searchQuery);
    } else if (item.path) {
      navigate(item.path);
    }
    addToRecent(item);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Group results by type, preserving order of defined groups
  const grouped = results.reduce((acc, item) => {
    const grp = item.type || 'Module';
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(item);
    return acc;
  }, {});
  const groupOrder = ['Recent', 'Action', 'Module', 'Product', 'Protocol', 'User', 'Patient', 'Order'];

  let globalIdx = 0;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)',
        zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10vh'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: '600px', background: 'rgba(15,23,42,0.85)',
          borderRadius: '16px', boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
          overflow: 'hidden', backdropFilter: 'blur(12px)', color: '#fff', display: 'flex', flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Search size={20} color="#cbd5e1" style={{ marginRight: '0.75rem' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={config.placeholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: '#fff' }}
            aria-label="Command palette search"
          />
          {isLoading && <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Searching...</span>}
        </div>
        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
          {results.length === 0 && !isLoading && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#cbd5e1' }}>
              No results for "{searchQuery}"
            </div>
          )}
          {groupOrder.map(group => {
            if (!grouped[group] || grouped[group].length === 0) return null;
            return (
              <div key={group} style={{ marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  {group === 'Recent' ? 'Recent' : group === 'Action' ? 'Quick Actions' : group}
                </div>
                {grouped[group].map(item => {
                  const Icon = group === 'Action' ? getActionIcon(item.id) : (item.icon || Box);
                  const isSel = globalIdx === selectedIndex;
                  const curIdx = globalIdx;
                  globalIdx++;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(curIdx)}
                      style={{
                        display: 'flex', alignItems: 'center', padding: '0.75rem 1rem',
                        cursor: 'pointer', borderRadius: '8px',
                        backgroundColor: isSel ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: isSel ? '#fff' : '#e2e8f0'
                      }}
                    >
                      <Icon size={18} style={{ marginRight: '1rem', color: isSel ? '#3b82f6' : '#cbd5e1' }} />
                      <div style={{ flex: 1 }}>{item.label}</div>
                      {group === 'Action' && <Zap size={14} color="#f59e0b" style={{ marginLeft: '0.5rem' }} />}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* Footer hints */}
        <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <span><ArrowUp size={12} /> ↑ / <ArrowDown size={12} /> ↓: Navigate</span>
          <span><ArrowRight size={12} /> ↵: Select</span>
          <span>Esc: Close</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, User, Box, Package, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

const ADMIN_ROUTES = [
  { id: 'route-1', label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard, type: 'Route' },
  { id: 'route-2', label: 'Active Users', path: '/admin?t=users', icon: User, type: 'Route' },
  { id: 'route-3', label: 'Manage Products', path: '/admin?t=products', icon: Box, type: 'Route' },
  { id: 'route-4', label: 'Orders & Billing', path: '/admin?t=orders', icon: Package, type: 'Route' },
];

const fuzzyMatch = (q, text) => text.toLowerCase().includes(q.toLowerCase());

export default function CommandPalette({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(ADMIN_ROUTES);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setResults(ADMIN_ROUTES);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const performSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults(ADMIN_ROUTES);
      return;
    }
    
    setIsLoading(true);
    const lowerQ = q.toLowerCase();
    const routeResults = ADMIN_ROUTES.filter(r => fuzzyMatch(lowerQ, r.label));
    
    try {
      // Parallel fetch for basic prefix match or fetch all if small (using prefix for scalability)
      const qPrefix = q.charAt(0).toUpperCase() + q.slice(1); // Basic capitalization
      
      const usersQuery = query(collection(db, 'users'), limit(20));
      const productsQuery = query(collection(db, 'products'), limit(20));
      const ordersQuery = query(collection(db, 'orders'), limit(10));
      
      const [uSnap, pSnap, oSnap] = await Promise.all([
        getDocs(usersQuery),
        getDocs(productsQuery),
        getDocs(ordersQuery)
      ]);
      
      const foundUsers = uSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => fuzzyMatch(lowerQ, u.fullName || u.email || ''))
        .map(u => ({ id: u.id, label: u.fullName || u.email, path: \`/admin?t=users&uid=\${u.id}\`, type: 'User', icon: User }));
        
      const foundProducts = pSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => fuzzyMatch(lowerQ, p.name || ''))
        .map(p => ({ id: p.id, label: p.name, path: \`/admin?t=products&pid=\${p.id}\`, type: 'Product', icon: Box }));
        
      const foundOrders = oSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(o => fuzzyMatch(lowerQ, o.id) || fuzzyMatch(lowerQ, o.userEmail || ''))
        .map(o => ({ id: o.id, label: \`Order #\${o.id.slice(0,8)} - \${o.userEmail}\`, path: \`/admin?t=orders&oid=\${o.id}\`, type: 'Order', icon: Package }));
        
      setResults([...routeResults, ...foundUsers, ...foundProducts, ...foundOrders]);
    } catch (err) {
      console.error('Omni-search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleSelect = (item) => {
    navigate(item.path);
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
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
        zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10vh'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%', maxWidth: '600px', backgroundColor: '#fff',
          borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden', border: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          <Search size={20} color="#64748b" style={{ marginRight: '0.75rem' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search users, orders, products, or commands..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', color: '#0f172a' }}
          />
          {isLoading && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Searching...</span>}
        </div>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
          {results.length === 0 && !isLoading && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
              No results found for "{searchQuery}"
            </div>
          )}
          
          {results.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === selectedIndex;
            return (
              <div 
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '0.75rem 1rem',
                  cursor: 'pointer', borderRadius: '8px',
                  backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                  color: isSelected ? '#0f172a' : '#334155'
                }}
              >
                <Icon size={18} style={{ marginRight: '1rem', color: isSelected ? '#3b82f6' : '#64748b' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', backgroundColor: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>
                  {item.type}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

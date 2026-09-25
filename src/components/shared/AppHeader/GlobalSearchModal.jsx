"use client";

import { useRouter } from 'next/navigation';
import Search from "lucide-react/dist/esm/icons/search";
import X from "lucide-react/dist/esm/icons/x";
import Users from "lucide-react/dist/esm/icons/users";
import Package from "lucide-react/dist/esm/icons/package";
import Globe from "lucide-react/dist/esm/icons/globe";
import BarChart from "lucide-react/dist/esm/icons/bar-chart";
import Activity from "lucide-react/dist/esm/icons/activity";
import Brain from "lucide-react/dist/esm/icons/brain";
import Layout from "lucide-react/dist/esm/icons/layout";
import Settings from "lucide-react/dist/esm/icons/settings";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import FileText from "lucide-react/dist/esm/icons/file-text";
import User from "lucide-react/dist/esm/icons/user";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import React, { useState, useEffect, useRef, useMemo } from 'react';

import { useAuth } from '../../../context/AuthContext';
import { searchIndex } from '../../../navigation/searchIndex';
import { performDatabaseSearch } from '../../../services/searchDatabaseService';
import EmptyState from '../../ui/EmptyState';
import { triggerHaptic } from '@/utils/haptics';

const ICONS = {
  'users': <Users size={16} />,
  'package': <Package size={16} />,
  'globe': <Globe size={16} />,
  'bar-chart': <BarChart size={16} />,
  'activity': <Activity size={16} />,
  'brain': <Brain size={16} />,
  'layout': <Layout size={16} />,
  'settings': <Settings size={16} />,
  'layout-dashboard': <LayoutDashboard size={16} />,
  'flask': <FlaskConical size={16} />,
  'file-text': <FileText size={16} />,
  'user': <User size={16} />,
  'doctor': <Stethoscope size={16} />
};

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { activeRole, isAdmin } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('all'); // 'all' | 'protocols' | 'products' | 'users' | 'navigation'
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [combinedResults, setCombinedResults] = useState([]);
  const [isSearchingDB, setIsSearchingDB] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  // Reset state and focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedScope('all');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 60);
    }
  }, [isOpen]);

  // Handle keyboard events globally (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          document.dispatchEvent(new CustomEvent('toggle-global-search'));
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  // Filter results by role and query (Hybrid approach)
  useEffect(() => {
    // 1. Static Navigation Results
    const staticResults = searchIndex.filter(item => {
      if (item.roles && !item.roles.includes(activeRole) && !isAdmin) return false;
      if (!query.trim()) return true;
      const searchStr = query.toLowerCase();
      return item.title.toLowerCase().includes(searchStr) || 
             item.description.toLowerCase().includes(searchStr) ||
             item.category.toLowerCase().includes(searchStr);
    });

    if (!query.trim()) {
      setCombinedResults(staticResults.slice(0, 10));
      setIsSearchingDB(false);
      return;
    }

    // Show instant static results while debouncing DB
    setCombinedResults(staticResults.slice(0, 8));
    setIsSearchingDB(true);

    // 2. Debounced Dynamic Database Search
    const timeoutId = setTimeout(async () => {
      try {
        const dynamicResults = await performDatabaseSearch(query, activeRole);
        setCombinedResults((prev) => {
          const merged = [...staticResults.slice(0, 4), ...dynamicResults];
          return merged.slice(0, 15);
        });
      } catch (err) {
        console.warn('Dynamic search error:', err);
      } finally {
        setIsSearchingDB(false);
        setSelectedIndex(0);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, activeRole, isAdmin]);

  // Filter by selected scope
  const filteredResults = useMemo(() => {
    if (selectedScope === 'all') return combinedResults;
    if (selectedScope === 'protocols') {
      return combinedResults.filter(r => String(r.category || '').toLowerCase().includes('protocol'));
    }
    if (selectedScope === 'products') {
      return combinedResults.filter(r => String(r.category || '').toLowerCase().includes('product'));
    }
    if (selectedScope === 'users') {
      return combinedResults.filter(r => {
        const cat = String(r.category || '').toLowerCase();
        return cat.includes('user') || cat.includes('patient') || cat.includes('doctor');
      });
    }
    if (selectedScope === 'navigation') {
      return combinedResults.filter(r => !r.isDynamic);
    }
    return combinedResults;
  }, [combinedResults, selectedScope]);

  // Handle modal keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredResults[selectedIndex];
      if (selected) {
        triggerHaptic('selection');
        router.push(selected.path);
        onClose();
      }
    }
  };

  const handleSelect = (path) => {
    triggerHaptic('selection');
    router.push(path);
    onClose();
  };

  const canSearchUsers = isAdmin || activeRole === 'admin' || activeRole === 'doctor' || activeRole === 'clinic';

  if (!isOpen) return null;

  return (
    <>
      {/* Glassmorphic Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 100000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '4vh 1rem 1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        {/* Command Palette Window (Google Cloud UX) */}
        <div 
          style={{
            width: '100%',
            maxWidth: '680px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideDown 0.15s ease-out',
            maxHeight: '85vh'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top Search Input Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid #f1f5f9',
            position: 'relative',
            gap: '0.75rem'
          }}>
            <Search size={20} color="#003666" style={{ flexShrink: 0 }} />
            <input 
              ref={inputRef}
              type="text"
              placeholder={canSearchUsers ? "Search patients, protocols, products, settings..." : "Search protocols, products, catalog..."}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#0f172a',
                background: 'transparent'
              }}
            />

            {/* Clear Button */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                title="Clear query"
              >
                <X size={14} />
              </button>
            )}

            {isSearchingDB && (
              <Loader2 size={16} color="#003666" className="spinner-animation" style={{ flexShrink: 0 }} />
            )}

            <button 
              onClick={onClose}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0', 
                borderRadius: '6px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.7rem',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 700,
                letterSpacing: '0.02em',
                flexShrink: 0
              }}
            >
              ESC
            </button>
          </div>

          {/* Scope Filters Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1.25rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            overflowX: 'auto',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={() => { setSelectedScope('all'); setSelectedIndex(0); }}
              className={`search-scope-pill ${selectedScope === 'all' ? 'active' : ''}`}
            >
              All Scopes
            </button>
            <button
              type="button"
              onClick={() => { setSelectedScope('protocols'); setSelectedIndex(0); }}
              className={`search-scope-pill ${selectedScope === 'protocols' ? 'active' : ''}`}
            >
              Protocols
            </button>
            <button
              type="button"
              onClick={() => { setSelectedScope('products'); setSelectedIndex(0); }}
              className={`search-scope-pill ${selectedScope === 'products' ? 'active' : ''}`}
            >
              Products
            </button>
            {canSearchUsers && (
              <button
                type="button"
                onClick={() => { setSelectedScope('users'); setSelectedIndex(0); }}
                className={`search-scope-pill ${selectedScope === 'users' ? 'active' : ''}`}
              >
                Patients & Users
              </button>
            )}
            <button
              type="button"
              onClick={() => { setSelectedScope('navigation'); setSelectedIndex(0); }}
              className={`search-scope-pill ${selectedScope === 'navigation' ? 'active' : ''}`}
            >
              Navigation
            </button>
          </div>

          {/* Results Area */}
          <div style={{ overflowY: 'auto', padding: '0.4rem', flex: 1 }}>
            {filteredResults.length === 0 && !isSearchingDB ? (
              <div style={{ padding: '2rem 1rem' }}>
                <EmptyState
                  icon={Search}
                  title="No matching records"
                  subtitle={`No matching items found for "${query}" in this scope.`}
                  compact={true}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {filteredResults.map((item, index) => {
                  const isSelected = selectedIndex === index;
                  const cat = String(item.category || '').toLowerCase();
                  
                  // Semantic badge colors
                  let badgeBg = '#f1f5f9';
                  let badgeColor = '#475569';
                  if (cat.includes('protocol')) {
                    badgeBg = '#ccfbf1';
                    badgeColor = '#0f766e';
                  } else if (cat.includes('product')) {
                    badgeBg = '#e0f2fe';
                    badgeColor = '#0369a1';
                  } else if (cat.includes('user') || cat.includes('patient')) {
                    badgeBg = '#ede9fe';
                    badgeColor = '#6d28d9';
                  } else if (cat.includes('article')) {
                    badgeBg = '#fef3c7';
                    badgeColor = '#b45309';
                  }

                  return (
                    <div 
                      key={item.id || index}
                      onClick={() => handleSelect(item.path)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.65rem 0.85rem',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                        border: isSelected ? '1px solid #bae6fd' : '1px solid transparent',
                        transition: 'all 0.1s ease',
                        gap: '0.75rem'
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? '#e0f2fe' : '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#0284c7' : '#64748b',
                        flexShrink: 0
                      }}>
                        {ICONS[item.iconName] || <Search size={15} />}
                      </div>

                      {/* Text details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                            {item.title}
                          </span>
                          <span style={{ 
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            textTransform: 'uppercase', 
                            color: badgeColor,
                            backgroundColor: badgeBg,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            letterSpacing: '0.02em'
                          }}>
                            {item.category}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.description}
                        </p>
                      </div>

                      {/* Enter Action Prompt */}
                      {isSelected ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Jump</span>
                          <kbd style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem' }}>↵</kbd>
                        </div>
                      ) : (
                        <ChevronRight size={14} color="#cbd5e1" style={{ flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Navigation Hints */}
          <div style={{ 
            padding: '0.65rem 1.25rem',
            backgroundColor: '#f8fafc', 
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.72rem',
            color: '#64748b',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <kbd className="search-kbd">↑</kbd>
                <kbd className="search-kbd">↓</kbd>
                navigate
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <kbd className="search-kbd">↵</kbd>
                select
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <kbd className="search-kbd">esc</kbd>
                close
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Role: <strong>{activeRole}</strong>
            </span>
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px) scale(0.99); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spinner-animation {
            animation: spin 0.8s linear infinite;
          }
          .search-scope-pill {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 9999px;
            padding: 2px 10px;
            font-size: 0.72rem;
            font-weight: 600;
            color: #64748b;
            cursor: pointer;
            transition: all 0.15s ease;
            white-space: nowrap;
          }
          .search-scope-pill:hover {
            background: #f1f5f9;
            color: #0f172a;
          }
          .search-scope-pill.active {
            background: #003666;
            border-color: #003666;
            color: #ffffff;
          }
          .search-kbd {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 1px 4px;
            font-size: 0.65rem;
            color: #475569;
            box-shadow: 0 1px 1px rgba(0,0,0,0.04);
          }
        `}
      </style>
    </>
  );
}
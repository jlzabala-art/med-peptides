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
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { searchIndex } from '../../../navigation/searchIndex';
import { performDatabaseSearch } from '../../../services/searchDatabaseService';
















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
  'user': <User size={16} />
};

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { activeRole } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [combinedResults, setCombinedResults] = useState([]);
  const [isSearchingDB, setIsSearchingDB] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Reset state and focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle keyboard events globally
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // If we had a global context to open, it'd go here. 
          // But usually the parent listens for this to toggle `isOpen`.
          // We'll dispatch a custom event for the parent to catch.
          document.dispatchEvent(new CustomEvent('toggle-global-search'));
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  // Filter results by role and query (Hybrid approach)
  useEffect(() => {
    // 1. Static Results
    const staticResults = searchIndex.filter(item => {
      if (item.roles && !item.roles.includes(activeRole)) return false;
      if (!query.trim()) return true;
      const searchStr = query.toLowerCase();
      return item.title.toLowerCase().includes(searchStr) || 
             item.description.toLowerCase().includes(searchStr) ||
             item.category.toLowerCase().includes(searchStr);
    });

    if (!query.trim()) {
      setCombinedResults(staticResults.slice(0, 8));
      setIsSearchingDB(false);
      return;
    }

    // Temporarily show static while loading dynamic
    setCombinedResults(staticResults.slice(0, 8));
    setIsSearchingDB(true);

    // 2. Debounced Dynamic Database Search
    const timeoutId = setTimeout(async () => {
      const dynamicResults = await performDatabaseSearch(query, activeRole);
      setCombinedResults((prev) => {
        // Merge static + dynamic, cap at 10 results total
        const merged = [...staticResults.slice(0, 4), ...dynamicResults];
        return merged.slice(0, 10);
      });
      setIsSearchingDB(false);
      setSelectedIndex(0); // Reset selection
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query, activeRole]);

  // Handle modal keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < combinedResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = combinedResults[selectedIndex];
      if (selected) {
        navigate(selected.path);
        onClose();
      }
    }
  };

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '10vh',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        {/* Modal Window */}
        <div 
          style={{
            width: '100%',
            maxWidth: '650px',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: '4px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid #dadce0',
            animation: 'slideDown 0.15s ease-out'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input Area */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #dadce0',
            position: 'relative'
          }}>
            <Search size={20} color="#5f6368" style={{ marginRight: '1rem' }} />
            <input 
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
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
                fontSize: '1.1rem',
                color: '#0f172a',
                background: 'transparent'
              }}
            />
            {isSearchingDB && (
              <div style={{ position: 'absolute', right: '4rem', top: '50%', transform: 'translateY(-50%)' }}>
                <Loader2 size={16} color="#0071bd" className="spinner-animation" />
              </div>
            )}
            <button 
              onClick={onClose}
              style={{
                background: '#f1f5f9', border: '1px solid #e2e8f0', 
                borderRadius: '6px', padding: '0.2rem 0.5rem',
                fontSize: '0.7rem', color: 'var(--color-text-secondary)',
                cursor: 'pointer', fontWeight: 600
              }}
            >
              ESC
            </button>
          </div>

          {/* Results Area */}
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
            {combinedResults.length === 0 && !isSearchingDB ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No results found for "{query}"</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {combinedResults.map((item, index) => (
                  <div 
                    key={item.id}
                    onClick={() => handleSelect(item.path)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.65rem 1rem',
                      cursor: 'pointer',
                      backgroundColor: selectedIndex === index ? '#e8f0fe' : 'transparent',
                      borderLeft: selectedIndex === index ? '3px solid #1a73e8' : '3px solid transparent',
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: selectedIndex === index ? '#1a73e8' : '#5f6368',
                      marginRight: '1rem', flexShrink: 0
                    }}>
                      {ICONS[item.iconName] || <Search size={16} />}
                    </div>
                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                          {item.title}
                        </span>
                        <span style={{ 
                          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', 
                          color: 'var(--color-text-secondary)', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' 
                        }}>
                          {item.category}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description}
                      </p>
                    </div>
                    {/* Action Badge */}
                    {item.pendingAction && (
                      <div style={{ marginRight: '1rem' }}>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', 
                          color: '#b91c1c', backgroundColor: 'var(--color-danger-bg)', padding: '4px 8px', 
                          borderRadius: '4px', border: '1px solid #fecaca'
                        }}>
                          {item.pendingAction}
                        </span>
                      </div>
                    )}

                    {/* Enter Hint */}
                    {selectedIndex === index && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <kbd style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 4px' }}>↵</kbd>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Footer */}
          <div style={{ 
            padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-bg-app)', 
            borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem',
            fontSize: '0.75rem', color: 'var(--color-text-secondary)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <kbd style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1px 4px', fontSize: '0.65rem' }}>↑</kbd>
              <kbd style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1px 4px', fontSize: '0.65rem' }}>↓</kbd>
              to navigate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <kbd style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1px 4px', fontSize: '0.65rem' }}>↵</kbd>
              to select
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <kbd style={{ background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1px 4px', fontSize: '0.65rem' }}>esc</kbd>
              to close
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
            from { opacity: 0; transform: translateY(-10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spinner-animation {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </>
  );
}
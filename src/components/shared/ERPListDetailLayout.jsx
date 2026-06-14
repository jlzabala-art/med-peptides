import X from "lucide-react/dist/esm/icons/x";
import Search from "lucide-react/dist/esm/icons/search";
import Eye from "lucide-react/dist/esm/icons/eye";
import React, { useState, useEffect } from 'react';




/**
 * ERPListDetailLayout
 * Standard two-column layout: list on left, detail panel on right.
 * On mobile (< 768px): list shows full width; selecting an item
 * slides a full-screen detail drawer from the right.
 *
 * @param {Array}    items           - Array of records to display
 * @param {function} renderListItem  - (item, isSelected) => JSX for each row
 * @param {function} renderDetail    - (item, onClose) => JSX for detail panel
 * @param {function} getItemId       - (item) => unique ID string
 * @param {node}     emptyState      - JSX shown when no item is selected
 * @param {node}     headerLeft      - Left header content (title, subtitle)
 * @param {node}     headerActions   - Right header content (New button, filters)
 * @param {string}   searchQuery     - Controlled search text
 * @param {function} onSearchChange  - Callback for search changes
 * @param {string}   searchPlaceholder
 * @param {boolean}  loading         - Show loading skeleton
 * @param {string}   detailWidth     - Width of detail panel on desktop (default '58%')
 * @param {Array}    bulkActions     - Array of { label, onClick, variant? } for bulk selection
 */
export default function ERPListDetailLayout({
  items = [],
  renderListItem,
  renderDetail,
  getItemId,
  headerLeft,
  headerActions,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  loading = false,
  detailWidth = '58%',
  bulkActions = [],
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedBulkIds, setSelectedBulkIds] = useState(new Set());

  // Responsive detection
  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileDrawerOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Escape key closes mobile drawer
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const selectedItem = items.find(i => getItemId(i) === selectedId) || null;

  const handleSelect = (item) => {
    const id = getItemId(item);
    setSelectedId(id);
    if (isMobile) {
      setTimeout(() => setMobileDrawerOpen(true), 50);
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    setMobileDrawerOpen(false);
  };

  const handleToggleBulkSelect = (id, e) => {
    e.stopPropagation();
    setSelectedBulkIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBulkIds(new Set(items.map(i => getItemId(i))));
    } else {
      setSelectedBulkIds(new Set());
    }
  };

  const listWidth = selectedId && !isMobile ? `calc(100% - ${detailWidth} - 1px)` : '100%';

  return (
    <div style={{ 
      display: 'flex', 
      height: '100%', 
      minHeight: '75vh', 
      position: 'relative', 
      backgroundColor: '#f8fafc', 
      borderRadius: '16px', 
      overflow: 'hidden', 
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)'
    }}>

      {/* ── LEFT: LIST PANEL ─────────────────────────────────────────── */}
      <div style={{
        width: listWidth,
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: selectedId && !isMobile ? '1px solid #e2e8f0' : 'none',
        backgroundColor: 'white',
        minWidth: isMobile ? '100%' : '340px',
      }}>
        {/* List Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid #f1f5f9', 
          backgroundColor: 'white', 
          position: 'sticky', 
          top: 0, 
          zIndex: 10 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '1rem',
            gap: '1rem'
          }}>
            {selectedBulkIds.size > 0 && bulkActions.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', backgroundColor: '#eff6ff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedBulkIds.size === items.length && items.length > 0}
                    ref={input => {
                      if (input) {
                        input.indeterminate = selectedBulkIds.size > 0 && selectedBulkIds.size < items.length;
                      }
                    }}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e40af' }}>{selectedBulkIds.size} selected</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                  {bulkActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => { action.onClick(Array.from(selectedBulkIds)); setSelectedBulkIds(new Set()); }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: action.variant === 'danger' ? '#fef2f2' : 'white',
                        color: action.variant === 'danger' ? '#ef4444' : '#3b82f6',
                        border: `1px solid ${action.variant === 'danger' ? '#fecaca' : '#bfdbfe'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  {bulkActions.length > 0 && items.length > 0 && (
                    <input 
                      type="checkbox" 
                      checked={false}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', flexShrink: 0 }}
                    />
                  )}
                  <div>{headerLeft}</div>
                </div>
                {headerActions && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    alignItems: 'center',
                    flexShrink: 0
                  }}>
                    {headerActions}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Search container */}
          {onSearchChange && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="erp-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      border: 'none',
                      background: 'transparent',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.15s, color 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Record matching summary */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                fontSize: '0.72rem', 
                color: '#64748b', 
                fontWeight: 600,
                padding: '0 2px'
              }}>
                <span>{items.length} {items.length === 1 ? 'record' : 'records'} found</span>
                {searchQuery && (
                  <span style={{ 
                    color: '#2563eb', 
                    backgroundColor: '#eff6ff', 
                    padding: '1px 6px', 
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700
                  }}>Filtered</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* List Body */}
        <div className="erp-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <SkeletonList />
          ) : items.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', filter: 'grayscale(0.5)' }}>📋</div>
              <div style={{ fontWeight: 700, color: '#64748b', fontSize: '0.9rem' }}>No records found</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: '#94a3b8' }}>Try adjusting your search or filters.</div>
            </div>
          ) : (
            items.map(item => {
              const id = getItemId(item);
              const isSelected = id === selectedId;
              return (
                <div
                  key={id}
                  onClick={() => handleSelect(item)}
                  className={`erp-list-item ${isSelected ? 'selected' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: bulkActions.length > 0 ? '1.5rem' : undefined }}
                >
                  {bulkActions.length > 0 && (
                    <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={selectedBulkIds.has(id)}
                        onChange={(e) => handleToggleBulkSelect(id, e)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {renderListItem(item, isSelected)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT: DETAIL PANEL (Desktop) ────────────────────────────── */}
      {!isMobile && selectedItem && (
        <div className="erp-scroll" style={{
          width: detailWidth,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          overflowY: 'auto',
          animation: 'detailSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {renderDetail(selectedItem, handleClose)}
        </div>
      )}



      {/* ── MOBILE DRAWER ─────────────────────────────────────────────── */}
      {isMobile && selectedItem && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              backgroundColor: 'rgba(15, 23, 42, 0.3)', 
              zIndex: 100, 
              backdropFilter: 'blur(8px)',
              animation: 'fadeInBackdrop 0.25s ease-out'
            }}
          />
          {/* Drawer (iOS Spring Slide In) */}
          <div 
            className={`erp-mobile-drawer ${mobileDrawerOpen ? 'open' : ''}`}
            style={{
              position: 'fixed', 
              top: '40px',
              right: 0, 
              bottom: 0,
              left: 0,
              backgroundColor: '#f8fafc',
              zIndex: 101,
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 -16px 32px rgba(15, 23, 42, 0.15)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              overflow: 'hidden'
            }}
          >
            {/* iOS style drag handle indicator */}
            <div style={{
              width: '40px',
              height: '5px',
              backgroundColor: '#cbd5e1',
              borderRadius: '99px',
              margin: '0.75rem auto 0.25rem auto',
              flexShrink: 0
            }} />
            <div className="erp-scroll" style={{ flex: 1, overflowY: 'auto' }}>
              {renderDetail(selectedItem, handleClose)}
            </div>
          </div>
        </>
      )}

      <style>{`
        /* Thin elegant scrollbars */
        .erp-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .erp-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .erp-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 99px;
        }
        .erp-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }

        /* Search input transitions */
        .erp-search-input {
          width: 100%;
          padding: 0.55rem 2.25rem 0.55rem 2.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          outline: none;
          box-sizing: border-box;
          background-color: #f8fafc;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .erp-search-input:focus {
          border-color: #2563eb;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        /* List items styles */
        .erp-list-item {
          cursor: pointer;
          border-bottom: 1px solid #f1f5f9;
          border-left: 3.5px solid transparent;
          background-color: #ffffff;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .erp-list-item:hover {
          background-color: #fafbfd;
        }
        .erp-list-item.selected {
          background-color: #eff6ff;
          border-left-color: #2563eb;
        }

        /* Mobile drawer drawer animation */
        .erp-mobile-drawer {
          transform: translateY(100%);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .erp-mobile-drawer.open {
          transform: translateY(0);
        }

        @keyframes detailSlideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 16px rgba(59,130,246,0.06); }
          50% { transform: scale(1.04); box-shadow: 0 8px 24px rgba(59,130,246,0.12); }
        }
        .pulse-glow-icon {
          animation: pulseGlow 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

// ── Skeleton loader for list items ──────────────────────────────────────────
function SkeletonList() {
  return (
    <div style={{ padding: '0.25rem 0' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ 
            height: '14px', 
            width: '65%', 
            borderRadius: '4px', 
            backgroundColor: '#e2e8f0', 
            marginBottom: '8px', 
            animation: 'pulseShimmer 1.5s ease-in-out infinite' 
          }} />
          <div style={{ 
            height: '11px', 
            width: '40%', 
            borderRadius: '4px', 
            backgroundColor: '#f1f5f9', 
            animation: 'pulseShimmer 1.5s ease-in-out infinite 0.2s' 
          }} />
        </div>
      ))}
      <style>{`
        @keyframes pulseShimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
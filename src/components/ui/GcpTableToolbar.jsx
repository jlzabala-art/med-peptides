"use client";

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, SlidersHorizontal, Columns, Download, Check, RotateCcw, Activity } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

/**
 * GcpTableToolbar
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console style unified table utility toolbar.
 * Provides:
 *  1. Live telemetry & record counter with pulsing status beacon.
 *  2. Real-time Refresh button with spin animation and timestamp tooltip.
 *  3. Display Density switcher (Comfortable ↔ Compact) via PreferencesContext.
 *  4. Columns customizer popover (Show/Hide optional columns with search & reset).
 *  5. Direct CSV export action.
 * 
 * Mobile & Desktop responsive (Golden Rule #23).
 */
export default function GcpTableToolbar({
  totalCount = 0,
  itemNoun = 'records',
  isLoading = false,
  onRefresh,
  lastUpdated,
  columns = [],
  visibleColumns = null,
  onToggleColumn,
  onResetColumns,
  onExportCsv,
  enableExport = false,
  customActions = null,
}) {
  const { density = 'comfortable', updateDensity } = usePreferences?.() || {};
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showColMenu, setShowColMenu] = useState(false);
  const [colSearch, setColSearch] = useState('');
  const [relativeTime, setRelativeTime] = useState('Just now');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Auto-update relative time string
  useEffect(() => {
    const updateTime = () => {
      if (!lastUpdated) {
        setRelativeTime('Just now');
        return;
      }
      const diffMs = Date.now() - new Date(lastUpdated).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) setRelativeTime('Just now');
      else if (diffMins === 1) setRelativeTime('1m ago');
      else if (diffMins < 60) setRelativeTime(`${diffMins}m ago`);
      else setRelativeTime(`${Math.floor(diffMins / 60)}h ago`);
    };

    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Handle click outside column menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setShowColMenu(false);
      }
    };
    if (showColMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColMenu]);

  const handleRefreshClick = async () => {
    if (isRefreshing || !onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const toggleDensity = () => {
    const nextDensity = density === 'compact' ? 'comfortable' : 'compact';
    updateDensity?.(nextDensity);
  };

  // Filter customizable columns (exclude actions and expanders from toggling)
  const customizableColumns = (columns || []).filter(c => {
    const key = c.key || c.header || c.label;
    if (!key) return false;
    if (c.isAction || key === 'actions' || key === 'expand' || key === 'selection') return false;
    return true;
  });

  const visibleCustomCount = customizableColumns.filter(c => {
    const key = c.key || c.header || c.label;
    return visibleColumns ? visibleColumns.includes(key) : true;
  }).length;

  const filteredColList = customizableColumns.filter(c => {
    const label = String(c.header || c.label || c.key || '');
    return label.toLowerCase().includes(colSearch.toLowerCase());
  });

  return (
    <div
      className="gcp-table-toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        borderLeft: '1px solid #e2e8f0',
        borderRight: '1px solid #e2e8f0',
        borderRadius: '8px 8px 0 0',
        minHeight: '38px',
        fontSize: '0.78rem',
        color: '#475569',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      <style>{`
        @keyframes gcpPulseLiveBeacon {
          0% { transform: scale(0.95); opacity: 0.85; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          70% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); opacity: 0.85; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes gcpSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .gcp-toolbar-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 8px;
          border-radius: 5px;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: #334155;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .gcp-toolbar-btn:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }
        .gcp-toolbar-btn.is-active {
          background-color: #eff6ff;
          border-color: #93c5fd;
          color: #1d4ed8;
        }
        .gcp-col-menu-popover {
          position: absolute;
          right: 0;
          top: calc(100% + 4px);
          width: 220px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          z-index: 50;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        @media (max-width: 640px) {
          .gcp-toolbar-hide-mobile {
            display: none !important;
          }
          .gcp-toolbar-btn {
            padding: 0 6px;
            font-size: 0.72rem;
          }
        }
      `}</style>

      {/* LEFT: Live Status Beacon & Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          title="Live Synced with Cloud Database"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#ffffff',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontWeight: 700,
            fontSize: '0.74rem',
            color: '#15803d',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              animation: 'gcpPulseLiveBeacon 2s infinite',
            }}
          />
          <span>Live</span>
        </div>

        <span style={{ fontWeight: 600, color: '#334155' }}>
          <strong>{totalCount}</strong> {totalCount === 1 ? (itemNoun.endsWith('s') ? itemNoun.slice(0, -1) : itemNoun) : itemNoun}
        </span>

        <span className="gcp-toolbar-hide-mobile" style={{ color: '#94a3b8' }}>•</span>
        <span className="gcp-toolbar-hide-mobile" style={{ fontSize: '0.72rem', color: '#64748b' }}>
          Updated {relativeTime}
        </span>
      </div>

      {/* RIGHT: GCP Utilities Toolbar (Refresh, Density, Columns, Export) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
        {customActions}

        {/* Refresh Action */}
        {onRefresh && (
          <button
            type="button"
            className="gcp-toolbar-btn"
            onClick={handleRefreshClick}
            title={`Refresh data (Updated ${relativeTime})`}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw
              size={13}
              style={{
                animation: (isRefreshing || isLoading) ? 'gcpSpin 0.8s linear infinite' : 'none',
                color: '#475569',
              }}
            />
            <span className="gcp-toolbar-hide-mobile">Refresh</span>
          </button>
        )}

        {/* Display Density Switcher */}
        <button
          type="button"
          className={`gcp-toolbar-btn ${density === 'compact' ? 'is-active' : ''}`}
          onClick={toggleDensity}
          title={`Switch to ${density === 'compact' ? 'Comfortable' : 'Compact'} row density`}
        >
          <SlidersHorizontal size={13} />
          <span className="gcp-toolbar-hide-mobile">
            {density === 'compact' ? 'Compact' : 'Comfortable'}
          </span>
        </button>

        {/* Columns Customizer */}
        {customizableColumns.length > 0 && onToggleColumn && (
          <div style={{ position: 'relative' }}>
            <button
              ref={buttonRef}
              type="button"
              className={`gcp-toolbar-btn ${showColMenu ? 'is-active' : ''}`}
              onClick={() => setShowColMenu(!showColMenu)}
              title="Customize visible table columns"
            >
              <Columns size={13} />
              <span className="gcp-toolbar-hide-mobile">Columns</span>
              <span
                style={{
                  backgroundColor: visibleCustomCount === customizableColumns.length ? '#f1f5f9' : '#dbeafe',
                  color: visibleCustomCount === customizableColumns.length ? '#64748b' : '#1d4ed8',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                }}
              >
                {visibleCustomCount}/{customizableColumns.length}
              </span>
            </button>

            {/* Column Toggle Popover */}
            {showColMenu && (
              <div ref={menuRef} className="gcp-col-menu-popover">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>Display Columns</span>
                  {onResetColumns && (
                    <button
                      type="button"
                      onClick={() => {
                        onResetColumns();
                        setShowColMenu(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '0.70rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <RotateCcw size={10} /> Reset
                    </button>
                  )}
                </div>

                {customizableColumns.length > 5 && (
                  <input
                    type="text"
                    placeholder="Filter columns..."
                    value={colSearch}
                    onChange={(e) => setColSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      outline: 'none',
                    }}
                  />
                )}

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {filteredColList.map((col, idx) => {
                    const colKey = col.key || col.header || col.label;
                    const isVis = visibleColumns ? visibleColumns.includes(colKey) : true;
                    return (
                      <label
                        key={`col-tog-${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: isVis ? '#f8fafc' : 'transparent',
                          fontSize: '0.74rem',
                          color: isVis ? '#0f172a' : '#94a3b8',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isVis}
                          onChange={() => onToggleColumn(colKey)}
                          style={{ cursor: 'pointer', accentColor: '#003666' }}
                        />
                        <span style={{ fontWeight: isVis ? 600 : 400, flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {col.header || col.label || colKey}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick CSV Export */}
        {enableExport && onExportCsv && (
          <button
            type="button"
            className="gcp-toolbar-btn"
            onClick={onExportCsv}
            title="Export view to CSV"
          >
            <Download size={13} />
            <span className="gcp-toolbar-hide-mobile">Export</span>
          </button>
        )}
      </div>
    </div>
  );
}

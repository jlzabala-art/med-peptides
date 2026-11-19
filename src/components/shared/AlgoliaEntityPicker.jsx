'use client';

import React, { useEffect, useRef, useState } from 'react';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import { useAlgoliaSearch } from '@/hooks/useAlgoliaSearch';

/**
 * AlgoliaEntityPicker
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified reusable Algolia autocomplete picker powered by `useAlgoliaSearch` +
 * `GlobalSearchBar`. Eliminates duplicate dropdown/debounce boilerplate across
 * `/calculator`, `/labels`, `/rx/intake`, and admin pickers.
 */
export default function AlgoliaEntityPicker({
  indexName = 'products',
  value = '',
  onChange = null,
  onSelect = null,
  placeholder = 'Search via Algolia...',
  fallbackItems = [],
  sortHits = null,
  renderItem = null,
  headerLabel = 'Algolia Results',
  fallbackHeaderLabel = 'Quick Select',
  storageNamespace = 'algolia-picker',
  hitsPerPage = 10,
  size = 'lg',
  isEs = false,
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const { hits, loading, isLoading: altLoading } = useAlgoliaSearch({
    indexName,
    query: open && String(value || '').trim().length >= 2 ? value : '',
    hitsPerPage,
    debounceMs: 220,
  });
  const isSearching = Boolean(loading || altLoading);

  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const rawHits = hits && hits.length > 0 ? hits : [];
  const orderedHits = sortHits ? sortHits(rawHits) : rawHits;
  const displayList = orderedHits.length > 0 ? orderedHits : fallbackItems;

  const handleSelectItem = (item, extra = null) => {
    setOpen(false);
    onSelect?.(item, extra);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
      >
        <GlobalSearchBar
          value={value}
          onChange={(val) => {
            onChange?.(val);
            setOpen(true);
          }}
          placeholder={placeholder}
          size={size}
          lang={isEs ? 'es' : 'en'}
          isLoading={isSearching}
          resultCount={open ? displayList.length : undefined}
          namespace={storageNamespace}
          disableAlgolia={true}
          showRecent={false}
          showShortcut={false}
        />
      </div>

      {open && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 120,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
            maxHeight: '360px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          <div
            style={{
              padding: '4px 8px 6px',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>
              {isSearching
                ? (isEs ? 'Buscando péptidos...' : 'Searching peptides...')
                : orderedHits.length > 0
                  ? headerLabel
                  : fallbackHeaderLabel}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {isEs ? 'Cerrar' : 'Close'}
            </button>
          </div>

          {displayList.map((item, idx) => {
            const key = item.objectID || item.id || item.slug || idx;
            if (renderItem) {
              return (
                <React.Fragment key={key}>
                  {renderItem(item, (extra) => handleSelectItem(item, extra))}
                </React.Fragment>
              );
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectItem(item)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  border: 'none',
                  borderBottom: '1px solid #f1f5f9',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                {item.name || item.title || key}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

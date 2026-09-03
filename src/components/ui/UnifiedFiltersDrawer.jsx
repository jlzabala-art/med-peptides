'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Check, 
  Search, 
  ChevronDown, 
  ChevronRight,
  SlidersHorizontal,
  Layers,
  FlaskConical,
  Building,
  ShieldCheck
} from '@/lib/icons';

const DEFAULT_SECTION_CONFIG = {
  clinical: {
    label: 'Clinical & Programs',
    icon: FlaskConical,
    color: '#0284c7',
    bg: '#f0f9ff'
  },
  product: {
    label: 'Product Formulations & Types',
    icon: Layers,
    color: '#7c3aed',
    bg: '#faf5ff'
  },
  sourcing: {
    label: 'Sourcing & Supply Chain',
    icon: Building,
    color: '#059669',
    bg: '#ecfdf5'
  },
  operations: {
    label: 'Quality & Operations',
    icon: ShieldCheck,
    color: '#d97706',
    bg: '#fffbeb'
  },
  general: {
    label: 'General Filters',
    icon: SlidersHorizontal,
    color: '#475569',
    bg: '#f8fafc'
  }
};

function inferFilterSection(key = '') {
  const k = key.toLowerCase();
  if (k.includes('tag') || k.includes('priority') || k.includes('goal') || k.includes('clinical') || k.includes('program') || k.includes('subcat')) {
    return 'clinical';
  }
  if (k.includes('type') || k.includes('producttype') || k.includes('cat') || k.includes('format') || k.includes('presentation') || k.includes('form')) {
    return 'product';
  }
  if (k.includes('suppl') || k.includes('vendor') || k.includes('stock') || k.includes('avail') || k.includes('source')) {
    return 'sourcing';
  }
  if (k.includes('qual') || k.includes('date') || k.includes('time') || k.includes('status') || k.includes('audit')) {
    return 'operations';
  }
  return 'general';
}

/**
 * FilterDropboxField — Compact, elegant dropdown selector for each filter dimension inside the drawer
 */
function FilterDropboxField({ group, isMulti = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const selectedValues = isMulti 
    ? (Array.isArray(group.values) ? group.values : []) 
    : [group.value].filter(v => v !== undefined && v !== null && v !== '' && v !== 'all');

  const options = group.options || [];

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase();
    return options.filter(o => 
      String(o.label || o.name || '').toLowerCase().includes(q) ||
      String(o.value || '').toLowerCase().includes(q)
    );
  }, [options, searchTerm]);

  // Compute display text for trigger button
  const triggerSummary = useMemo(() => {
    if (selectedValues.length === 0) {
      return `All ${group.pluralLabel || group.label || 'Options'}`;
    }
    if (selectedValues.length === 1) {
      const match = options.find(o => String(o.value) === String(selectedValues[0]));
      return match ? match.label : String(selectedValues[0]);
    }
    const firstMatch = options.find(o => String(o.value) === String(selectedValues[0]));
    const firstLabel = firstMatch ? firstMatch.label : String(selectedValues[0]);
    return `${firstLabel} +${selectedValues.length - 1} more`;
  }, [selectedValues, options, group]);

  const hasActive = selectedValues.length > 0;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Field Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <label style={{
          fontSize: '0.76rem',
          fontWeight: 700,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>{group.label}</span>
          {hasActive && (
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              padding: '1px 6px',
              borderRadius: '8px'
            }}>
              {selectedValues.length}
            </span>
          )}
        </label>
        {hasActive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isMulti) group.onChange?.([]);
              else group.onChange?.('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Dropbox Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: hasActive ? '#f0f9ff' : '#ffffff',
          border: hasActive ? '1px solid #38bdf8' : '1px solid #cbd5e1',
          borderRadius: '8px',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '0.84rem',
          color: hasActive ? '#0369a1' : '#1e293b',
          fontWeight: hasActive ? 600 : 500,
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(56, 189, 248, 0.2)' : 'none'
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginRight: '8px',
          flex: 1
        }}>
          {triggerSummary}
        </span>
        <ChevronDown 
          size={15} 
          color={hasActive ? '#0284c7' : '#94a3b8'} 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} 
        />
      </button>

      {/* Popdown Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 10000,
          maxHeight: '260px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Internal search for lists with more than 5 options */}
          {options.length > 5 && (
            <div style={{
              padding: '6px 8px',
              borderBottom: '1px solid #f1f5f9',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Search size={13} color="#94a3b8" />
              <input
                type="text"
                placeholder={`Search ${group.label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.8rem',
                  color: '#1e293b'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Options Scroll List */}
          <div style={{
            overflowY: 'auto',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center' }}>
                No matches found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = isMulti
                  ? selectedValues.includes(opt.value)
                  : group.value === opt.value || (opt.value === 'all' && (!group.value || group.value === 'all'));

                const hasCount = typeof opt.count === 'number';

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      if (isMulti) {
                        const next = isSelected
                          ? selectedValues.filter(v => v !== opt.value)
                          : [...selectedValues, opt.value];
                        group.onChange?.(next);
                      } else {
                        group.onChange?.(opt.value);
                        setIsOpen(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      color: isSelected ? '#1e40af' : '#1e293b',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: isMulti ? '3px' : '50%',
                        border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0
                      }}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opt.label}
                      </span>
                    </div>

                    {hasCount && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: isSelected ? '#2563eb' : '#94a3b8',
                        backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        flexShrink: 0
                      }}>
                        {opt.count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnifiedFiltersDrawer({
  isOpen,
  onClose,
  filterOptions = [],
  activeFilters = [],
  onClearAll,
  resultCount,
  isMobile = false
}) {
  const [mounted, setMounted] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    // Keep clinical and product open by default, collapse sourcing and operations for single-screen fit
    sourcing: true,
    operations: true,
    general: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strict Body Scroll Locking (Golden Rule UX) — Prevents any background scroll leak
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [isOpen]);

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Group filterOptions into logical sections
  const sections = useMemo(() => {
    const map = {};
    filterOptions.forEach((fo) => {
      const secKey = fo.section || inferFilterSection(fo.key || fo.id);
      if (!map[secKey]) {
        map[secKey] = {
          key: secKey,
          config: DEFAULT_SECTION_CONFIG[secKey] || DEFAULT_SECTION_CONFIG.general,
          groups: []
        };
      }
      map[secKey].groups.push(fo);
    });

    // Ensure predictable order: Clinical, Product, Sourcing, Operations
    const order = ['clinical', 'product', 'sourcing', 'operations', 'general'];
    return order
      .map(k => map[k])
      .filter(Boolean)
      .filter(sec => sec.groups.length > 0);
  }, [filterOptions]);

  const activeCount = useMemo(() => {
    return filterOptions.reduce((acc, fo) => {
      if (fo.multiSelect) {
        return acc + (Array.isArray(fo.values) ? fo.values.length : 0);
      }
      return acc + (fo.value && fo.value !== 'all' && fo.value !== '' ? 1 : 0);
    }, 0);
  }, [filterOptions]);

  if (!isOpen || !mounted) return null;

  const drawerContent = (
    <>
      {/* Backdrop — Full-screen overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)',
          zIndex: 99998,
          animation: 'fadeIn 0.15s ease-out'
        }}
      />

      {/* Drawer Container (Desktop: Right Slide-out 480px; Mobile: Full-width) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: isMobile ? '100vw' : '480px',
          height: '100dvh',
          maxHeight: '100dvh',
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 35px rgba(0,0,0,0.25)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          animation: isMobile ? 'sheetSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'drawerSlideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <style>{`
          @keyframes drawerSlideLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes sheetSlideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* 1. Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(0, 54, 102, 0.08)',
              color: 'var(--color-primary, #003666)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Filter & Refine
                </h3>
                {activeCount > 0 && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    backgroundColor: 'var(--color-primary, #003666)',
                    color: '#ffffff',
                    padding: '1px 7px',
                    borderRadius: '10px'
                  }}>
                    {activeCount} active
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                Refine by programs, suppliers, formulations, and quality
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Reset All
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Sections Body with Compact Dropboxes */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          backgroundColor: '#f8fafc'
        }}>
          {sections.map((sec) => {
            const isCollapsed = collapsedSections[sec.key];
            const SecIcon = sec.config.icon;

            const sectionActiveCount = sec.groups.reduce((acc, fo) => {
              if (fo.multiSelect) return acc + (Array.isArray(fo.values) ? fo.values.length : 0);
              return acc + (fo.value && fo.value !== 'all' && fo.value !== '' ? 1 : 0);
            }, 0);

            return (
              <div 
                key={sec.key}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  overflow: 'visible'
                }}
              >
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(sec.key)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#ffffff',
                    border: 'none',
                    borderBottom: isCollapsed ? 'none' : '1px solid #f1f5f9',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: sec.config.bg,
                      color: sec.config.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <SecIcon size={14} />
                    </div>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                      {sec.config.label}
                    </span>
                    {sectionActiveCount > 0 && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: sec.config.bg,
                        color: sec.config.color,
                        border: `1px solid ${sec.config.color}33`,
                        padding: '1px 6px',
                        borderRadius: '8px'
                      }}>
                        {sectionActiveCount} active
                      </span>
                    )}
                  </div>
                  {isCollapsed ? <ChevronRight size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                </button>

                {/* Section Dropboxes Form */}
                {!isCollapsed && (
                  <div style={{
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {sec.groups.map((group, gIdx) => (
                      <FilterDropboxField
                        key={group.key || group.id || `g-${gIdx}`}
                        group={group}
                        isMulti={group.multiSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 3. Sticky Action Bar Footer (Always visible sticker) */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          zIndex: 50,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {resultCount !== undefined && (
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#475569' }}>
                Showing <strong style={{ color: '#0f172a', fontWeight: 800 }}>{resultCount}</strong> results
              </span>
            )}
            {activeCount > 0 ? (
              <span style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700 }}>
                ● {activeCount} filter{activeCount === 1 ? '' : 's'} active
              </span>
            ) : (
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 500 }}>
                No filters applied
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#fff1f2',
                  color: '#e11d48',
                  border: '1px solid #fecaca',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#ffe4e6';
                  e.currentTarget.style.borderColor = '#fda4af';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#fff1f2';
                  e.currentTarget.style.borderColor = '#fecaca';
                }}
              >
                Reset All
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary, #003666)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 54, 102, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.92';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Check size={16} />
              <span>Done & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}

"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';

export default function SearchableSelect({
  value,
  onChange,
  label,
  placeholder = "Search...",
  options = [], // [{label, value}]
  disabled = false,
  onCreateNew = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});

  // Current selected option label
  const selectedLabel = useMemo(() => {
    const opt = options.find(o => o.value === value);
    return opt ? opt.label : '';
  }, [value, options]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Calculate portal position based on trigger rect
  const updatePosition = useCallback(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = Math.max(rect.width, 220);
    const menuMaxHeight = 300;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const flipUp = spaceBelow < menuMaxHeight && spaceAbove > spaceBelow;

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: menuWidth,
      zIndex: 99999,
      ...(flipUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [isOpen]);

  useEffect(() => {
    updatePosition();
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click (check both trigger and portalled menu)
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt => 
      (opt.label || '').toLowerCase().includes(term) || 
      (opt.subLabel || '').toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const menuContent = isOpen ? (
    <div
      ref={menuRef}
      style={{
        ...menuStyle,
        backgroundColor: 'var(--surface-raised, #fff)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '300px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search..."
            style={{
              width: '100%',
              padding: '0.4rem 0.4rem 0.4rem 2rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>
      
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filteredOptions.length > 0 ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: '4px' }}>
            {filteredOptions.map((opt, idx) => {
              const isSelected = opt.value === value;
              return (
                <li 
                  key={idx}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: isSelected ? 'var(--color-primary)' : 'var(--text-main)',
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '6px',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle, #f1f5f9)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = isSelected ? 'var(--primary-light)' : 'transparent'; }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.label}</span>
                    {opt.subLabel && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.subLabel}</span>}
                  </div>
                  {isSelected && <Check size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />}
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>No results found</div>
        )}
      </div>
      
      {onCreateNew && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem', flexShrink: 0 }}>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onCreateNew();
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            + Create New
          </button>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div ref={triggerRef} style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem', display: 'block' }}>{label}</label>}
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ 
          position: 'relative',
          width: '100%', 
          padding: '0.65rem 2.25rem 0.65rem 0.75rem', 
          borderRadius: '8px', 
          border: isOpen ? '1px solid var(--color-primary)' : '1px solid var(--border)', 
          fontSize: '0.9rem',
          backgroundColor: disabled ? 'var(--color-bg-subtle)' : 'var(--color-bg-input, #fff)',
          color: disabled ? 'var(--text-muted)' : 'var(--text-main)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? '0 0 0 1px var(--color-primary)' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {selectedLabel || <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>}
        <ChevronDown size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      </div>

      {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Check, ChevronDown, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchableDropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  disabled = false,
  inline = false, // True if used inside a table cell
  className = "",
  displayValue,
  triggerMaxWidth = undefined // Optional max-width for inline trigger to truncate long labels
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});

  // Find the selected option to display its label
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = displayValue !== undefined ? displayValue : (selectedOption ? selectedOption.label : value);

  // Calculate position when opening or scrolling
  const updatePosition = () => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      // Only update if dimensions actually changed significantly to avoid infinite loops
      setMenuStyle(prev => {
        const newTop = rect.bottom + window.scrollY;
        const newLeft = rect.left + window.scrollX;
        const newWidth = Math.max(rect.width, 200);
        
        if (Math.abs(prev.top - newTop) > 1 || Math.abs(prev.left - newLeft) > 1 || prev.width !== newWidth) {
          return {
            position: 'absolute',
            top: newTop,
            left: newLeft,
            width: newWidth,
            zIndex: 99999, // Extremely high z-index to ensure it sits on top of everything
          };
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener('scroll', updatePosition, true); // true = capture phase for all scrolling
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reset search term when opening
  useEffect(() => {
    if (isOpen) setSearchTerm("");
  }, [isOpen]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const inlineStyles = inline ? {
    padding: '4px 8px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    minHeight: '28px',
  } : {
    padding: '8px 12px',
    border: '1px solid var(--border, #e2e8f0)',
    backgroundColor: 'var(--color-bg-surface, #fff)',
    minHeight: '38px',
  };

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="searchable-dropdown-menu"
          style={{ 
            ...menuStyle,
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-bg-surface, #fff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: '1px solid var(--border-light, #f1f5f9)', backgroundColor: 'var(--color-bg-subtle, #f8fafc)', flexShrink: 0 }}>
            <Search size={14} style={{ color: 'var(--text-muted, #94a3b8)', marginRight: '8px' }} />
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              style={{ width: '100%', padding: '8px 0', backgroundColor: 'transparent', fontSize: '0.875rem', color: 'var(--text-main, #1e293b)', border: 'none', outline: 'none' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} style={{ color: 'var(--text-muted, #94a3b8)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={`${opt.value ?? ''}-${idx}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', fontSize: '0.875rem', cursor: 'pointer', borderRadius: '6px',
                    backgroundColor: value === opt.value ? 'var(--primary-light, #e0f2fe)' : 'transparent',
                    color: value === opt.value ? 'var(--primary, #0369a1)' : 'var(--text-main, #334155)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (value !== opt.value) e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle, #f1f5f9)';
                  }}
                  onMouseLeave={(e) => {
                    if (value !== opt.value) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
                  {value === opt.value && <Check size={14} style={{ color: 'var(--primary, #2563eb)', marginLeft: '8px', flexShrink: 0 }} />}
                </div>
              ))
            ) : (
              <div style={{ padding: '16px 12px', fontSize: '0.875rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                No results found
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ width: '100%', minWidth: inline ? 'auto' : '120px' }}>
      {inline ? (
        <div 
          className="inline-editable-trigger"
          onClick={(e) => {
            if (disabled) return;
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 4px',
            margin: '-2px -4px',
            borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            opacity: disabled ? 0.5 : 1
          }}
          title="Click to select"
          onMouseEnter={(e) => {
            if (disabled) return;
            e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle, #f1f5f9)';
            const icon = e.currentTarget.querySelector('.edit-icon');
            if (icon) icon.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            if (disabled) return;
            e.currentTarget.style.backgroundColor = 'transparent';
            const icon = e.currentTarget.querySelector('.edit-icon');
            if (icon) icon.style.opacity = '0.7';
          }}
        >
          <span 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: triggerMaxWidth || 'none',
              lineHeight: 1.2
            }}
            title={displayLabel || placeholder}
          >
            {!displayLabel ? <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{placeholder}</span> : displayLabel}
          </span>
          <span className="edit-icon" style={{ opacity: 0.7, transition: 'opacity 0.2s', color: 'var(--color-primary)', flexShrink: 0 }}>
            <Edit2 size={12} />
          </span>
        </div>
      ) : (
        <div 
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: '6px', transition: 'border-color 0.2s',
            opacity: disabled ? 0.5 : 1,
            ...inlineStyles
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.borderColor = 'var(--text-muted, #94a3b8)';
          }}
          onMouseLeave={(e) => {
            if (!disabled) e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
          }}
          onClick={(e) => {
            if (disabled) return;
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem', color: !displayLabel ? 'var(--text-muted, #94a3b8)' : 'var(--text-main, #1e293b)' }}>
            {displayLabel || placeholder}
          </span>
          <ChevronDown size={14} style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0, marginLeft: '8px' }} />
        </div>
      )}

      {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </div>
  );
}

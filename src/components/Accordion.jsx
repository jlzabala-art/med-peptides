import React, { useState } from 'react';
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";

export function AccordionItem({ 
  id, 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle, 
  children,
  badge
}) {
  return (
    <div style={{
      borderBottom: '1px solid var(--border-light)',
      backgroundColor: isOpen ? 'rgba(56, 189, 248, 0.02)' : 'transparent',
      transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
        id={`accordion-btn-${id}`}
        style={{
          width: '100%',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '1rem',
          outline: 'none',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {Icon && <Icon size={18} style={{ color: isOpen ? 'var(--secondary)' : 'var(--text-muted)', transition: 'color 0.25s' }} />}
          <span style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: isOpen ? 'var(--primary)' : 'var(--text-main)',
            transition: 'color 0.25s',
          }}>
            {title}
          </span>
          {badge && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '100px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--secondary)',
            }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ 
          color: isOpen ? 'var(--secondary)' : 'var(--text-muted)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s',
          display: 'flex',
          alignItems: 'center',
        }}>
          <ChevronDown size={18} />
        </span>
      </button>
      
      <div
        id={`accordion-content-${id}`}
        role="region"
        aria-labelledby={`accordion-btn-${id}`}
        style={{
          maxHeight: isOpen ? '2000px' : '0px',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: isOpen 
            ? 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-in'
            : 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease-out',
        }}
      >
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Accordion({ 
  children, 
  allowMultiple = false,
  defaultOpenId = null
}) {
  const [openIds, setOpenIds] = useState(() => {
    if (defaultOpenId !== null) {
      return allowMultiple ? [defaultOpenId] : defaultOpenId;
    }
    return allowMultiple ? [] : null;
  });

  const handleToggle = (id) => {
    if (allowMultiple) {
      setOpenIds(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else {
      setOpenIds(prev => (prev === id ? null : id));
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.015)',
      overflow: 'hidden',
      width: '100%',
    }}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        const id = child.props.id;
        const isOpen = allowMultiple 
          ? openIds.includes(id) 
          : openIds === id;
        
        return React.cloneElement(child, {
          isOpen,
          onToggle: () => handleToggle(id)
        });
      })}
    </div>
  );
}

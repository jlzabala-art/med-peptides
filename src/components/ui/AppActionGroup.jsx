import React, { useState, useRef, useEffect } from 'react';
import { Eye, Edit, Link, DollarSign, Mail, Archive, Trash2, CheckCircle, XCircle, MoreHorizontal, EyeOff, Download, Package, ClipboardList, Bot } from 'lucide-react';

const ACTION_CONFIG = {
  view: { icon: Eye, label: 'View', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  edit: { icon: Edit, label: 'Edit', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  assign: { icon: Link, label: 'Assign / Link', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  pricing: { icon: DollarSign, label: 'Pricing', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-success)' },
  send: { icon: Mail, label: 'Send Email', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  approve: { icon: CheckCircle, label: 'Approve', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-success)' },
  revoke: { icon: XCircle, label: 'Revoke', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-warning)' },
  archive: { icon: Archive, label: 'Archive', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-warning)' },
  hide: { icon: EyeOff, label: 'Hide', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-warning)' },
  show: { icon: Eye, label: 'Show', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-success)' },
  download: { icon: Download, label: 'Download', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  inventory: { icon: Package, label: 'Inventory', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  protocols: { icon: ClipboardList, label: 'Protocols', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  ai: { icon: Bot, label: 'AI Consult', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  delete: { icon: Trash2, label: 'Delete', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-danger)' },
  contact: { icon: Mail, label: 'Contact', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
};

export default function AppActionGroup({ actions, maxVisible = 2 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);
  
  const order = ['view', 'edit', 'assign', 'pricing', 'send', 'approve', 'revoke', 'archive', 'hide', 'show', 'download', 'delete'];
  
  const sortedActions = [...actions].sort((a, b) => {
    return order.indexOf(a.type) - order.indexOf(b.type);
  });

  const visibleActions = sortedActions.slice(0, maxVisible);
  const hiddenActions = sortedActions.slice(maxVisible);

  const renderButton = (action, idx) => {
    const config = ACTION_CONFIG[action.type];
    if (!config) return null;
    const Icon = config.icon;
    
    return (
      <button
        key={idx}
        onClick={(e) => {
          e.stopPropagation();
          action.onClick(e);
        }}
        title={config.label}
        style={{
          width: 'var(--action-btn-size, 40px)',
          height: 'var(--action-btn-size, 40px)',
          minWidth: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          color: config.color,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
          e.currentTarget.style.color = config.hoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = config.color;
        }}
      >
        <Icon size={18} />
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center', position: 'relative' }} ref={menuRef}>
      {visibleActions.map((action, idx) => renderButton(action, idx))}
      
      {hiddenActions.length > 0 && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            title="More actions"
            style={{
              width: 'var(--action-btn-size, 40px)',
              height: 'var(--action-btn-size, 40px)',
              minWidth: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: menuOpen ? 'var(--color-bg-hover)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
            onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 100,
              minWidth: '140px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {hiddenActions.map((action, idx) => {
                const config = ACTION_CONFIG[action.type];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      action.onClick(e);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.6rem 1rem',
                      background: 'none',
                      border: 'none',
                      borderBottom: idx < hiddenActions.length - 1 ? '1px solid var(--color-border)' : 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: 'var(--color-text-main)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      e.currentTarget.style.color = config.hoverColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-main)';
                    }}
                  >
                    <Icon size={16} color={config.color} />
                    {config.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

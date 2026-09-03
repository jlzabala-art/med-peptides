"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Eye, Edit, Link, DollarSign, Mail, Archive, Trash2, 
  CheckCircle, XCircle, MoreHorizontal, EyeOff, Download, Package, 
  ClipboardList, Bot, Copy, UserCheck, FilePlus, UserPlus, ShoppingCart, 
  Sparkles, Play, Pause, BarChart3, Layers, Activity, FileText, Send, Share2,
  Clock, QrCode
} from '@/lib/icons';

const ACTION_CONFIG = {
  offers: { icon: Layers, label: 'Price Comparison & Offers', color: '#0284c7', hoverColor: '#0369a1' },
  list: { icon: Layers, label: 'Price Comparison & Offers', color: '#0284c7', hoverColor: '#0369a1' },
  view: { icon: Eye, label: 'View Details', color: '#475569', hoverColor: '#0f172a' },
  sparkles: { icon: Sparkles, label: 'Ask ClinicalAI', color: '#7c3aed', hoverColor: '#6d28d9' },
  enrich: { icon: Sparkles, label: 'AI Clinical Enrichment', color: '#7c3aed', hoverColor: '#6d28d9' },
  clone: { icon: Copy, label: 'Clone', color: '#2563eb', hoverColor: '#1d4ed8' },
  edit: { icon: Edit, label: 'Edit', color: '#0284c7', hoverColor: '#0369a1' },
  impersonate: { icon: UserCheck, label: 'Login As', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  assign: { icon: Link, label: 'Assign / Link', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  pricing: { icon: DollarSign, label: 'Pricing', color: '#059669', hoverColor: '#047857' },
  send: { icon: Mail, label: 'Send Email', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  approve: { icon: CheckCircle, label: 'Approve', color: '#059669', hoverColor: '#047857' },
  revoke: { icon: XCircle, label: 'Revoke', color: '#d97706', hoverColor: '#b45309' },
  archive: { icon: Archive, label: 'Archive', color: '#d97706', hoverColor: '#b45309' },
  hide: { icon: EyeOff, label: 'Hide', color: '#64748b', hoverColor: '#334155' },
  show: { icon: Eye, label: 'Show', color: '#059669', hoverColor: '#047857' },
  download: { icon: Download, label: 'Download', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  inventory: { icon: Package, label: 'Inventory', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  protocols: { icon: ClipboardList, label: 'Protocols', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  ai: { icon: Bot, label: 'AI Consult', color: '#7c3aed', hoverColor: '#6d28d9' },
  delete: { icon: Trash2, label: 'Delete', color: '#dc2626', hoverColor: '#b91c1c' },
  contact: { icon: Mail, label: 'Contact', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  search: { icon: Search, label: 'Search Competitors', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  create_prescription: { icon: FilePlus, label: 'New Prescription', color: '#0284c7', hoverColor: '#0369a1' },
  assign_patient: { icon: UserPlus, label: 'Assign Patient', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  assign_am: { icon: ClipboardList, label: 'Assign AM', color: 'var(--color-text-secondary)', hoverColor: 'var(--color-primary)' },
  create_order: { icon: ShoppingCart, label: 'Create Order', color: '#059669', hoverColor: '#047857' },
  reject: { icon: XCircle, label: 'Reject', color: '#dc2626', hoverColor: '#b91c1c' },
  audit_ai: { icon: Bot, label: 'AI Audit', color: '#7c3aed', hoverColor: '#6d28d9' },
  atlas: { icon: Sparkles, label: 'Atlas', color: '#6366f1', hoverColor: '#4f46e5' },
  convert_to_patient: { icon: UserCheck, label: 'Convert to Patient', color: '#059669', hoverColor: '#047857' },
  activate: { icon: Play, label: 'Activate', color: '#059669', hoverColor: '#047857' },
  play: { icon: Play, label: 'Activate', color: '#059669', hoverColor: '#047857' },
  pause: { icon: Pause, label: 'Pause', color: '#6366f1', hoverColor: '#4f46e5' },
  mark_invoiced: { icon: DollarSign, label: 'Mark Invoiced', color: '#059669', hoverColor: '#047857' },
  view_patients: { icon: UserPlus, label: 'View Patients', color: '#d97706', hoverColor: '#b45309' },
  view_prescriptions: { icon: ClipboardList, label: 'View Prescriptions', color: '#059669', hoverColor: '#047857' },
  import_prescription: { icon: Download, label: 'Import Prescription', color: '#0284c7', hoverColor: '#0369a1' },
  usage: { icon: BarChart3, label: 'Usage & Transactions', color: '#0f766e', hoverColor: '#115e59' },
  create_quote: { icon: FileText, label: 'Quote to Client', color: '#0ea5e9', hoverColor: '#0284c7' },
  request_rfq: { icon: Send, label: 'Request Supplier RFQ', color: '#6366f1', hoverColor: '#4f46e5' },
  convert_order: { icon: ShoppingCart, label: 'Convert to Order', color: '#16a34a', hoverColor: '#15803d' },
  supplier_po: { icon: Package, label: 'Generate Supplier PO', color: '#f59e0b', hoverColor: '#d97706' },
  share: { icon: Copy, label: 'Share Quote', color: '#0284c7', hoverColor: '#0369a1' },
  whatsapp: { icon: Mail, label: 'WhatsApp Share', color: '#16a34a', hoverColor: '#15803d' },
  copy_link: { icon: Link, label: 'Copy Client Link', color: '#6366f1', hoverColor: '#4f46e5' },
  extend_validity: { icon: Clock, label: 'Extend +15 Days', color: '#0284c7', hoverColor: '#0369a1' },
  qr: { icon: QrCode, label: 'Instant QR Code', color: '#7c3aed', hoverColor: '#6d28d9' }
};

const ACTION_THEMES = {
  offers: { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', hoverBg: '#e0f2fe', hoverBorder: '#7dd3fc' },
  list: { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', hoverBg: '#e0f2fe', hoverBorder: '#7dd3fc' },
  sparkles: { color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', hoverBg: '#f3e8ff', hoverBorder: '#d8b4fe' },
  enrich: { color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', hoverBg: '#f3e8ff', hoverBorder: '#d8b4fe' },
  create_order: { color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', hoverBg: '#dcfce7', hoverBorder: '#86efac' },
  create_quote: { color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', hoverBg: '#e0f2fe', hoverBorder: '#7dd3fc' },
  request_rfq: { color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', hoverBg: '#e0e7ff', hoverBorder: '#a5b4fc' },
  share: { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', hoverBg: '#e0f2fe', hoverBorder: '#7dd3fc' },
  whatsapp: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', hoverBg: '#dcfce7', hoverBorder: '#86efac' },
  copy_link: { color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', hoverBg: '#e0e7ff', hoverBorder: '#a5b4fc' },
  extend_validity: { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', hoverBg: '#e0f2fe', hoverBorder: '#7dd3fc' },
  qr: { color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', hoverBg: '#f3e8ff', hoverBorder: '#d8b4fe' },
  clone: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', hoverBg: '#dbeafe', hoverBorder: '#93c5fd' },
  view: { color: '#475569', bg: '#f8fafc', border: '#cbd5e1', hoverBg: '#f1f5f9', hoverBorder: '#94a3b8' },
  edit: { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', hoverBg: '#e0f2fe', hoverBorder: '#7dd3fc' },
  delete: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', hoverBg: '#fee2e2', hoverBorder: '#fca5a5' },
  archive: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', hoverBg: '#fef3c7', hoverBorder: '#fcd34d' },
};

export default function AppActionGroup({ actions = [], maxVisible = 2 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 1280px)');
    setIsCompactScreen(mql.matches);
    const handleResize = (e) => setIsCompactScreen(e.matches);
    mql.addEventListener('change', handleResize);
    return () => mql.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      const handleScroll = () => setMenuOpen(false);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [menuOpen]);

  const validActions = (actions || []).filter(Boolean);
  // Auto-adapt to avoid laptop/mobile wrap: on <=1280px screen, never exceed 2 visible actions
  const effectiveMaxVisible = isCompactScreen ? Math.min(maxVisible, 2) : maxVisible;
  const visibleActions = validActions.slice(0, effectiveMaxVisible);
  const hiddenActions = validActions.slice(effectiveMaxVisible);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const MENU_HEIGHT_ESTIMATE = hiddenActions.length * 40 + 12;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < MENU_HEIGHT_ESTIMATE + 8;

      if (openUpward) {
        setMenuCoords({
          bottom: window.innerHeight - rect.top + 4,
          right: window.innerWidth - rect.right,
          top: 'auto',
        });
      } else {
        setMenuCoords({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
          bottom: 'auto',
        });
      }
    }
    setMenuOpen(!menuOpen);
  };

  const renderButton = (action, idx) => {
    const config = ACTION_CONFIG[action.type] || {};
    const theme = ACTION_THEMES[action.type] || null;
    const Icon = action.icon || config.icon;
    const label = action.label || config.label || 'Action';
    const color = theme ? theme.color : (action.color || config.color || '#475569');
    const bg = theme ? theme.bg : '#ffffff';
    const border = theme ? theme.border : '#cbd5e1';
    const hoverBg = theme ? theme.hoverBg : 'var(--color-bg-hover, #f1f5f9)';
    const hoverBorder = theme ? theme.hoverBorder : 'var(--color-primary, #003666)';
    const hoverColor = theme ? theme.color : (action.hoverColor || config.hoverColor || '#0f172a');
    
    if (!Icon) return null;
    return (
      <button
        key={idx}
        onClick={(e) => {
          e.stopPropagation();
          action.onClick(e);
        }}
        title={label}
        style={{
          width: '32px',
          height: '32px',
          minWidth: '32px',
          minHeight: '32px',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '7px',
          color: color,
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: 0,
          margin: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = hoverBg;
          e.currentTarget.style.borderColor = hoverBorder;
          e.currentTarget.style.color = hoverColor;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 3px 6px -1px rgba(0, 0, 0, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = bg;
          e.currentTarget.style.borderColor = border;
          e.currentTarget.style.color = color;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }}
      >
        <Icon size={15} strokeWidth={2} />
      </button>
    );
  };

  return (
    <div style={{
      display: 'inline-flex',
      gap: '5px',
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'relative',
      flexShrink: 0,
      whiteSpace: 'nowrap'
    }}>
      {visibleActions.map((action, idx) => renderButton(action, idx))}
      {hiddenActions.length > 0 && (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            title="More actions"
            style={{
              width: '32px',
              height: '32px',
              minWidth: '32px',
              minHeight: '32px',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: menuOpen ? '#f1f5f9' : '#ffffff',
              border: `1px solid ${menuOpen ? '#94a3b8' : '#cbd5e1'}`,
              borderRadius: '7px',
              color: menuOpen ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: 0,
              margin: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#94a3b8';
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 3px 6px -1px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              if (!menuOpen) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }
            }}
          >
            <MoreHorizontal size={16} strokeWidth={2.2} />
          </button>

          {menuOpen && createPortal(
            <div 
              ref={menuRef}
              style={{
                position: 'fixed',
                ...menuCoords,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                zIndex: 99999,
                minWidth: '180px',
                display: 'flex',
                flexDirection: 'column',
                padding: '4px',
                overflow: 'hidden'
              }}>
              {hiddenActions.map((action, idx) => {
                const config = ACTION_CONFIG[action.type] || {};
                const Icon = action.icon || config.icon;
                const label = action.label || config.label || 'Action';
                const isDestructive = action.type === 'delete' || action.type === 'archive' || action.type === 'reject';
                const hoverColor = isDestructive ? '#dc2626' : (action.hoverColor || config.hoverColor || '#003666');
                const iconColor = isDestructive ? '#dc2626' : (action.color || config.color || '#475569');
                if (!Icon) return null;
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
                      gap: '0.625rem',
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: isDestructive ? '#dc2626' : '#1e293b',
                      textAlign: 'left',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDestructive ? '#fef2f2' : '#f1f5f9';
                      e.currentTarget.style.color = hoverColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = isDestructive ? '#dc2626' : '#1e293b';
                    }}
                  >
                    <Icon size={15} color={iconColor} strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
                  </button>
                );
              })}
            </div>,
            document.body
          )}
        </div>
      )}
    </div>
  );
}
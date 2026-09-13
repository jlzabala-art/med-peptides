"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Package, DollarSign, Truck, History, MessageSquare, 
  ChevronDown, ChevronUp, ChevronsUpDown, CheckCircle2, User, Globe, 
  Building2, Sparkles, Layers, ShieldCheck, Tag
} from 'lucide-react';
import { useQuotationsUIStore } from '../../stores/quotationsUIStore';
import StandardDrawer from '../ui/StandardDrawer';
import StatusBadge from '../ui/StatusBadge';

import OverviewTab from './tabs/OverviewTab';
import ItemsTab from './tabs/ItemsTab';
import PricingTab from './tabs/PricingTab';
import ShippingTab from './tabs/ShippingTab';
import DocumentsTab from './tabs/DocumentsTab';
import HistoryTab from './tabs/HistoryTab';
import InternalNotesTab from './tabs/InternalNotesTab';
import { useTransactionManager } from '../../hooks/data/useTransactionManager';

const SECTIONS = [
  {
    id: 'overview',
    label: 'Overview & Client Access',
    shortLabel: 'Overview',
    icon: User,
    color: '#0284c7',
    bg: '#f0f9ff',
    component: OverviewTab,
  },
  {
    id: 'items',
    label: 'Line Items & Products',
    shortLabel: 'Items',
    icon: Package,
    color: '#0d9488',
    bg: '#f0fdfa',
    component: ItemsTab,
  },
  {
    id: 'pricing',
    label: 'Pricing, Margins & Tiers',
    shortLabel: 'Pricing',
    icon: DollarSign,
    color: '#16a34a',
    bg: '#f0fdf4',
    component: PricingTab,
  },
  {
    id: 'shipping',
    label: 'Shipping & Cold-Chain Protocol',
    shortLabel: 'Shipping',
    icon: Truck,
    color: '#2563eb',
    bg: '#eff6ff',
    component: ShippingTab,
  },
  {
    id: 'documents',
    label: 'Documents & PDF Exporter',
    shortLabel: 'Documents',
    icon: FileText,
    color: '#7c3aed',
    bg: '#f5f3ff',
    component: DocumentsTab,
  },
  {
    id: 'history',
    label: 'Lifecycle History & Audit Trail',
    shortLabel: 'History',
    icon: History,
    color: '#d97706',
    bg: '#fffbeb',
    component: HistoryTab,
  },
  {
    id: 'internal',
    label: 'Internal Notes & Observations',
    shortLabel: 'Notes',
    icon: MessageSquare,
    color: '#64748b',
    bg: '#f1f5f9',
    component: InternalNotesTab,
  },
];

export default function QuotationDetailDrawer({ quotation: propQuotation, onClose: propOnClose }) {
  const { activeQuotation: storeQuotation, closeQuotationDrawer, openBuilderWizard } = useQuotationsUIStore();
  const [localQuotation, setLocalQuotation] = useState(null);
  const [openSections, setOpenSections] = useState({ overview: true, items: true });
  const sectionRefs = useRef({});
  const { createQuotation } = useTransactionManager();

  useEffect(() => {
    const handleOpen = (e) => {
      if (e.detail) {
        setLocalQuotation(e.detail);
        setOpenSections({ overview: true, items: true });
      }
    };
    const handleUpdated = (e) => {
      if (e.detail) {
        setLocalQuotation(prev => prev ? { ...prev, ...e.detail } : e.detail);
      }
    };
    window.addEventListener('open-quotation-drawer', handleOpen);
    window.addEventListener('quotation-updated', handleUpdated);
    return () => {
      window.removeEventListener('open-quotation-drawer', handleOpen);
      window.removeEventListener('quotation-updated', handleUpdated);
    };
  }, []);

  const activeQuotation = propQuotation || localQuotation || storeQuotation;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setLocalQuotation(null);
    closeQuotationDrawer();
  };

  if (!activeQuotation) return null;

  const items = Array.isArray(activeQuotation.items) ? activeQuotation.items : [];
  const currency = activeQuotation.currency || 'USD';
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const grandTotal = Number(activeQuotation.grandTotal || activeQuotation.totalAmount || 0);

  const toggleSection = (id) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleJumpToSection = (id) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: true
    }));
    setTimeout(() => {
      const el = sectionRefs.current[id];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const areAllExpanded = SECTIONS.every(s => openSections[s.id]);

  const handleToggleExpandAll = () => {
    if (areAllExpanded) {
      setOpenSections({ overview: true });
    } else {
      const all = {};
      SECTIONS.forEach(s => { all[s.id] = true; });
      setOpenSections(all);
    }
  };

  const getSectionBadge = (id) => {
    switch (id) {
      case 'items':
        return `${items.length} ${items.length === 1 ? 'item' : 'items'}`;
      case 'pricing':
        return grandTotal > 0 ? `${currencySymbol}${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;
      case 'shipping':
        return activeQuotation.shippingAddress?.country || activeQuotation.requiresColdChain ? 'Cold-Chain' : null;
      case 'documents':
        return activeQuotation.url ? 'PDF Ready' : null;
      default:
        return null;
    }
  };

  const handleCreateQuotationFromRfq = () => {
    openBuilderWizard({
      type: 'rfq',
      id: activeQuotation.id,
      data: activeQuotation
    });
    handleClose();
  };

  return (
    <StandardDrawer
      isOpen={!!activeQuotation}
      onClose={handleClose}
      width="min(96vw, 920px)"
      title={activeQuotation.type === 'rfq' ? `RFQ #${activeQuotation.rfqId}` : `Quotation #${activeQuotation.quotationNumber || activeQuotation.id}`}
      subtitle={activeQuotation.type === 'rfq' ? 'Pending Commercial Review' : 'Pending Client Approval'}
    >
      {activeQuotation.type === 'rfq' && (
        <div style={{ padding: '1rem', background: '#e0e7ff', borderBottom: '1px solid #c7d2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#3730a3' }}>This is a Request for Quotation (RFQ).</div>
            <div style={{ fontSize: '0.85rem', color: '#4f46e5' }}>Review the requested items and generate a formal quotation for the customer.</div>
          </div>
          <button onClick={handleCreateQuotationFromRfq} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            Create Quotation
          </button>
        </div>
      )}

      {/* Quick Navigation Jump Bar + Expand All Toggle */}
      <div style={{ 
        padding: '10px 16px', 
        background: '#f8fafc', 
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        {/* Quick jump pills */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          overflowX: 'auto', 
          flexWrap: 'nowrap',
          maxWidth: 'calc(100% - 130px)',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 2
        }}>
          {SECTIONS.map((sec) => {
            const isOpen = Boolean(openSections[sec.id]);
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleJumpToSection(sec.id)}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: isOpen ? 700 : 500,
                  color: isOpen ? '#0f172a' : '#64748b',
                  background: isOpen ? '#ffffff' : '#f1f5f9',
                  border: isOpen ? '1px solid #cbd5e1' : '1px solid transparent',
                  padding: '4px 10px',
                  borderRadius: 16,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <span style={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  backgroundColor: isOpen ? sec.color : '#94a3b8' 
                }} />
                {sec.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Expand / Collapse All Toggle Button */}
        <button
          type="button"
          onClick={handleToggleExpandAll}
          style={{
            fontSize: '0.74rem',
            fontWeight: 600,
            color: 'var(--color-primary, #003666)',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            padding: '4px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <ChevronsUpDown size={13} />
          {areAllExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Accordion Container */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        background: '#f8fafc' 
      }}>
        {SECTIONS.map((sec) => {
          const isOpen = Boolean(openSections[sec.id]);
          const IconComp = sec.icon;
          const ComponentToRender = sec.component;
          const badge = getSectionBadge(sec.id);

          return (
            <div 
              key={sec.id}
              ref={el => { sectionRefs.current[sec.id] = el; }}
              style={{
                background: '#ffffff',
                borderRadius: 10,
                border: isOpen ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                boxShadow: isOpen ? '0 2px 8px -2px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
                overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isOpen ? '#ffffff' : '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderBottom: isOpen ? '1px solid #f1f5f9' : 'none',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: sec.bg,
                    color: sec.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <IconComp size={17} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontSize: '0.88rem', 
                      fontWeight: 700, 
                      color: '#0f172a',
                      letterSpacing: '-0.01em'
                    }}>
                      {sec.label}
                    </span>

                    {badge && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: sec.color,
                        background: sec.bg,
                        border: `1px solid ${sec.color}30`,
                        padding: '1px 8px',
                        borderRadius: 12,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}>
                        {badge}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#64748b',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: isOpen ? '#f1f5f9' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    <ChevronDown size={16} />
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div style={{ 
                  animation: 'fadeIn 0.2s ease-in-out',
                  padding: '0' 
                }}>
                  <ComponentToRender quotation={activeQuotation} quotationId={activeQuotation.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </StandardDrawer>
  );
}

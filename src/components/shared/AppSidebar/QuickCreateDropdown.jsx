"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext';
import { useSimulationStore } from '../../../stores/useSimulationStore';
import { 
  Plus, UserPlus, Stethoscope, ClipboardList, FileText, HeartPulse, 
  Receipt, ShoppingBag, CheckCircle, CheckSquare, Users, Building, 
  ActivitySquare, Factory, Database, Truck, Navigation, CreditCard, 
  ShieldCheck, MessageSquare, Package, ChevronRight 
} from '@/lib/icons';
import { useDrawer } from '../../../context/DrawerContext';

const QUICK_CREATE_MAP = {
  admin: [
    { label: 'New Patient', desc: 'Clinical intake & records', icon: UserPlus, action: 'new-patient', color: '#0284c7', bg: '#eff6ff' },
    { label: 'New Doctor', desc: 'Practitioner onboarding', icon: Stethoscope, action: 'new-doctor', color: '#0d9488', bg: '#f0fdfa' },
    { label: 'New Protocol', desc: 'Treatment regimen designer', icon: ClipboardList, action: 'new-protocol', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'New Prescription', desc: 'Compound Rx analyzer', icon: FileText, action: 'rx-builder', color: '#003666', bg: '#f0f4f8' },
    { label: 'New Quotation', desc: 'Patient estimate & billing', icon: Receipt, action: 'new-quotation', color: '#d97706', bg: '#fffbeb' },
    { label: 'New Purchase Order', desc: 'B2B distributor PO', icon: ShoppingBag, action: 'new-purchase-order', color: '#ea580c', bg: '#fff7ed' },
  ],
  doctor: [
    { label: 'New Patient', desc: 'Clinical intake & records', icon: UserPlus, action: 'new-patient', color: '#0284c7', bg: '#eff6ff' },
    { label: 'New Prescription', desc: 'Compound Rx & titration', icon: FileText, action: 'rx-builder', color: '#0d9488', bg: '#f0fdfa' },
    { label: 'New Treatment', desc: 'Titrate or modify cycle', icon: HeartPulse, action: 'new-treatment', color: '#e11d48', bg: '#fff1f2' },
    { label: 'New Quotation', desc: 'Draft patient pricing', icon: Receipt, action: 'new-quotation', color: '#d97706', bg: '#fffbeb' },
  ],
  medical_director: [
    { label: 'New Protocol', desc: 'Standardized clinical regimen', icon: ClipboardList, action: 'new-protocol', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'New Prescription', desc: 'High-tier peptide review', icon: FileText, action: 'rx-builder', color: '#0d9488', bg: '#f0fdfa' },
    { label: 'Clinical Review', desc: 'Biomarker & safety audits', icon: CheckCircle, action: 'clinical-review', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Doctor Approval', desc: 'Authorize medical staff', icon: CheckSquare, action: 'doctor-approval', color: '#0284c7', bg: '#eff6ff' },
  ],
  clinic_manager: [
    { label: 'New Patient', desc: 'Clinical intake & records', icon: UserPlus, action: 'new-patient', color: '#0284c7', bg: '#eff6ff' },
    { label: 'New Doctor', desc: 'Onboard medical staff', icon: Stethoscope, action: 'new-doctor', color: '#0d9488', bg: '#f0fdfa' },
    { label: 'New Quotation', desc: 'Create pricing estimate', icon: Receipt, action: 'new-quotation', color: '#d97706', bg: '#fffbeb' },
    { label: 'New Invoice', desc: 'Process payment invoice', icon: Receipt, action: 'new-invoice', color: '#16a34a', bg: '#f0fdf4' },
  ],
  sales: [
    { label: 'New Lead', desc: 'Prospective clinic lead', icon: Users, action: 'new-lead', color: '#0284c7', bg: '#eff6ff' },
    { label: 'New Clinic', desc: 'Institutional partner', icon: Building, action: 'new-clinic', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'New Quotation', desc: 'Wholesale quotation', icon: Receipt, action: 'new-quotation', color: '#d97706', bg: '#fffbeb' },
    { label: 'New Follow-up', desc: 'Schedule sales touchpoint', icon: ActivitySquare, action: 'new-follow-up', color: '#0d9488', bg: '#f0fdfa' },
  ],
  pharmacist: [
    { label: 'New Production Request', desc: 'Compounding laboratory', icon: Factory, action: 'new-production', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'New Purchase Order', desc: 'API raw compound order', icon: ShoppingBag, action: 'new-purchase-order', color: '#ea580c', bg: '#fff7ed' },
    { label: 'New Inventory Entry', desc: 'Stock batch reception', icon: Database, action: 'new-inventory-entry', color: '#0284c7', bg: '#eff6ff' },
  ],
  operations: [
    { label: 'New Shipment', desc: 'Cold-chain dispatch', icon: Truck, action: 'new-shipment', color: '#0284c7', bg: '#eff6ff' },
    { label: 'New Warehouse Transfer', desc: 'Hub to hub movement', icon: Building, action: 'new-warehouse-transfer', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'New Tracking Event', desc: 'Carrier status milestone', icon: Navigation, action: 'new-tracking-event', color: '#16a34a', bg: '#f0fdf4' },
  ],
  finance: [
    { label: 'New Invoice', desc: 'Customer billing invoice', icon: Receipt, action: 'new-invoice', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'New Supplier Bill', desc: 'Accounts payable record', icon: Receipt, action: 'new-supplier-bill', color: '#d97706', bg: '#fffbeb' },
    { label: 'New Payment', desc: 'Reconcile remittance', icon: CreditCard, action: 'new-payment', color: '#0284c7', bg: '#eff6ff' },
  ],
  supplier: [
    { label: 'New RFQ Response', desc: 'Submit price quotation', icon: FileText, action: 'new-rfq-response', color: '#0284c7', bg: '#eff6ff' },
    { label: 'Upload Certificate', desc: 'HPLC / COA laboratory test', icon: ShieldCheck, action: 'upload-certificate', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Upload Shipping Document', desc: 'Waybill & customs packing', icon: FileText, action: 'upload-shipping-doc', color: '#7c3aed', bg: '#f5f3ff' },
  ],
  patient: [
    { label: 'New Message', desc: 'Contact care concierge', icon: MessageSquare, action: 'new-message', color: '#0284c7', bg: '#eff6ff' },
    { label: 'Upload Report', desc: 'Lab blood work results', icon: FileText, action: 'upload-report', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Request Refill', desc: 'Active regimen refill', icon: Package, action: 'request-refill', color: '#7c3aed', bg: '#f5f3ff' },
  ]
};

export default function QuickCreateDropdown({ onNavigate, activeRole: propRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { activeRole: authRole } = useAuth();
  const { simulatedRole } = useSimulationStore();
  const [dropdownStyles, setDropdownStyles] = useState({});
  const [mounted, setMounted] = useState(false);
  const { openDrawer } = useDrawer();

  const effectiveRole = propRole || simulatedRole || authRole || 'admin';
  const actions = (QUICK_CREATE_MAP[effectiveRole] || QUICK_CREATE_MAP['admin'] || []).slice(0, 6);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth <= 768;
      
      const desiredWidth = isMobile ? Math.min(280, viewportWidth - 24) : Math.max(260, rect.width);
      const computedLeft = isMobile 
        ? Math.max(12, Math.min(rect.left, viewportWidth - desiredWidth - 12))
        : rect.left;

      setDropdownStyles({
        position: 'fixed',
        top: rect.bottom + 6,
        left: computedLeft,
        width: desiredWidth,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.25), 0 4px 12px rgba(0, 0, 0, 0.05)',
        zIndex: 999999,
        padding: '6px',
        overflow: 'hidden',
        animation: 'quickCreateFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
      });
    }
  }, [isOpen]);

  if (actions.length === 0) return null;

  return (
    <div style={{ width: '100%', padding: '0 12px 16px' }}>
      <button 
        ref={buttonRef}
        className="sb-quick-create" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Plus size={16} strokeWidth={2.5} />
        Quick Create
      </button>

      {isOpen && mounted && document.body && createPortal(
        <>
          {/* Backdrop for easy mobile dismissal */}
          <div 
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999998,
              background: 'rgba(15, 23, 42, 0.25)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)'
            }}
          />

          <div ref={dropdownRef} style={dropdownStyles}>
            <div style={{ 
              padding: '6px 10px 8px 10px', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: '#94a3b8', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '4px'
            }}>
              Quick Actions
            </div>

            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (action.action === 'rx-builder') {
                      openDrawer('rx-builder', 'new');
                    } else {
                      window.dispatchEvent(new CustomEvent('open-quick-create', { detail: { type: action.action } }));
                    }
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '12px',
                    width: '100%',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    minHeight: '48px',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: action.bg || '#eff6ff',
                    color: action.color || '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={17} strokeWidth={2.3} color={action.color} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                      {action.label}
                    </span>
                    {action.desc && (
                      <span style={{ fontSize: '0.71rem', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {action.desc}
                      </span>
                    )}
                  </div>

                  <ChevronRight size={14} color="#cbd5e1" style={{ flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}

      <style jsx global>{`
        @keyframes quickCreateFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

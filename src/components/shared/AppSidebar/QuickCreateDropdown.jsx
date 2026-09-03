"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext';
import { Plus, UserPlus, Stethoscope, ClipboardList, FileText, HeartPulse, Receipt, ShoppingBag, CheckCircle, CheckSquare, Users, Building, ActivitySquare, Factory, Database, Truck, Navigation, CreditCard, ShieldCheck, MessageSquare, Package } from '@/lib/icons';
import { useDrawer } from '../../../context/DrawerContext';

const QUICK_CREATE_MAP = {
  admin: [
    { label: 'New Patient', icon: UserPlus, action: 'new-patient' },
    { label: 'New Doctor', icon: Stethoscope, action: 'new-doctor' },
    { label: 'New Protocol', icon: ClipboardList, action: 'new-protocol' },
    { label: 'New Prescription', icon: FileText, action: 'rx-builder' },
    { label: 'New Quotation', icon: FileText, action: 'new-quotation' },
    { label: 'New Purchase Order', icon: ShoppingBag, action: 'new-purchase-order' },
  ],
  doctor: [
    { label: 'New Patient', icon: UserPlus, action: 'new-patient' },
    { label: 'New Prescription', icon: FileText, action: 'rx-builder' },
    { label: 'New Treatment', icon: HeartPulse, action: 'new-treatment' },
    { label: 'New Quotation', icon: FileText, action: 'new-quotation' },
  ],
  medical_director: [
    { label: 'New Protocol', icon: ClipboardList, action: 'new-protocol' },
    { label: 'New Prescription', icon: FileText, action: 'rx-builder' },
    { label: 'Clinical Review', icon: CheckCircle, action: 'clinical-review' },
    { label: 'Doctor Approval', icon: CheckSquare, action: 'doctor-approval' },
  ],
  clinic_manager: [
    { label: 'New Patient', icon: UserPlus, action: 'new-patient' },
    { label: 'New Doctor', icon: Stethoscope, action: 'new-doctor' },
    { label: 'New Quotation', icon: FileText, action: 'new-quotation' },
    { label: 'New Invoice', icon: Receipt, action: 'new-invoice' },
  ],
  sales: [
    { label: 'New Lead', icon: Users, action: 'new-lead' },
    { label: 'New Clinic', icon: Building, action: 'new-clinic' },
    { label: 'New Quotation', icon: FileText, action: 'new-quotation' },
    { label: 'New Follow-up', icon: ActivitySquare, action: 'new-follow-up' },
  ],
  pharmacist: [
    { label: 'New Production Request', icon: Factory, action: 'new-production' },
    { label: 'New Purchase Order', icon: ShoppingBag, action: 'new-purchase-order' },
    { label: 'New Inventory Entry', icon: Database, action: 'new-inventory-entry' },
  ],
  operations: [
    { label: 'New Shipment', icon: Truck, action: 'new-shipment' },
    { label: 'New Warehouse Transfer', icon: Building, action: 'new-warehouse-transfer' },
    { label: 'New Tracking Event', icon: Navigation, action: 'new-tracking-event' },
  ],
  finance: [
    { label: 'New Invoice', icon: Receipt, action: 'new-invoice' },
    { label: 'New Supplier Bill', icon: Receipt, action: 'new-supplier-bill' },
    { label: 'New Payment', icon: CreditCard, action: 'new-payment' },
  ],
  supplier: [
    { label: 'New RFQ Response', icon: FileText, action: 'new-rfq-response' },
    { label: 'Upload Certificate', icon: ShieldCheck, action: 'upload-certificate' },
    { label: 'Upload Shipping Document', icon: FileText, action: 'upload-shipping-doc' },
  ],
  patient: [
    { label: 'New Message', icon: MessageSquare, action: 'new-message' },
    { label: 'Upload Report', icon: FileText, action: 'upload-report' },
    { label: 'Request Refill', icon: Package, action: 'request-refill' },
  ]
};

export default function QuickCreateDropdown({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { activeRole } = useAuth();
  const [dropdownStyles, setDropdownStyles] = useState({});
  const [mounted, setMounted] = useState(false);
  const { openDrawer } = useDrawer();

  const currentRole = activeRole || 'admin';
  const actions = (QUICK_CREATE_MAP[currentRole] || QUICK_CREATE_MAP['admin'] || []).slice(0, 5);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true); // capture scroll in any container
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        zIndex: 999999,
        padding: '8px 0',
        overflow: 'hidden'
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
      >
        <Plus size={16} strokeWidth={2.5} />
        Quick Create
      </button>

      {isOpen && mounted && document.body && createPortal(
        <div ref={dropdownRef} style={dropdownStyles}>
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
                  gap: '12px',
                  width: '100%',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Icon size={16} color="var(--text-secondary)" />
                {action.label}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

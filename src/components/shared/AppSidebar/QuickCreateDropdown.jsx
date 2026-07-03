import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  Plus, UserPlus, Stethoscope, ClipboardList, FileText, HeartPulse, 
  Receipt, ShoppingBag, CheckCircle, CheckSquare, Users, Building, 
  ActivitySquare, Factory, Database, Truck, Navigation, CreditCard, 
  ShieldCheck, MessageSquare, Package
} from 'lucide-react';

const QUICK_CREATE_MAP = {
  admin: [
    { label: 'New Patient', icon: UserPlus, action: 'new-patient' },
    { label: 'New Doctor', icon: Stethoscope, action: 'new-doctor' },
    { label: 'New Protocol', icon: ClipboardList, action: 'new-protocol' },
    { label: 'New Prescription', icon: FileText, action: 'new-prescription' },
    { label: 'New Quotation', icon: FileText, action: 'new-quotation' },
    { label: 'New Purchase Order', icon: ShoppingBag, action: 'new-purchase-order' },
  ],
  doctor: [
    { label: 'New Patient', icon: UserPlus, action: 'new-patient' },
    { label: 'New Prescription', icon: FileText, action: 'new-prescription' },
    { label: 'New Treatment', icon: HeartPulse, action: 'new-treatment' },
    { label: 'New Quotation', icon: FileText, action: 'new-quotation' },
  ],
  medical_director: [
    { label: 'New Protocol', icon: ClipboardList, action: 'new-protocol' },
    { label: 'New Prescription', icon: FileText, action: 'new-prescription' },
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
  const { activeRole } = useAuth();

  const currentRole = activeRole || 'admin';
  // Default to admin or empty if role is not mapped
  const actions = QUICK_CREATE_MAP[currentRole] || QUICK_CREATE_MAP['admin'] || [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (actions.length === 0) return null;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', padding: '0 12px 16px' }}>
      <button 
        className="sb-quick-create" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          width: '100%', padding: '10px', background: 'var(--primary-color)',
          color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer',
          fontWeight: 600, fontSize: '14px', transition: 'all 0.2s'
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
        Quick Create
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '12px',
          right: '12px',
          marginTop: '4px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 1000,
          padding: '8px 0',
          overflow: 'hidden'
        }}>
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-quick-create', { detail: { type: action.action } }));
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
        </div>
      )}
    </div>
  );
}

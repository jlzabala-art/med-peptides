import React, { useState, useEffect, useRef } from 'react';
import { Tag, Building, Trash2, X, FileText, PackageOpen, ChevronDown, CheckCircle2, MoreHorizontal, Check, PowerOff, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCatalogBuilderStore } from '../../../../stores/useCatalogBuilderStore';

export default function CatalogBulkActionsBar({ selectedIds, variants = [], onClearSelection, onAction }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState(null);
  const [showTransactionMenu, setShowTransactionMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);
  const isDraftActive = useCatalogBuilderStore(state => state.isDraftActive);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowTransactionMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedIds || selectedIds.length === 0) {
    if (showMobileSheet) setShowMobileSheet(false);
    return null;
  }

  // Derive selection context
  const selectedVariants = variants.filter(v => selectedIds.includes(v.id));
  
  // Calculate summary metrics
  const uniqueSuppliers = new Set(selectedVariants.map(v => v.supplier).filter(Boolean)).size;
  const totalInventory = selectedVariants.reduce((sum, v) => sum + (typeof v.stock === 'object' ? v.stock?.available || 0 : v.stock || 0), 0);
  const regulatoryIssues = selectedVariants.filter(v => v.registrationStatus !== 'Registered' && v.registration !== 'Active').length;

  // Contextual labels
  const allHaveSuppliers = selectedVariants.length > 0 && selectedVariants.every(v => v.supplier);
  const noneHaveSuppliers = selectedVariants.every(v => !v.supplier);
  const assignSupplierLabel = noneHaveSuppliers ? 'Assign Supplier' : allHaveSuppliers ? 'Change Supplier' : 'Assign / Replace Supplier';

  const handleAction = (actionId) => {
    // Intercept with confirmation if needed
    if (actionId === 'bulk_delete') {
      setConfirmingAction({ id: 'bulk_delete', message: `Delete ${selectedIds.length} variants?` });
      return;
    }
    if (actionId === 'bulk_po') {
      setConfirmingAction({ id: 'bulk_po', message: `Create Purchase Order for ${selectedIds.length} selected variants?` });
      return;
    }
    if (actionId === 'bulk_supplier') {
      setConfirmingAction({ id: 'bulk_supplier', message: `${assignSupplierLabel} to ${selectedIds.length} selected variants?` });
      return;
    }
    executeAction(actionId);
  };

  const executeAction = async (actionId) => {
    if (showMobileSheet) setShowMobileSheet(false);
    setConfirmingAction(null);
    
    if (actionId === 'bulk_add_to_catalog') {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 50));
      await onAction(actionId);
      setIsLoading(false);
    } else {
      onAction(actionId);
    }
  };

  // Shared button styles
  const btnStyle = {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: '#fff',
    transition: 'all 0.2s'
  };

  const primaryBtnStyle = { ...btnStyle, backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
  const dangerBtnStyle = { ...btnStyle, color: '#ef4444', border: '1px solid #fee2e2', backgroundColor: '#fef2f2' };

  const dropdownItemStyle = {
    display: 'block',
    width: '100%',
    padding: '8px 16px',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    fontSize: '0.875rem',
    color: '#334155',
    cursor: 'pointer',
    transition: 'background-color 0.15s'
  };

  return (
    <>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #cbd5e1',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          gap: '12px'
        }}
      >
        {/* Left Side: Actions */}
        <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', flex: 1, paddingBottom: '2px' }}>
          <button onClick={() => handleAction('bulk_manage_visibility')} style={{ ...btnStyle, flexShrink: 0 }}>
            Manage Visibility
          </button>
          
          <button 
            onClick={() => handleAction('bulk_add_to_catalog')} 
            style={{ ...btnStyle, flexShrink: 0, opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: isDraftActive ? '1px solid #bfdbfe' : '1px solid #e2e8f0', backgroundColor: isDraftActive ? '#eff6ff' : '#fff', color: isDraftActive ? '#2563eb' : '#334155' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%', width: '14px', height: '14px' }} />
            ) : null}
            {isLoading ? 'Loading...' : (isDraftActive ? 'Add to Catalog' : 'Create Catalog')}
          </button>

          <button onClick={() => handleAction('bulk_update')} style={{ ...btnStyle, flexShrink: 0 }}>
            Bulk Update
          </button>

          <button onClick={() => handleAction('bulk_supplier')} style={{ ...btnStyle, flexShrink: 0 }}>
            {assignSupplierLabel}
          </button>

          <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
            <button 
              onClick={() => setShowTransactionMenu(!showTransactionMenu)} 
              style={{ ...btnStyle, backgroundColor: showTransactionMenu ? '#f1f5f9' : '#fff', flexShrink: 0 }}
            >
              New Transaction <ChevronDown size={14} />
            </button>
            
            {showTransactionMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                minWidth: '160px',
                zIndex: 50,
                padding: '4px 0'
              }}>
                <button 
                  onClick={() => { setShowTransactionMenu(false); handleAction('bulk_quote'); }}
                  style={dropdownItemStyle}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Quote
                </button>
                <button 
                  onClick={() => { setShowTransactionMenu(false); handleAction('bulk_sales_order'); }}
                  style={dropdownItemStyle}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Sales Order
                </button>
                <button 
                  onClick={() => { setShowTransactionMenu(false); handleAction('bulk_invoice'); }}
                  style={dropdownItemStyle}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Invoice
                </button>
                <button 
                  onClick={() => { setShowTransactionMenu(false); handleAction('bulk_po'); }}
                  style={dropdownItemStyle}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Purchase Order
                </button>
                <button 
                  onClick={() => { setShowTransactionMenu(false); handleAction('bulk_bill'); }}
                  style={dropdownItemStyle}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Bill
                </button>
              </div>
            )}
          </div>

          <button onClick={() => handleAction('bulk_mark_active')} style={{ ...btnStyle, flexShrink: 0 }}>
            Mark as Active
          </button>
          
          <button onClick={() => handleAction('bulk_mark_inactive')} style={{ ...btnStyle, flexShrink: 0 }}>
            Mark as Inactive
          </button>
          
          <button onClick={() => handleAction('bulk_delete')} style={{ ...btnStyle, flexShrink: 0 }}>
            Delete
          </button>

          <div style={{ width: '1px', height: '16px', backgroundColor: '#cbd5e1', margin: '0 8px', flexShrink: 0 }}></div>
          
          <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{ 
              backgroundColor: '#e0e7ff', 
              color: '#4f46e5', 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {selectedIds.length}
            </div>
            Selected
          </div>
        </div>

        {/* Right Side: Close */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <button 
            onClick={onClearSelection} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#64748b', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontSize: '0.85rem',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Esc <X size={16} color="#ef4444" />
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      {confirmingAction && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a' }}>Confirm Action</h3>
            <p style={{ margin: '0 0 24px 0', color: '#475569', fontSize: '0.95rem' }}>{confirmingAction.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setConfirmingAction(null)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => executeAction(confirmingAction.id)} style={{ padding: '8px 16px', border: 'none', backgroundColor: confirmingAction.id === 'bulk_delete' ? '#ef4444' : '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet Overlay */}
      {isMobile && showMobileSheet && (
        <>
          <div onClick={() => setShowMobileSheet(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', padding: '24px 16px', zIndex: 10000, boxShadow: '0 -10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '40px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', margin: '0 auto 20px auto' }}></div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Bulk Actions
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>{selectedIds.length} items</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => handleAction('bulk_manage_visibility')} style={{ ...btnStyle, width: '100%', justifyContent: 'flex-start', padding: '12px' }}><CheckCircle2 size={16} /> Manage Visibility</button>
              <button onClick={() => handleAction('bulk_add_to_catalog')} style={{ ...btnStyle, width: '100%', justifyContent: 'flex-start', padding: '12px' }}><BookOpen size={16} /> {isDraftActive ? 'Add to Catalog' : 'Create Catalog'}</button>
              <button onClick={() => handleAction('bulk_tag')} style={{ ...btnStyle, width: '100%', justifyContent: 'flex-start', padding: '12px' }}><Tag size={16} /> Edit Tags</button>
              <button onClick={() => handleAction('bulk_supplier')} style={{ ...btnStyle, width: '100%', justifyContent: 'flex-start', padding: '12px' }}><Building size={16} /> {assignSupplierLabel}</button>
              <button onClick={() => handleAction('bulk_po')} style={{ ...primaryBtnStyle, width: '100%', justifyContent: 'flex-start', padding: '12px' }}><FileText size={16} /> Create PO</button>
              <button onClick={() => handleAction('bulk_delete')} style={{ ...dangerBtnStyle, width: '100%', justifyContent: 'flex-start', padding: '12px' }}><Trash2 size={16} /> Delete</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

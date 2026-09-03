"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Tag, Building, Trash2, X, FileText, PackageOpen,
  ChevronDown, CheckCircle2, MoreHorizontal, Check,
  PowerOff, BookOpen, Edit3, Combine, Play, Pause,
  FileDown, Library,
} from '@/lib/icons';
import toast from 'react-hot-toast';
import { useCatalogBuilderStore } from '../../../../stores/useCatalogBuilderStore';

// ─── Hook: safe mobile detection (no SSR mismatch) ───────────────────────────
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const BASE_BTN = {
  display: 'flex', alignItems: 'center', gap: 6,
  fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
  padding: '6px 11px', borderRadius: 6, border: '1px solid #e2e8f0',
  background: '#fff', color: '#334155', transition: 'all 0.15s',
  whiteSpace: 'nowrap', flexShrink: 0,
};
const PRIMARY_BTN = { ...BASE_BTN, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
const DANGER_BTN  = { ...BASE_BTN, color: '#dc2626', border: '1px solid #fecaca', background: '#fef2f2' };
const EXPORT_BTN  = { ...BASE_BTN, background: '#003666', color: '#fff', border: 'none', padding: '6px 14px', fontWeight: 600 };

// ─── Dropdown wrapper ─────────────────────────────────────────────────────────
function GroupDropdown({ label, icon: Icon, items, btnStyle = BASE_BTN, dropUp = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(v => !v)} style={{ ...btnStyle, background: open ? '#f1f5f9' : btnStyle.background }}>
        {Icon && <Icon size={14} />}
        {label}
        <ChevronDown size={13} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          [dropUp ? 'bottom' : 'top']: 'calc(100% + 4px)',
          left: 0, zIndex: 9999,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: 180, padding: '4px 0', overflow: 'hidden',
        }}>
          {items.map((item, idx) => item === '---'
            ? <div key={idx} style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
            : (
              <button
                key={idx}
                onClick={() => { setOpen(false); item.onClick(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '8px 14px', border: 'none',
                  background: 'none', fontSize: '0.84rem', textAlign: 'left',
                  cursor: 'pointer', color: item.danger ? '#dc2626' : '#1e293b',
                  transition: 'background 0.1s',
                }}
                onMouseOver={e => e.currentTarget.style.background = item.danger ? '#fef2f2' : '#f8fafc'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                {item.icon && <item.icon size={14} color={item.danger ? '#dc2626' : '#64748b'} />}
                <div>
                  <div style={{ fontWeight: item.primary ? 600 : 400 }}>{item.label}</div>
                  {item.desc && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 1 }}>{item.desc}</div>}
                </div>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => <div style={{ width: 1, height: 20, background: '#e2e8f0', flexShrink: 0, margin: '0 4px' }} />;

// ─── Main component ───────────────────────────────────────────────────────────
export default function CatalogBulkActionsBar({ selectedIds, variants = [], onClearSelection, onAction }) {
  const isMobile    = useIsMobile(1024);
  const [showSheet, setShowSheet]   = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const isDraftActive = useCatalogBuilderStore(state => state.isDraftActive);

  // Obsolete: Floating bottom bar replaced by Desktop Contextual Header above the table.
  return null;

  const selectedVariants  = variants.filter(v => selectedIds.includes(v.id));
  const allHaveSuppliers  = selectedVariants.length > 0 && selectedVariants.every(v => v.supplier);
  const noneHaveSuppliers = selectedVariants.every(v => !v.supplier);
  const supplierLabel     = noneHaveSuppliers ? 'Assign Supplier' : allHaveSuppliers ? 'Change Supplier' : 'Assign / Replace Supplier';

  // ── Action dispatcher ───────────────────────────────────────────────────────
  const fire = useCallback(async (actionId) => {
    setShowSheet(false);
    if (actionId === 'bulk_delete') {
      setConfirming({ id: actionId, message: `Permanently delete ${selectedIds.length} variant${selectedIds.length !== 1 ? 's' : ''}? This cannot be undone.` });
      return;
    }
    if (actionId === 'bulk_po') {
      setConfirming({ id: actionId, message: `Create a Purchase Order for ${selectedIds.length} selected variants?` });
      return;
    }
    if (actionId === 'bulk_add_to_catalog' && !isDraftActive) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 50));
      await onAction(actionId);
      setLoading(false);
      return;
    }
    onAction(actionId);
  }, [selectedIds.length, isDraftActive, onAction]);

  const confirm = () => { onAction(confirming.id); setConfirming(null); };

  // ── Action groups ───────────────────────────────────────────────────────────
  const contentItems = [
    { label: 'Edit Fields',       icon: Edit3,       onClick: () => fire('bulk_update'),            desc: 'Bulk-edit price, status, category' },
    { label: isDraftActive ? 'Add to Catalog' : 'Create Catalog', icon: BookOpen, onClick: () => fire('bulk_add_to_catalog'), primary: true },
    { label: 'Manage Visibility', icon: CheckCircle2, onClick: () => fire('bulk_manage_visibility') },
    { label: supplierLabel,       icon: Building,    onClick: () => fire('bulk_supplier') },
    { label: 'Merge Products',    icon: Combine,     onClick: () => fire('bulk_merge') },
  ];

  const statusItems = [
    { label: 'Mark as Active',   icon: Play,     onClick: () => fire('bulk_mark_active') },
    { label: 'Mark as Inactive', icon: Pause,    onClick: () => fire('bulk_mark_inactive') },
    { label: 'Edit Tags',        icon: Tag,      onClick: () => fire('bulk_tag') },
  ];

  const transactionItems = [
    { label: 'Quote',          onClick: () => fire('bulk_quote'),       desc: 'Create a Zoho quotation' },
    { label: 'Sales Order',    onClick: () => fire('bulk_sales_order'), desc: 'Open a new sales order' },
    { label: 'Invoice',        onClick: () => fire('bulk_invoice') },
    '---',
    { label: 'Purchase Order', onClick: () => fire('bulk_po'),  icon: FileText, primary: true },
    { label: 'Bill',           onClick: () => fire('bulk_bill') },
  ];

  // ─── DESKTOP BAR ─────────────────────────────────────────────────────────────
  if (!isMobile) return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '7px 16px',
        display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>

        {/* Group 1 — Selection chip */}
        <button
          onClick={onClearSelection}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#003666', color: '#fff', border: 'none', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          title="Click to clear selection"
        >
          <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 10, padding: '1px 6px', fontSize: '0.75rem' }}>
            {selectedIds.length}
          </span>
          selected
          <X size={13} style={{ opacity: 0.8 }} />
        </button>

        <Divider />

        {/* Group 2 — Content actions */}
        <GroupDropdown label="Edit" icon={Edit3} items={contentItems} />
        <GroupDropdown label="Status" icon={Play} items={statusItems} />

        <Divider />

        {/* Group 3 — Export (always visible) */}
        <button
          onClick={() => fire('bulk_export_pdf')}
          style={EXPORT_BTN}
          title="Export selected products as a PDF price list or quotation"
        >
          <FileDown size={14} />
          Export PDF
        </button>

        <button
          onClick={() => fire('open_pdf_library')}
          style={{ ...BASE_BTN, gap: 5 }}
          title="View saved PDFs"
        >
          <Library size={13} />
          PDF Library
        </button>

        <GroupDropdown label="Transaction" icon={FileText} items={transactionItems} />

        <Divider />

        {/* Group 4 — Destructive */}
        <button onClick={() => fire('bulk_delete')} style={DANGER_BTN} title="Delete selected">
          <Trash2 size={13} />
          Delete
        </button>
      </div>

      {/* Confirmation overlay */}
      {confirming && <ConfirmDialog message={confirming.message} isDanger={confirming.id === 'bulk_delete'} onConfirm={confirm} onCancel={() => setConfirming(null)} />}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </>
  );

  // ─── MOBILE BAR (fixed bottom) ────────────────────────────────────────────
  return (
    <>
      {/* Fixed bottom CTA bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 800,
        background: '#003666',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.18)',
      }}>
        {/* Count pill */}
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 10px', fontSize: '0.8rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {selectedIds.length} selected
        </div>

        {/* Export PDF — always visible primary CTA */}
        <button
          onClick={() => fire('bulk_export_pdf')}
          style={{ flex: 1, padding: '10px', background: '#fff', color: '#003666', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44 }}
        >
          <FileDown size={16} /> Export PDF
        </button>

        {/* More actions */}
        <button
          onClick={() => setShowSheet(true)}
          style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, minHeight: 44 }}
        >
          <MoreHorizontal size={18} />
        </button>

        {/* Dismiss */}
        <button onClick={onClearSelection} style={{ padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} />
        </button>
      </div>

      {/* Bottom sheet overlay */}
      {showSheet && (
        <>
          <div onClick={() => setShowSheet(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9001,
            background: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
            padding: '0 0 env(safe-area-inset-bottom, 16px)',
            maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
          }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '12px auto 16px' }} />
            <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Bulk Actions</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedIds.length} items</span>
            </div>

            {/* Section: Edit */}
            <SheetSection title="📝 Edit">
              <SheetButton icon={Edit3}       label="Edit Fields"       sub="Price, status, category" onClick={() => fire('bulk_update')} />
              <SheetButton icon={BookOpen}    label={isDraftActive ? 'Add to Catalog' : 'Create Catalog'} onClick={() => fire('bulk_add_to_catalog')} primary />
              <SheetButton icon={Building}    label={supplierLabel}     onClick={() => fire('bulk_supplier')} />
              <SheetButton icon={CheckCircle2} label="Manage Visibility" onClick={() => fire('bulk_manage_visibility')} />
              <SheetButton icon={Combine}     label="Merge Products"    onClick={() => fire('bulk_merge')} />
            </SheetSection>

            {/* Section: Status */}
            <SheetSection title="🔄 Status">
              <SheetButton icon={Play}   label="Mark as Active"   onClick={() => fire('bulk_mark_active')} />
              <SheetButton icon={Pause}  label="Mark as Inactive" onClick={() => fire('bulk_mark_inactive')} />
              <SheetButton icon={Tag}    label="Edit Tags"         onClick={() => fire('bulk_tag')} />
            </SheetSection>

            {/* Section: Export */}
            <SheetSection title="📄 Export & Transactions">
              <SheetButton icon={Library}   label="PDF Library"    sub="View saved exports" onClick={() => fire('open_pdf_library')} />
              <SheetButton icon={FileText}  label="Create PO"      onClick={() => fire('bulk_po')} primary />
              <SheetButton icon={FileText}  label="Quote"          onClick={() => fire('bulk_quote')} />
              <SheetButton icon={FileText}  label="Sales Order"    onClick={() => fire('bulk_sales_order')} />
              <SheetButton icon={FileText}  label="Invoice"        onClick={() => fire('bulk_invoice')} />
            </SheetSection>

            {/* Section: Destructive */}
            <SheetSection title="⚠️ Danger Zone">
              <SheetButton icon={Trash2} label="Delete Selected" onClick={() => fire('bulk_delete')} danger />
            </SheetSection>

            <div style={{ height: 16 }} />
          </div>
        </>
      )}

      {confirming && <ConfirmDialog message={confirming.message} isDanger={confirming.id === 'bulk_delete'} onConfirm={confirm} onCancel={() => setConfirming(null)} />}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SheetSection({ title, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ padding: '8px 16px 4px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </div>
      <div style={{ padding: '0 8px' }}>{children}</div>
    </div>
  );
}

function SheetButton({ icon: Icon, label, sub, onClick, primary, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '12px 10px', border: 'none', borderRadius: 8,
        background: 'transparent', cursor: 'pointer', textAlign: 'left',
        color: danger ? '#dc2626' : primary ? '#003666' : '#1e293b',
        minHeight: 44,
        transition: 'background 0.1s',
      }}
      onMouseOver={e => e.currentTarget.style.background = danger ? '#fef2f2' : '#f8fafc'}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: danger ? '#fef2f2' : primary ? '#eff6ff' : '#f1f5f9', flexShrink: 0 }}>
        <Icon size={17} color={danger ? '#dc2626' : primary ? '#2563eb' : '#64748b'} />
      </div>
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: primary ? 600 : 500 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 1 }}>{sub}</div>}
      </div>
    </button>
  );
}

function ConfirmDialog({ message, isDanger, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '24px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: isDanger ? '#dc2626' : '#0f172a', marginBottom: 10 }}>
          {isDanger ? '⚠️ Confirm Deletion' : 'Confirm Action'}
        </div>
        <p style={{ margin: '0 0 20px', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', border: 'none', borderRadius: 8, background: isDanger ? '#dc2626' : '#003666', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            {isDanger ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ShoppingCart, Plus, X, Building2, FileText, CheckCircle, Package, ExternalLink } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ERPListDetailLayout from '../../components/shared/ERPListDetailLayout';
import ERPStatusBadge from '../../components/shared/ERPStatusBadge';
import ERPActivityTimeline from '../../components/shared/ERPActivityTimeline';
import POForm from '../../components/purchase/POForm';
import ZohoPaperPreview from '../../components/admin/ZohoPaperPreview';


// ── PO States ────────────────────────────────────────────────────────────────
const PO_STATES = ['DRAFT', 'APPROVED', 'SENT_TO_SUPPLIER', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'];
const TERMINAL_STATES = ['RECEIVED', 'CANCELLED'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(date) {
  if (!date) return 'N/A';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

// ── List Item ─────────────────────────────────────────────────────────────────
function POListItem({ po, isSelected }) {
  return (
    <div style={{ padding: '0.875rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#1d4ed8' : '#1e293b' }}>
          {po.poNumber || po.id?.slice(0, 8)}
        </span>
        <ERPStatusBadge status={po.status || 'DRAFT'} size="sm" />
      </div>
      <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>{po.supplierName || '—'}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{fmt(po.createdAt)}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
          {fmtCurrency(po.totalAmount)}
        </span>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function PODetail({ po, onClose, onStatusChange, onEdit }) {
  const [saving, setSaving] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');
  const isTerminal = TERMINAL_STATES.includes((po.status || '').toUpperCase());

  const handleStatus = async (newStatus) => {
    if (isTerminal) return;
    setSaving(true);
    await updateDoc(doc(db, 'purchaseOrders', po.id), {
      status: newStatus,
      updatedAt: serverTimestamp(),
      statusHistory: arrayUnion({
        status: newStatus,
        changedAt: new Date().toISOString(),
        changedBy: 'Admin',
      }),
    });
    setSaving(false);
    onStatusChange?.();
  };

  const sectionTitle = { fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.6rem' };
  const divider = { height: '1px', backgroundColor: '#e2e8f0', margin: '1.25rem 0' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{po.poNumber || po.id?.slice(0, 8)}</h2>
            <ERPStatusBadge status={po.status || 'DRAFT'} />
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>Created: {fmt(po.createdAt)}</span>
            {po.zohoId && (
              <>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <a href={`https://books.zoho.eu/app#/purchaseorders/${po.zohoId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  View in Zoho Books <ExternalLink size={11} />
                </a>
              </>
            )}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} />
        </button>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', backgroundColor: 'white', flexShrink: 0 }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'items', label: 'PO Items' },
          { id: 'activity', label: 'Activity' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setDetailTab(tab.id)}
            style={{
              padding: '0.9rem 0.25rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: detailTab === tab.id ? 700 : 500,
              color: detailTab === tab.id ? '#2563eb' : '#64748b',
              borderBottom: detailTab === tab.id ? '2.5px solid #2563eb' : '2.5px solid transparent',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="erp-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

        {/* TAB 1: OVERVIEW */}
        {detailTab === 'overview' && (
          <div>
            {/* Status Flow */}
            <div style={{ marginBottom: '1.5rem', backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={sectionTitle}>Status Flow</div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {PO_STATES.map(s => {
                  const isCurrent = (po.status || 'DRAFT').toUpperCase() === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatus(s)}
                      disabled={saving || (isTerminal && !isCurrent)}
                      style={{
                        padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                        cursor: isTerminal && !isCurrent ? 'not-allowed' : 'pointer',
                        border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isCurrent ? '#eff6ff' : '#f8fafc',
                        color: isCurrent ? '#2563eb' : '#64748b',
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        opacity: isTerminal && !isCurrent ? 0.5 : 1,
                      }}
                    >
                      {isCurrent && <CheckCircle size={11} />}
                      {s.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
              {isTerminal && (
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', fontStyle: 'italic', margin: '0.5rem 0 0 0' }}>
                  This PO is marked as {po.status?.toLowerCase().replace(/_/g, ' ')} and is locked.
                </p>
              )}
            </div>

            {/* Origin RFQ reference */}
            {po.rfqId && (
              <div style={{ marginBottom: '1.5rem', backgroundColor: '#f0f9ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                <div style={{ ...sectionTitle, color: '#0369a1' }}>Linked Sourcing Request</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0369a1', marginTop: '0.5rem', fontWeight: 600 }}>
                  <FileText size={14} />
                  Converted from RFQ: <strong>{po.rfqNumber || po.rfqId.slice(0, 8)}</strong>
                </div>
              </div>
            )}

            {/* Supplier Card */}
            <div style={{ marginBottom: '1.5rem', backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={sectionTitle}>Supplier Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' }}>Supplier Name</label>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{po.supplierName || '—'}</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' }}>Total Amount</label>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{fmtCurrency(po.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PO ITEMS */}
        {detailTab === 'items' && (
          <div style={{ margin: '-1.5rem', backgroundColor: '#f8fafc' }}>
            <ZohoPaperPreview
              docType="PURCHASE ORDER"
              documentData={{
                documentNumber: po.poNumber || po.id?.slice(0, 8),
                date: fmt(po.createdAt),
                supplierName: po.supplierName,
                supplierEmail: po.supplierEmail,
                items: po.items || [],
                grandTotal: po.totalAmount,
                notes: po.notes || ''
              }}
            />
          </div>
        )}

        {/* TAB 3: ACTIVITY TIMELINE */}
        {detailTab === 'activity' && (
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={sectionTitle}>Activity Timeline</div>
            <div style={{ marginTop: '1rem' }}>
              <ERPActivityTimeline events={po.statusHistory || []} currentStatus={po.status} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={() => onEdit(po)}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          Edit PO
        </button>
        {!isTerminal && (
          <button
            onClick={() => handleStatus('RECEIVED')}
            disabled={saving}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Package size={14} /> Mark as Received
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function POList() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const handleBulkAction = async (ids, newStatus) => {
    try {
      await Promise.all(ids.map(id =>
        updateDoc(doc(db, 'purchaseOrders', id), {
          status: newStatus,
          statusHistory: arrayUnion({ status: newStatus, changedAt: new Date().toISOString(), changedBy: 'Admin (Bulk)' })
        })
      ));
      setRefreshToken(t => t + 1);
    } catch (err) { console.error(err); alert('Error processing bulk action.'); }
  };

  const handleBulkDelete = async (ids) => {
    if (!window.confirm(`Delete ${ids.length} purchase orders? This cannot be undone.`)) return;
    try {
      await Promise.all(ids.map(id => deleteDoc(doc(db, 'purchaseOrders', id))));
      setRefreshToken(t => t + 1);
    } catch (err) { console.error(err); alert('Error deleting purchase orders.'); }
  };

  const bulkActions = [
    { label: 'Mark as Issued', onClick: (ids) => handleBulkAction(ids, 'SENT_TO_SUPPLIER') },
    { label: 'Mark as Received', onClick: (ids) => handleBulkAction(ids, 'RECEIVED') },
    { label: 'Mark as Cancelled', onClick: (ids) => handleBulkAction(ids, 'CANCELLED') },
    { label: 'Delete', variant: 'danger', onClick: handleBulkDelete },
  ];

  useEffect(() => {
    let isSeeding = false;
    const q = query(collection(db, 'purchaseOrders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (data.length === 0 && !isSeeding) {
        isSeeding = true;
        try {
          const sample1 = {
            poNumber: "PO-2026-001",
            supplierName: "Global Peptide Synthesis Ltd.",
            supplierEmail: "sales@globalpeptides.com",
            status: "APPROVED",
            items: [
              { itemName: "BPC-157 Acetate (API)", quantity: 100, unit: "g", expectedCost: 11.50, unitPrice: 11.50, total: 1150.00 }
            ],
            totalAmount: 1150.00,
            createdAt: new Date(),
            statusHistory: [
              { status: 'DRAFT', changedAt: new Date(Date.now() - 86400000).toISOString(), changedBy: 'Admin' },
              { status: 'APPROVED', changedAt: new Date().toISOString(), changedBy: 'Admin' }
            ]
          };

          const sample2 = {
            poNumber: "PO-2026-002",
            supplierName: "Apex Biochemicals Corp",
            supplierEmail: "info@apexbiochem.com",
            status: "DRAFT",
            items: [
              { itemName: "TB-500 Acetate (API)", quantity: 50, unit: "g", expectedCost: 18.00, unitPrice: 18.00, total: 900.00 }
            ],
            totalAmount: 900.00,
            createdAt: new Date(),
            statusHistory: [
              { status: 'DRAFT', changedAt: new Date().toISOString(), changedBy: 'Admin' }
            ]
          };

          await addDoc(collection(db, 'purchaseOrders'), sample1);
          await addDoc(collection(db, 'purchaseOrders'), sample2);
        } catch (err) {
          console.error("Error seeding sample POs:", err);
        } finally {
          isSeeding = false;
        }
      }

      setPos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = pos.filter(r =>
    r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.poNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      <AdminPageHeader
        title="Purchase Orders"
        subtitle="Manage supplier purchase orders generated from approved RFQs."
        icon={ShoppingCart}
        actions={
          <button
            onClick={() => { setSelectedPo(null); setShowForm(true); }}
            className="btn btn-primary"
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <Plus size={16} /> New PO
          </button>
        }
      />

      <ERPListDetailLayout
        items={filtered}
        loading={loading}
        getItemId={(p) => p.id}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by supplier or PO number..."
        headerLeft={
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>All Purchase Orders</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{filtered.length} records</div>
          </div>
        }
        bulkActions={bulkActions}
        renderListItem={(po, isSelected) => <POListItem po={po} isSelected={isSelected} />}
        renderDetail={(po, onClose) => (
          <PODetail
            key={po.id + refreshToken}
            po={po}
            onClose={onClose}
            onStatusChange={() => setRefreshToken(t => t + 1)}
            onEdit={(p) => { setSelectedPo(p); setShowForm(true); }}
          />
        )}
      />

      {showForm && (
        <POForm
          po={selectedPo}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

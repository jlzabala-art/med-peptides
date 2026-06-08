import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Receipt, Plus, X, Building2, Calendar, DollarSign, FileText, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ERPListDetailLayout from '../../components/shared/ERPListDetailLayout';
import { StatusChip } from '../../components/ui';
import ERPActivityTimeline from '../../components/shared/ERPActivityTimeline';
import BillForm from '../../components/purchase/BillForm';
import ZohoPaperPreview from '../../components/admin/ZohoPaperPreview';


// ── Bill states ordered for the status bar ──────────────────────────────────
const BILL_STATES = ['DRAFT', 'PENDING', 'APPROVED', 'SCHEDULED', 'PAID', 'OVERDUE', 'VOID'];
const TERMINAL_STATES = ['PAID', 'VOID'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(date) {
  if (!date) return 'N/A';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
}

// ── List Item ─────────────────────────────────────────────────────────────────
function BillListItem({ bill, isSelected }) {
  const isOverdue = bill.status !== 'PAID' && bill.dueDate && new Date(bill.dueDate?.toDate?.() || bill.dueDate) < new Date();
  return (
    <div style={{ padding: '0.875rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#1d4ed8' : '#1e293b' }}>
          {bill.billNumber || bill.id?.slice(0, 8)}
        </span>
        <StatusChip status={isOverdue && bill.status !== 'PAID' ? 'OVERDUE' : (bill.status || 'DRAFT')} size="sm" />
      </div>
      <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>{bill.supplierName || '—'}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Due: {fmt(bill.dueDate)}
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isOverdue && bill.status !== 'PAID' ? '#dc2626' : '#1e293b' }}>
          {fmtCurrency(bill.totalAmount || bill.amount)}
        </span>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function BillDetail({ bill, onClose, onStatusChange }) {
  const [detailTab, setDetailTab] = useState('overview');
  const isTerminal = TERMINAL_STATES.includes((bill.status || '').toUpperCase());

  const handleStatus = async (newStatus) => {
    if (isTerminal) return;
    await updateDoc(doc(db, 'purchaseBills', bill.id), {
      status: newStatus,
      updatedAt: serverTimestamp(),
      statusHistory: arrayUnion({
        status: newStatus,
        changedAt: new Date().toISOString(),
        changedBy: 'Admin',
      }),
    });
    onStatusChange?.();
  };

  const handleMarkPaid = () => handleStatus('PAID');

  const subtotal = (bill.items || []).reduce((sum, i) => sum + (parseFloat(i.amount) || parseFloat(i.quantity) * parseFloat(i.unitPrice) || 0), 0);
  const tax = bill.tax || 0;
  const total = bill.totalAmount || bill.amount || subtotal + tax;

  const sectionStyle = { marginBottom: '1.5rem' };
  const sectionTitle = { fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.6rem' };
  const divider = { height: '1px', backgroundColor: '#e2e8f0', margin: '1.25rem 0' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{bill.billNumber || bill.id?.slice(0, 8)}</h2>
            <StatusChip status={bill.status || 'DRAFT'} />
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>Issued: {fmt(bill.createdAt || bill.issueDate)}</span>
            {bill.dueDate && <span>Due: {fmt(bill.dueDate)}</span>}
            {bill.zohoId && (
              <>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <a href={`https://books.zoho.eu/app#/bills/${bill.zohoId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
          { id: 'items', label: 'Line Items' },
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
                {BILL_STATES.map(s => {
                  const isCurrent = (bill.status || 'DRAFT').toUpperCase() === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatus(s)}
                      disabled={isTerminal && !isCurrent}
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
                  This bill is marked as {bill.status?.toLowerCase()} and is locked.
                </p>
              )}
            </div>

            {/* Vendor Card */}
            <div style={{ marginBottom: '1.5rem', backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={sectionTitle}>Vendor Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' }}>Vendor Name</label>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{bill.supplierName || '—'}</span>
                </div>
                {bill.supplierEmail && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' }}>Email Address</label>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{bill.supplierEmail}</span>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' }}>Due Date</label>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{bill.dueDate ? fmt(bill.dueDate) : '—'}</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' }}>Total Amount</label>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{fmtCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LINE ITEMS */}
        {detailTab === 'items' && (
          <div style={{ margin: '-1.5rem', backgroundColor: '#f8fafc' }}>
            <ZohoPaperPreview
              docType="BILL"
              documentData={{
                documentNumber: bill.billNumber || bill.id?.slice(0, 8),
                date: fmt(bill.createdAt || bill.issueDate),
                dueDate: fmt(bill.dueDate),
                supplierName: bill.supplierName,
                supplierEmail: bill.supplierEmail,
                items: bill.items || [],
                subTotal: subtotal,
                taxTotal: tax,
                grandTotal: total,
                notes: bill.notes || ''
              }}
            />
          </div>
        )}

        {/* TAB 3: ACTIVITY TIMELINE */}
        {detailTab === 'activity' && (
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={sectionTitle}>Activity logs</div>
            <div style={{ marginTop: '1rem' }}>
              <ERPActivityTimeline events={bill.statusHistory || []} currentStatus={bill.status} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
          {fmtCurrency(total)}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isTerminal && (
            <button
              onClick={handleMarkPaid}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CheckCircle size={14} /> Mark as Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BillList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const handleBulkAction = async (ids, newStatus) => {
    try {
      await Promise.all(ids.map(id =>
        updateDoc(doc(db, 'purchaseBills', id), {
          status: newStatus,
          statusHistory: arrayUnion({ status: newStatus, changedAt: new Date().toISOString(), changedBy: 'Admin (Bulk)' })
        })
      ));
      setRefreshToken(t => t + 1);
    } catch (err) { console.error(err); alert('Error processing bulk action.'); }
  };

  const handleBulkDelete = async (ids) => {
    if (!window.confirm(`Delete ${ids.length} bills? This cannot be undone.`)) return;
    try {
      await Promise.all(ids.map(id => deleteDoc(doc(db, 'purchaseBills', id))));
      setRefreshToken(t => t + 1);
    } catch (err) { console.error(err); alert('Error deleting bills.'); }
  };

  const bulkActions = [
    { label: 'Mark as Paid', onClick: (ids) => handleBulkAction(ids, 'PAID') },
    { label: 'Mark as Void', onClick: (ids) => handleBulkAction(ids, 'VOID') },
    { label: 'Delete', variant: 'danger', onClick: handleBulkDelete },
  ];

  useEffect(() => {
    let isSeeding = false;
    const q = query(collection(db, 'purchaseBills'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (data.length === 0 && !isSeeding) {
        isSeeding = true;
        try {
          const sample1 = {
            billNumber: "BILL-2026-001",
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
            billNumber: "BILL-2026-002",
            supplierName: "Apex Biochemicals Corp",
            supplierEmail: "info@apexbiochem.com",
            status: "PENDING",
            items: [
              { itemName: "TB-500 Acetate (API)", quantity: 50, unit: "g", expectedCost: 18.00, unitPrice: 18.00, total: 900.00 }
            ],
            totalAmount: 900.00,
            createdAt: new Date(),
            statusHistory: [
              { status: 'DRAFT', changedAt: new Date().toISOString(), changedBy: 'Admin' }
            ]
          };

          await addDoc(collection(db, 'purchaseBills'), sample1);
          await addDoc(collection(db, 'purchaseBills'), sample2);
        } catch (err) {
          console.error("Error seeding sample Bills:", err);
        } finally {
          isSeeding = false;
        }
      }

      setBills(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = bills.filter(r =>
    r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.billNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      <AdminPageHeader
        title="Supplier Bills"
        subtitle="Manage incoming vendor bills, reconcile with purchase orders, and track payments."
        icon={Receipt}
        actions={
          <button
            onClick={() => { setSelectedBill(null); setShowForm(true); }}
            className="btn btn-primary"
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <Plus size={16} /> New Bill
          </button>
        }
      />

      <ERPListDetailLayout
        items={filtered}
        loading={loading}
        getItemId={(b) => b.id}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by supplier or bill number..."
        headerLeft={
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>All Bills</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{filtered.length} records</div>
          </div>
        }
        bulkActions={bulkActions}
        renderListItem={(bill, isSelected) => (
          <BillListItem bill={bill} isSelected={isSelected} />
        )}
        renderDetail={(bill, onClose) => (
          <BillDetail
            key={bill.id + refreshToken}
            bill={bill}
            onClose={onClose}
            onStatusChange={() => setRefreshToken(t => t + 1)}
          />
        )}
      />

      {showForm && (
        <BillForm
          bill={selectedBill}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

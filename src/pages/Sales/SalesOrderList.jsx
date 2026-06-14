import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Plus from "lucide-react/dist/esm/icons/plus";
import X from "lucide-react/dist/esm/icons/x";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Package from "lucide-react/dist/esm/icons/package";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Send from "lucide-react/dist/esm/icons/send";
import Save from "lucide-react/dist/esm/icons/save";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, getDocs, where, increment, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';









import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ERPListDetailLayout from '../../components/shared/ERPListDetailLayout';
import { StatusChip , Checkbox } from '../../components/ui';
import ERPActivityTimeline from '../../components/shared/ERPActivityTimeline';
import B2BOrderBuilderTable from '../../components/admin/B2BOrderBuilderTable';
import ZohoPaperPreview from '../../components/admin/ZohoPaperPreview';

// ── States ───────────────────────────────────────────────────────────────────
const SO_STATES = ['CONFIRMED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'INVOICED', 'CANCELLED'];
const TERMINAL_STATES = ['DELIVERED', 'INVOICED', 'CANCELLED'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(date) {
  if (!date) return 'N/A';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

// ── List Item ─────────────────────────────────────────────────────────────────
function SOListItem({ so, isSelected }) {
  return (
    <div style={{ padding: '0.875rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#1d4ed8' : '#1e293b' }}>
          {so.documentNumber || so.id?.slice(0, 8)}
        </span>
        <StatusChip status={so.status || 'CONFIRMED'} size="sm" />
      </div>
      <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
        {so.customerName || '—'}
        {so.isDropship && (
          <span style={{ marginLeft: '6px', fontSize: '0.65rem', padding: '0.1rem 0.3rem', background: '#fef08a', color: '#854d0e', borderRadius: '4px', fontWeight: 600 }}>
            DROPSHIP
          </span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{fmt(so.createdAt)}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
          {fmtCurrency(so.grandTotal)}
        </span>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function SODetail({ so, onClose, onStatusChange, onEdit }) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');
  const isTerminal = TERMINAL_STATES.includes((so.status || '').toUpperCase());

  const handleStatus = async (newStatus) => {
    if (isTerminal) return;
    await updateDoc(doc(db, 'b2b_sales_orders', so.id), {
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

  const handleConvertToInvoice = async () => {
    setLoadingAction(true);
    try {
      const invNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        documentNumber: invNum,
        customerName: so.customerName,
        customerEmail: so.customerEmail || '',
        items: so.items || [],
        subTotal: so.subTotal || 0,
        taxTotal: so.taxTotal || 0,
        grandTotal: so.grandTotal || 0,
        notes: so.notes || '',
        status: 'Draft',
        linkedDocumentId: so.id,
        linkedDocumentNumber: so.documentNumber || so.id.slice(0, 8),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'b2b_invoices'), payload);

      // Decrement Inventory ONLY if it's not a dropship order
      if (!so.isDropship && so.items && so.items.length > 0) {
        for (const item of so.items) {
          const itemName = item.name || item.itemName;
          if (!itemName) continue;
          const q = query(collection(db, 'products'), where('name', '==', itemName));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const productDoc = snap.docs[0];
            await updateDoc(doc(db, 'products', productDoc.id), {
              stock: increment(-parseInt(item.quantity || 1))
            });
          }
        }
      }

      await updateDoc(doc(db, 'b2b_sales_orders', so.id), {
        status: 'INVOICED',
        invoiceNumber: invNum,
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: 'INVOICED',
          changedAt: new Date().toISOString(),
          changedBy: 'Admin'
        })
      });

      alert(so.isDropship ? "Invoice generated successfully (Stock unmodified due to Dropship)." : "Invoice generated successfully and stock updated.");
      onStatusChange?.();
    } catch (e) {
      console.error(e);
      alert("Error generating invoice");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleGenerateDropshipPO = async () => {
    const supplier = window.prompt("Enter the supplier name for this Dropship order:");
    if (!supplier) return;
    setLoadingAction(true);
    try {
      const items = (so.items || []).map(i => ({
        itemName: i.name || i.itemName,
        quantity: i.quantity || 1,
        unit: i.unit || 'vial',
        unitPrice: 0
      }));

      const payload = {
        supplierName: supplier,
        poNumber: `PO-DROP-${Date.now().toString().slice(-6)}`,
        status: 'DRAFT',
        items,
        totalAmount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        linkedSalesOrderId: so.id,
        notes: `Direct Shipment to Customer: ${so.customerName}`
      };

      await addDoc(collection(db, 'purchaseOrders'), payload);
      await updateDoc(doc(db, 'b2b_sales_orders', so.id), {
        poGenerated: true,
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: 'PO_GENERATED',
          changedAt: new Date().toISOString(),
          changedBy: 'Admin'
        })
      });

      alert("Purchase Order (Dropship) generated successfully.");
      onStatusChange?.();
    } catch (e) {
      console.error(e);
      alert("Error generating PO.");
    } finally {
      setLoadingAction(false);
    }
  };

  const sectionTitle = { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.6rem' };
  const divider = { height: '1px', backgroundColor: '#f1f5f9', margin: '1.25rem 0' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{so.documentNumber || so.id?.slice(0, 8)}</h2>
            <StatusChip status={so.status || 'CONFIRMED'} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>Order Date: {fmt(so.createdAt)}</span>
            {so.zohoId && (
              <>
                <span>•</span>
                <a href={`https://books.zoho.eu/app#/salesorders/${so.zohoId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  View in Zoho Books <ExternalLink size={12} />
                </a>
              </>
            )}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}>
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '0 1.5rem' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'document', label: 'Document Preview' },
          { id: 'activity', label: 'Activity' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setDetailTab(tab.id)}
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: detailTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              color: detailTab === tab.id ? '#2563eb' : '#64748b',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              marginBottom: '-1px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {detailTab === 'overview' && (
          <>
            {/* Status Flow */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sectionTitle}>Status</div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {SO_STATES.map(s => {
                  const isCurrent = (so.status || 'CONFIRMED').toUpperCase() === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatus(s)}
                      disabled={loadingAction || (isTerminal && !isCurrent)}
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
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  This order is {so.status?.toLowerCase().replace(/_/g, ' ')} and cannot be modified.
                </p>
              )}
            </div>
            <div style={divider} />

            {/* Origin Quotation */}
            {so.linkedDocumentId && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={sectionTitle}>Source Document</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '6px', fontSize: '0.82rem', color: '#6b21a8' }}>
                    <FileText size={13} />
                    Quote Ref: <strong>{so.linkedDocumentNumber}</strong>
                  </div>
                </div>
                <div style={divider} />
              </>
            )}

            {/* Customer Block */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sectionTitle}>Customer</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{so.customerName || '—'}</div>
              {so.customerEmail && <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>✉ {so.customerEmail}</div>}
              {so.isDropship && (
                <div style={{ marginTop: '0.5rem', display: 'inline-flex', padding: '0.2rem 0.5rem', backgroundColor: '#fef9c3', border: '1px solid #fef08a', borderRadius: '4px', fontSize: '0.75rem', color: '#854d0e', fontWeight: 600 }}>
                  Dropship Order (Direct Shipping)
                </div>
              )}
            </div>
            <div style={divider} />
          </>
        )}

        {detailTab === 'document' && (
          <div style={{ marginBottom: '2rem' }}>
            <ZohoPaperPreview
              docType="SALES ORDER"
              documentData={{
                documentNumber: so.documentNumber || so.id?.slice(0, 8),
                date: so.orderDate || fmt(so.createdAt),
                dueDate: so.shipmentDate || '—',
                customerName: so.customerName,
                customerEmail: so.customerEmail,
                items: so.items || [],
                subTotal: so.subTotal || 0,
                taxTotal: so.taxTotal || 0,
                grandTotal: so.grandTotal || 0,
                notes: so.notes || '',
                isDropship: so.isDropship || false
              }}
            />
          </div>
        )}

        {detailTab === 'activity' && (
          <div>
            <div style={sectionTitle}>Activity History</div>
            <ERPActivityTimeline events={so.statusHistory || []} currentStatus={so.status} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onEdit(so)}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          Edit Order
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {so.isDropship && !so.poGenerated && so.status !== 'Closed' && so.status !== 'INVOICED' && (
            <button
              onClick={handleGenerateDropshipPO}
              disabled={loadingAction}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              Generate PO (Dropship)
            </button>
          )}
          {so.status !== 'Closed' && so.status !== 'INVOICED' && so.status !== 'CANCELLED' && (
            <button
              onClick={handleConvertToInvoice}
              disabled={loadingAction}
              style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              Generate Invoice
            </button>
          )}
          {so.status !== 'Closed' && so.status !== 'CANCELLED' && (
            <button
              onClick={() => handleStatus('CANCELLED')}
              disabled={loadingAction}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Edit/New Sales Order Form Modal ──────────────────────────────────────────
function SalesOrderFormModal({ order, onClose, onSave }) {
  const [customerName, setCustomerName] = useState(order?.customerName || '');
  const [customerEmail, setCustomerEmail] = useState(order?.customerEmail || '');
  const [isDropship, setIsDropship] = useState(order?.isDropship || false);
  const [items, setItems] = useState(order?.items || []);
  const [notes, setNotes] = useState(order?.notes || '');
  const [orderDate, setOrderDate] = useState(order?.orderDate || new Date().toISOString().split('T')[0]);
  const [shipmentDate, setShipmentDate] = useState(order?.shipmentDate || '');
  const [paymentTerms, setPaymentTerms] = useState(order?.paymentTerms || 'Due on receipt');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!customerName || items.length === 0) return alert("Missing customer or items");
    setSaving(true);
    const subTotal = items.reduce((acc, item) => acc + ((parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0)), 0);
    const taxTotal = subTotal * 0.21;
    const grandTotal = subTotal + taxTotal;

    const payload = {
      customerName,
      customerEmail,
      items,
      subTotal,
      taxTotal,
      grandTotal,
      notes,
      isDropship,
      orderDate,
      shipmentDate,
      paymentTerms,
      updatedAt: serverTimestamp(),
    };

    try {
      if (order?.id) {
        await updateDoc(doc(db, 'b2b_sales_orders', order.id), payload);
      } else {
        payload.documentNumber = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.status = 'CONFIRMED';
        payload.createdAt = serverTimestamp();
        payload.statusHistory = [{
          status: 'CONFIRMED',
          changedAt: new Date().toISOString(),
          changedBy: 'Admin'
        }];
        await addDoc(collection(db, 'b2b_sales_orders'), payload);
      }
      onSave();
    } catch (e) {
      console.error(e);
      alert("Error saving sales order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '900px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
              {order ? 'Edit Sales Order' : 'New Sales Order'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Customer Name *</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="gcp-input" style={{ width: '100%' }} placeholder="E.g. Dr. Smith" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Customer Email</label>
              <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="gcp-input" style={{ width: '100%' }} placeholder="email@example.com" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Order Date</label>
              <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className="gcp-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Shipment Date</label>
              <input type="date" value={shipmentDate} onChange={e => setShipmentDate(e.target.value)} className="gcp-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Payment Terms</label>
              <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="gcp-input" style={{ width: '100%' }}>
                <option value="Due on receipt">Due on receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: '#1e293b' }}>
              <Checkbox checked={isDropship} onChange={e => setIsDropship(e.target.checked)} />
              Dropship Order (Directly from Supplier to Customer)
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Item Details</label>
            <B2BOrderBuilderTable items={items} onChange={setItems} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="gcp-input" style={{ width: '100%', height: '60px', padding: '0.5rem' }} placeholder="Optional notes..." />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SalesOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const handleBulkAction = async (ids, newStatus) => {
    try {
      const batch = [];
      for (const id of ids) {
        batch.push(updateDoc(doc(db, 'b2b_sales_orders', id), {
          status: newStatus,
          statusHistory: arrayUnion({ status: newStatus, changedAt: new Date().toISOString(), changedBy: 'Admin (Bulk)' })
        }));
      }
      await Promise.all(batch);
      setRefreshToken(t => t + 1);
    } catch (err) {
      console.error(err);
      alert("Error processing bulk action.");
    }
  };

  const handleBulkDelete = async (ids) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} sales orders?`)) return;
    try {
      const batch = [];
      for (const id of ids) {
        batch.push(deleteDoc(doc(db, 'b2b_sales_orders', id)));
      }
      await Promise.all(batch);
      setRefreshToken(t => t + 1);
    } catch (err) {
      console.error(err);
      alert("Error deleting documents.");
    }
  };

  const bulkActions = [
    { label: 'Mark as Confirmed', onClick: (ids) => handleBulkAction(ids, 'CONFIRMED') },
    { label: 'Mark as Shipped', onClick: (ids) => handleBulkAction(ids, 'SHIPPED') },
    { label: 'Delete', variant: 'danger', onClick: (ids) => handleBulkDelete(ids) },
  ];

  useEffect(() => {
    let isSeeding = false;
    const q = query(collection(db, 'b2b_sales_orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (data.length === 0 && !isSeeding) {
        isSeeding = true;
        try {
          const sample1 = {
            documentNumber: "PED-2026-001",
            customerName: "Clínica Dr. Sanz Longevity",
            customerEmail: "contacto@clinicasanz.es",
            status: "CONFIRMED",
            orderDate: "2026-06-01",
            shipmentDate: "2026-06-05",
            paymentTerms: "Net 15",
            items: [
              { name: "BPC-157 5mg (Vial)", quantity: 10, rate: 45.00, unit: "vial", sku: "BPC-157-5MG" },
              { name: "TB-500 2mg (Vial)", quantity: 5, rate: 38.00, unit: "vial", sku: "TB-500-2MG" }
            ],
            subTotal: 640.00,
            taxTotal: 134.40,
            grandTotal: 774.40,
            notes: "Entrega urgente requerida.",
            isDropship: false,
            createdAt: new Date(),
            statusHistory: [
              { status: 'CONFIRMED', changedAt: new Date().toISOString(), changedBy: 'System (Auto)' }
            ]
          };

          const sample2 = {
            documentNumber: "PED-2026-002",
            customerName: "Instituto Antienvejecimiento Barcelona",
            customerEmail: "pedidos@iabarcelona.com",
            status: "IN_PROGRESS",
            orderDate: "2026-06-04",
            shipmentDate: "2026-06-08",
            paymentTerms: "Due on receipt",
            items: [
              { name: "Semaglutide 5mg (Vial)", quantity: 20, rate: 75.00, unit: "vial", sku: "SEMA-5MG" }
            ],
            subTotal: 1500.00,
            taxTotal: 315.00,
            grandTotal: 1815.00,
            notes: "Fulfillment por dropshipping.",
            isDropship: true,
            createdAt: new Date(),
            statusHistory: [
              { status: 'CONFIRMED', changedAt: new Date(Date.now() - 86400000).toISOString(), changedBy: 'Admin' },
              { status: 'IN_PROGRESS', changedAt: new Date().toISOString(), changedBy: 'Admin' }
            ]
          };

          await addDoc(collection(db, 'b2b_sales_orders'), sample1);
          await addDoc(collection(db, 'b2b_sales_orders'), sample2);
        } catch (err) {
          console.error("Error seeding sample sales orders:", err);
        } finally {
          isSeeding = false;
        }
      }

      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = orders.filter(r =>
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      <AdminPageHeader
        title="B2B Sales Orders"
        subtitle="Track sales order confirmations, prepare shipments, and generate customer invoices."
        icon={ShoppingCart}
        actions={
          <button
            onClick={() => { setSelectedOrder(null); setShowForm(true); }}
            className="btn btn-primary"
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <Plus size={16} /> New Sales Order
          </button>
        }
      />

      <ERPListDetailLayout
        items={filtered}
        loading={loading}
        getItemId={(o) => o.id}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by customer or order number..."
        headerLeft={
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>All Sales Orders</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{filtered.length} records</div>
          </div>
        }
        bulkActions={bulkActions}
        renderListItem={(so, isSelected) => <SOListItem so={so} isSelected={isSelected} />}
        renderDetail={(so, onClose) => (
          <SODetail
            key={so.id + refreshToken}
            so={so}
            onClose={onClose}
            onStatusChange={() => setRefreshToken(t => t + 1)}
            onEdit={(o) => { setSelectedOrder(o); setShowForm(true); }}
          />
        )}
      />

      {showForm && (
        <SalesOrderFormModal
          order={selectedOrder}
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false);
            setRefreshToken(t => t + 1);
          }}
        />
      )}
    </div>
  );
}
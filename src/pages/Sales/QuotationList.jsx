import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FileText, Plus, X, CheckCircle, Sparkles, Building2, Calendar, User, Mail, PlusCircle, Save, ExternalLink } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ERPListDetailLayout from '../../components/shared/ERPListDetailLayout';
import { StatusChip, Checkbox, TextField } from '../../components/ui';
import ERPActivityTimeline from '../../components/shared/ERPActivityTimeline';
import B2BOrderBuilderTable from '../../components/admin/B2BOrderBuilderTable';
import ZohoPaperPreview from '../../components/admin/ZohoPaperPreview';

// ── States ───────────────────────────────────────────────────────────────────
const QUOTE_STATES = ['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'CONVERTED_TO_SO', 'CANCELLED'];
const TERMINAL_STATES = ['CONVERTED_TO_SO', 'CANCELLED'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(date) {
  if (!date) return 'N/A';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(amount) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

// ── List Item ─────────────────────────────────────────────────────────────────
function QuotationListItem({ quote, isSelected }) {
  return (
    <div style={{ padding: '0.875rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#1d4ed8' : '#1e293b' }}>
          {quote.documentNumber || quote.id?.slice(0, 8)}
        </span>
        <StatusChip status={quote.status || 'DRAFT'} size="sm" />
      </div>
      <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
        {quote.customerName || '—'}
        {quote.isDropship && (
          <span style={{ marginLeft: '6px', fontSize: '0.65rem', padding: '0.1rem 0.3rem', background: '#fef08a', color: '#854d0e', borderRadius: '4px', fontWeight: 600 }}>
            DROPSHIP
          </span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{fmt(quote.createdAt)}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
          {fmtCurrency(quote.grandTotal)}
        </span>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function QuotationDetail({ quote, onClose, onStatusChange, onEdit }) {
  const [converting, setConverting] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');
  const isTerminal = TERMINAL_STATES.includes((quote.status || '').toUpperCase());

  const handleStatus = async (newStatus) => {
    if (isTerminal) return;
    await updateDoc(doc(db, 'b2b_quotations', quote.id), {
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

  const handleConvertToSO = async () => {
    if (quote.status?.toUpperCase() !== 'ACCEPTED') return;
    setConverting(true);
    try {
      const soNum = `SO-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Create Sales Order
      const soRef = await addDoc(collection(db, 'b2b_sales_orders'), {
        documentNumber: soNum,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail || '',
        items: quote.items || [],
        subTotal: quote.subTotal || 0,
        taxTotal: quote.taxTotal || 0,
        grandTotal: quote.grandTotal || 0,
        notes: quote.notes || '',
        isDropship: quote.isDropship || false,
        status: 'Confirmed',
        linkedDocumentId: quote.id,
        linkedDocumentNumber: quote.documentNumber || quote.id.slice(0, 8),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statusHistory: [{
          status: 'Confirmed',
          changedAt: new Date().toISOString(),
          changedBy: 'System (Converted from Quote)'
        }]
      });

      // Update Quotation
      await updateDoc(doc(db, 'b2b_quotations', quote.id), {
        status: 'CONVERTED_TO_SO',
        soId: soRef.id,
        soNumber: soNum,
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: 'CONVERTED_TO_SO',
          changedAt: new Date().toISOString(),
          changedBy: 'Admin'
        })
      });

      onStatusChange?.();
    } catch (e) {
      console.error("Error converting Quotation to Sales Order:", e);
      alert("Failed to convert Quotation to Sales Order.");
    } finally {
      setConverting(false);
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
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{quote.documentNumber || quote.id?.slice(0, 8)}</h2>
            <StatusChip status={quote.status || 'DRAFT'} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>Fecha de emisión: {fmt(quote.createdAt)}</span>
            {quote.zohoId && (
              <>
                <span>•</span>
                <a href={`https://books.zoho.eu/app#/quotes/${quote.zohoId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Ver en Zoho Books <ExternalLink size={12} />
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
                {QUOTE_STATES.map(s => {
                  const isCurrent = (quote.status || 'DRAFT').toUpperCase() === s;
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
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  Este presupuesto está {quote.status?.toLowerCase().replace(/_/g, ' ')} y no puede ser modificado.
                </p>
              )}
            </div>
            <div style={divider} />

            {/* Customer Block */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sectionTitle}>Cliente</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{quote.customerName || '—'}</div>
              {quote.customerEmail && <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>✉ {quote.customerEmail}</div>}
              {quote.isDropship && (
                <div style={{ marginTop: '0.5rem', display: 'inline-flex', padding: '0.2rem 0.5rem', backgroundColor: '#fef9c3', border: '1px solid #fef08a', borderRadius: '4px', fontSize: '0.75rem', color: '#854d0e', fontWeight: 600 }}>
                  Direct Shipment (Dropshipping)
                </div>
              )}
            </div>
            <div style={divider} />

            {/* Linked Sales Order */}
            {quote.soId && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={sectionTitle}>Pedido de Ventas Vinculado</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '0.82rem', color: '#1e40af' }}>
                    <CheckCircle size={13} />
                    SO Vinculado: <strong>{quote.soNumber}</strong>
                  </div>
                </div>
                <div style={divider} />
              </>
            )}
          </>
        )}

        {detailTab === 'document' && (
          <div style={{ marginBottom: '2rem' }}>
            <ZohoPaperPreview
              docType="QUOTATION"
              documentData={{
                documentNumber: quote.documentNumber || quote.id?.slice(0, 8),
                date: quote.quoteDate || fmt(quote.createdAt),
                validUntil: quote.validUntil || '—',
                customerName: quote.customerName,
                customerEmail: quote.customerEmail,
                items: quote.items || [],
                subTotal: quote.subTotal || 0,
                taxTotal: quote.taxTotal || 0,
                grandTotal: quote.grandTotal || 0,
                notes: quote.notes || '',
                isDropship: quote.isDropship || false
              }}
            />
          </div>
        )}

        {detailTab === 'activity' && (
          <div>
            <div style={sectionTitle}>Activity History</div>
            <ERPActivityTimeline events={quote.statusHistory || []} currentStatus={quote.status} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onEdit(quote)}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          Edit Quotation
        </button>
        {quote.status?.toUpperCase() === 'ACCEPTED' && (
          <button
            onClick={handleConvertToSO}
            disabled={converting}
            style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <CheckCircle size={14} /> {converting ? 'Generating SO...' : 'Convert to Sales Order'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Edit/New Quotation Form Modal ─────────────────────────────────────────────
function QuotationFormModal({ quote, onClose, onSave }) {
  const [customerName, setCustomerName] = useState(quote?.customerName || '');
  const [customerEmail, setCustomerEmail] = useState(quote?.customerEmail || '');
  const [isDropship, setIsDropship] = useState(quote?.isDropship || false);
  const [items, setItems] = useState(quote?.items || []);
  const [notes, setNotes] = useState(quote?.notes || '');
  const [quoteDate, setQuoteDate] = useState(quote?.quoteDate || new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(quote?.validUntil || '');
  const [paymentTerms, setPaymentTerms] = useState(quote?.paymentTerms || 'Due on receipt');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!customerName || items.length === 0) return alert("Falta cliente o artículos");
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
      quoteDate,
      validUntil,
      paymentTerms,
      updatedAt: serverTimestamp(),
    };

    try {
      if (quote?.id) {
        await updateDoc(doc(db, 'b2b_quotations', quote.id), payload);
      } else {
        payload.documentNumber = `EST-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.status = 'Draft';
        payload.createdAt = serverTimestamp();
        payload.statusHistory = [{
          status: 'Draft',
          changedAt: new Date().toISOString(),
          changedBy: 'Admin'
        }];
        await addDoc(collection(db, 'b2b_quotations'), payload);
      }
      onSave();
    } catch (e) {
      console.error(e);
      alert("Error al guardar presupuesto");
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
              {quote ? 'Edit Quotation' : 'New Quotation'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Nombre del Cliente *</label>
              <TextField
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Ej. Dr. Martínez" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Email del Cliente</label>
              <TextField
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="email@ejemplo.com" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Fecha de Emisión</label>
              <input type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} className="gcp-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Válido Hasta</label>
              <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="gcp-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Condiciones de Pago</label>
              <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="gcp-input" style={{ width: '100%' }}>
                <option value="Due on receipt">Vencimiento al recibir</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: '#1e293b' }}>
              <Checkbox checked={isDropship} onChange={e => setIsDropship(e.target.checked)} />
              Pedido Dropshipping (Envío directo de Proveedor a Cliente)
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Detalle de Artículos</label>
            <B2BOrderBuilderTable items={items} onChange={setItems} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="gcp-input" style={{ width: '100%', height: '60px', padding: '0.5rem' }} placeholder="Notas opcionales..." />
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
export default function QuotationList() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const handleBulkAction = async (ids, newStatus) => {
    try {
      const batch = [];
      for (const id of ids) {
        batch.push(updateDoc(doc(db, 'b2b_quotations', id), {
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
    if (!window.confirm(`Are you sure you want to delete ${ids.length} quotations?`)) return;
    try {
      const batch = [];
      for (const id of ids) {
        batch.push(deleteDoc(doc(db, 'b2b_quotations', id)));
      }
      await Promise.all(batch);
      setRefreshToken(t => t + 1);
    } catch (err) {
      console.error(err);
      alert("Error deleting documents.");
    }
  };

  const bulkActions = [
    { label: 'Mark as Sent', onClick: (ids) => handleBulkAction(ids, 'SENT') },
    { label: 'Mark as Accepted', onClick: (ids) => handleBulkAction(ids, 'ACCEPTED') },
    { label: 'Mark as Declined', onClick: (ids) => handleBulkAction(ids, 'DECLINED') },
    { label: 'Delete', variant: 'danger', onClick: (ids) => handleBulkDelete(ids) },
  ];

  useEffect(() => {
    let isSeeding = false;
    const q = query(collection(db, 'b2b_quotations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (data.length === 0 && !isSeeding) {
        isSeeding = true;
        try {
          const sample1 = {
            documentNumber: "EST-2026-001",
            customerName: "Clínica Dr. Sanz Longevity",
            customerEmail: "contacto@clinicasanz.es",
            status: "ACCEPTED",
            quoteDate: "2026-06-01",
            validUntil: "2026-06-15",
            paymentTerms: "Net 15",
            items: [
              { name: "BPC-157 5mg (Vial)", quantity: 10, rate: 45.00, unit: "vial", sku: "BPC-157-5MG" },
              { name: "TB-500 2mg (Vial)", quantity: 5, rate: 38.00, unit: "vial", sku: "TB-500-2MG" }
            ],
            subTotal: 640.00,
            taxTotal: 134.40,
            grandTotal: 774.40,
            notes: "Presupuesto especial para lote de clínica. Entrega en temperatura controlada.",
            isDropship: false,
            createdAt: new Date(),
            statusHistory: [
              { status: 'DRAFT', changedAt: new Date(Date.now() - 86400000 * 2).toISOString(), changedBy: 'System' },
              { status: 'SENT', changedAt: new Date(Date.now() - 86400000).toISOString(), changedBy: 'Admin' },
              { status: 'ACCEPTED', changedAt: new Date().toISOString(), changedBy: 'Cliente' }
            ]
          };
          
          const sample2 = {
            documentNumber: "EST-2026-002",
            customerName: "Instituto Antienvejecimiento Barcelona",
            customerEmail: "pedidos@iabarcelona.com",
            status: "DRAFT",
            quoteDate: "2026-06-03",
            validUntil: "2026-06-18",
            paymentTerms: "Due on receipt",
            items: [
              { name: "Semaglutide 5mg (Vial)", quantity: 20, rate: 75.00, unit: "vial", sku: "SEMA-5MG" }
            ],
            subTotal: 1500.00,
            taxTotal: 315.00,
            grandTotal: 1815.00,
            notes: "Fulfillment por dropshipping directo desde el laboratorio.",
            isDropship: true,
            createdAt: new Date(),
            statusHistory: [
              { status: 'DRAFT', changedAt: new Date().toISOString(), changedBy: 'Admin' }
            ]
          };
          
          await addDoc(collection(db, 'b2b_quotations'), sample1);
          await addDoc(collection(db, 'b2b_quotations'), sample2);
        } catch (err) {
          console.error("Error seeding sample quotations:", err);
        } finally {
          isSeeding = false;
        }
      }
      
      setQuotes(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = quotes.filter(r =>
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      <AdminPageHeader
        title="B2B Quotations"
        subtitle="Manage client quote proposals and convert accepted quotes to Sales Orders."
        icon={FileText}
        actions={
          <button
            onClick={() => { setSelectedQuote(null); setShowForm(true); }}
            className="btn btn-primary"
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <Plus size={16} /> New Quotation
          </button>
        }
      />

      <ERPListDetailLayout
        items={filtered}
        loading={loading}
        getItemId={(q) => q.id}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by customer or quote number..."
        headerLeft={
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>All Quotations</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{filtered.length} records</div>
          </div>
        }
        bulkActions={bulkActions}
        renderListItem={(quote, isSelected) => <QuotationListItem quote={quote} isSelected={isSelected} />}
        renderDetail={(quote, onClose) => (
          <QuotationDetail
            key={quote.id + refreshToken}
            quote={quote}
            onClose={onClose}
            onStatusChange={() => setRefreshToken(t => t + 1)}
            onEdit={(q) => { setSelectedQuote(q); setShowForm(true); }}
          />
        )}
      />

      {showForm && (
        <QuotationFormModal
          quote={selectedQuote}
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

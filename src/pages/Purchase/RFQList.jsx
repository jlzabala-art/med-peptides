import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FileText, Plus, X, CheckCircle, Sparkles, Building2, Package, Calendar, Phone, Mail, Link as LinkIcon, ShoppingCart, ExternalLink } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ERPListDetailLayout from '../../components/shared/ERPListDetailLayout';
import { StatusChip } from '../../components/ui';
import ERPActivityTimeline from '../../components/shared/ERPActivityTimeline';
import RFQForm from '../../components/purchase/RFQForm';
import PriceListImportModal from '../../components/purchase/PriceListImportModal';
import ZohoPaperPreview from '../../components/admin/ZohoPaperPreview';


// ── RFQ States ───────────────────────────────────────────────────────────────
const RFQ_STATES = ['DRAFT', 'SENT', 'PRICING_SUBMITTED', 'APPROVED', 'CONVERTED_TO_PO', 'CANCELLED'];
const TERMINAL_STATES = ['CONVERTED_TO_PO', 'CANCELLED'];

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
function RFQListItem({ rfq, isSelected }) {
  return (
    <div style={{ padding: '0.875rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#1d4ed8' : '#1e293b' }}>
          {rfq.rfqNumber || rfq.id?.slice(0, 8)}
        </span>
        <StatusChip status={rfq.status || 'DRAFT'} size="sm" />
      </div>
      <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>{rfq.supplierName || '—'}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{fmt(rfq.createdAt)}</span>
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
          {rfq.items?.length || 0} {rfq.items?.length === 1 ? 'item' : 'items'}
        </span>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function RFQDetail({ rfq, onClose, onStatusChange, onEdit }) {
  const [copied, setCopied] = useState(false);
  const [converting, setConverting] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');
  const isTerminal = TERMINAL_STATES.includes((rfq.status || '').toUpperCase());

  const handleStatus = async (newStatus) => {
    if (isTerminal) return;
    await updateDoc(doc(db, 'purchase_rfqs', rfq.id), {
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

  const handleCopyLink = () => {
    const url = `${window.location.origin}/supplier-quote/${rfq.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConvertToPO = async () => {
    if (rfq.status !== 'approved' && rfq.status !== 'APPROVED') return;
    setConverting(true);
    try {
      // Calculate PO items from RFQ items
      const poItems = (rfq.items || []).map(item => {
        const cost = parseFloat(item.supplierUnitCost || 0);
        const disc = parseFloat(item.itemDiscount || 0);
        const netCost = Math.max(0, cost - disc);
        return {
          itemName: item.itemName,
          quantity: item.quantity || 1,
          unit: item.unit || 'vial',
          unitPrice: netCost
        };
      });

      const itemsTotal = poItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const globalDisc = parseFloat(rfq.globalDiscount || 0);
      const totalAmount = Math.max(0, itemsTotal - globalDisc);

      const poNum = `PO-${Date.now().toString().slice(-6)}`;

      // Create PO
      const poRef = await addDoc(collection(db, 'purchaseOrders'), {
        supplierName: rfq.supplierName,
        supplierZohoId: rfq.supplierZohoId || null,
        poNumber: poNum,
        status: 'DRAFT',
        items: poItems,
        totalAmount,
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber || rfq.id.slice(0, 8),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statusHistory: [{
          status: 'DRAFT',
          changedAt: new Date().toISOString(),
          changedBy: 'System (Converted from RFQ)'
        }]
      });

      // Update RFQ
      await updateDoc(doc(db, 'purchase_rfqs', rfq.id), {
        status: 'CONVERTED_TO_PO',
        poId: poRef.id,
        poNumber: poNum,
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: 'CONVERTED_TO_PO',
          changedAt: new Date().toISOString(),
          changedBy: 'Admin'
        })
      });

      onStatusChange?.();
    } catch (e) {
      console.error("Error converting RFQ to PO:", e);
      alert("Failed to convert RFQ to PO.");
    } finally {
      setConverting(false);
    }
  };

  const sectionTitle = { fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.6rem' };
  const divider = { height: '1px', backgroundColor: '#e2e8f0', margin: '1.25rem 0' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{rfq.rfqNumber || rfq.id?.slice(0, 8)}</h2>
            <StatusChip status={rfq.status || 'DRAFT'} />
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>Created: {fmt(rfq.createdAt)}</span>
            {rfq.zohoId && (
              <>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <a href={`https://books.zoho.eu/app#/rfqs/${rfq.zohoId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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

      {/* Tabs bar */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', backgroundColor: 'white', flexShrink: 0 }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'preview', label: 'Document Preview' },
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
                {RFQ_STATES.map(s => {
                  const isCurrent = (rfq.status || 'DRAFT').toUpperCase() === s;
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
                  This RFQ is locked as {rfq.status?.toLowerCase().replace(/_/g, ' ')} and cannot be transitioned.
                </p>
              )}
            </div>

            {/* Supplier Details Card */}
            <div style={{ marginBottom: '1.5rem', backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={sectionTitle}>Supplier Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' }}>Supplier Name</label>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{rfq.supplierName || '—'}</span>
                </div>
                {rfq.supplierEmail && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase' }}>Email Address</label>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{rfq.supplierEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Linked PO Card */}
            {rfq.poId && (
              <div style={{ marginBottom: '1.5rem', backgroundColor: '#f0fdf4', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <div style={{ ...sectionTitle, color: '#15803d' }}>Linked Purchase Order</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#166534', marginTop: '0.5rem', fontWeight: 600 }}>
                  <ShoppingCart size={14} />
                  PO Number: <strong>{rfq.poNumber}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCUMENT PREVIEW */}
        {detailTab === 'preview' && (
          <div style={{ margin: '-1.5rem', backgroundColor: '#f8fafc' }}>
            <ZohoPaperPreview
              docType="REQUEST FOR QUOTATION"
              documentData={{
                documentNumber: rfq.rfqNumber || rfq.id?.slice(0, 8),
                date: fmt(rfq.createdAt),
                supplierName: rfq.supplierName,
                supplierEmail: rfq.supplierEmail,
                items: rfq.items || [],
                globalDiscount: rfq.globalDiscount || 0,
                notes: rfq.notes || ''
              }}
            />
          </div>
        )}

        {/* TAB 3: ACTIVITY TIMELINE */}
        {detailTab === 'activity' && (
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={sectionTitle}>Activity Logs</div>
            <div style={{ marginTop: '1rem' }}>
              <ERPActivityTimeline events={rfq.statusHistory || []} currentStatus={rfq.status} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onEdit(rfq)}
            style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            Edit RFQ
          </button>
          {!isTerminal && (
            <button
              onClick={handleCopyLink}
              style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: copied ? '#16a34a' : '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {copied ? <CheckCircle size={14} /> : <LinkIcon size={14} />}
              {copied ? 'Link Copied!' : 'Copy Portal Link'}
            </button>
          )}
        </div>
        {(rfq.status === 'approved' || rfq.status === 'APPROVED') && (
          <button
            onClick={handleConvertToPO}
            disabled={converting}
            style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ShoppingCart size={14} /> {converting ? 'Converting...' : 'Convert to PO'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RFQList() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const handleBulkAction = async (ids, newStatus) => {
    try {
      await Promise.all(ids.map(id =>
        updateDoc(doc(db, 'purchase_rfqs', id), {
          status: newStatus,
          statusHistory: arrayUnion({ status: newStatus, changedAt: new Date().toISOString(), changedBy: 'Admin (Bulk)' })
        })
      ));
      setRefreshToken(t => t + 1);
    } catch (err) { console.error(err); alert('Error processing bulk action.'); }
  };

  const handleBulkDelete = async (ids) => {
    if (!window.confirm(`Delete ${ids.length} RFQs? This cannot be undone.`)) return;
    try {
      await Promise.all(ids.map(id => deleteDoc(doc(db, 'purchase_rfqs', id))));
      setRefreshToken(t => t + 1);
    } catch (err) { console.error(err); alert('Error deleting RFQs.'); }
  };

  const bulkActions = [
    { label: 'Mark as Sent', onClick: (ids) => handleBulkAction(ids, 'SENT') },
    { label: 'Mark as Cancelled', onClick: (ids) => handleBulkAction(ids, 'CANCELLED') },
    { label: 'Delete', variant: 'danger', onClick: handleBulkDelete },
  ];

  useEffect(() => {
    let isSeeding = false;
    const q = query(collection(db, 'purchase_rfqs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (data.length === 0 && !isSeeding) {
        isSeeding = true;
        try {
          const sample1 = {
            rfqNumber: "RFQ-2026-001",
            supplierName: "Global Peptide Synthesis Ltd.",
            supplierEmail: "sales@globalpeptides.com",
            status: "APPROVED",
            items: [
              { itemName: "BPC-157 Acetate (API)", quantity: 100, unit: "g", expectedCost: 12.00, supplierUnitCost: 11.50, itemDiscount: 0.50 }
            ],
            globalDiscount: 0,
            notes: "Expected delivery time is 4 weeks from order confirmation.",
            createdAt: new Date(),
            statusHistory: [
              { status: 'DRAFT', changedAt: new Date(Date.now() - 86400000 * 2).toISOString(), changedBy: 'System' },
              { status: 'SENT', changedAt: new Date(Date.now() - 86400000).toISOString(), changedBy: 'Admin' },
              { status: 'APPROVED', changedAt: new Date().toISOString(), changedBy: 'Admin' }
            ]
          };

          const sample2 = {
            rfqNumber: "RFQ-2026-002",
            supplierName: "Apex Biochemicals Corp",
            supplierEmail: "info@apexbiochem.com",
            status: "DRAFT",
            items: [
              { itemName: "TB-500 Acetate (API)", quantity: 50, unit: "g", expectedCost: 18.00, supplierUnitCost: 0, itemDiscount: 0 }
            ],
            globalDiscount: 0,
            notes: "Need CoA reports for all batches.",
            createdAt: new Date(),
            statusHistory: [
              { status: 'DRAFT', changedAt: new Date().toISOString(), changedBy: 'Admin' }
            ]
          };

          await addDoc(collection(db, 'purchase_rfqs'), sample1);
          await addDoc(collection(db, 'purchase_rfqs'), sample2);
        } catch (err) {
          console.error("Error seeding sample RFQs:", err);
        } finally {
          isSeeding = false;
        }
      }

      setRfqs(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = rfqs.filter(r =>
    r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      <AdminPageHeader
        title="Requests for Quotation"
        subtitle="Manage supplier quote requests before converting to Purchase Orders."
        icon={FileText}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn"
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#f3e8ff', color: '#7e22ce', borderColor: '#d8b4fe' }}
            >
              <Sparkles size={16} /> Atlas AI Import
            </button>
            <button
              onClick={() => { setSelectedRfq(null); setShowForm(true); }}
              className="btn btn-primary"
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <Plus size={16} /> New RFQ
            </button>
          </div>
        }
      />

      <ERPListDetailLayout
        items={filtered}
        loading={loading}
        getItemId={(r) => r.id}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by supplier or RFQ number..."
        headerLeft={
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>All RFQs</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{filtered.length} records</div>
          </div>
        }
        bulkActions={bulkActions}
        renderListItem={(rfq, isSelected) => <RFQListItem rfq={rfq} isSelected={isSelected} />}
        renderDetail={(rfq, onClose) => (
          <RFQDetail
            key={rfq.id + refreshToken}
            rfq={rfq}
            onClose={onClose}
            onStatusChange={() => setRefreshToken(t => t + 1)}
            onEdit={(r) => { setSelectedRfq(r); setShowForm(true); }}
          />
        )}
      />

      {showForm && (
        <RFQForm
          rfq={selectedRfq}
          key={selectedRfq?.id || 'new'}
          onClose={() => setShowForm(false)}
          onItemsInjected={(newItems) => {
            setSelectedRfq(prev => ({
              ...(prev || {}),
              items: [...(prev?.items || []), ...newItems]
            }));
          }}
        />
      )}

      {showImportModal && (
        <PriceListImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => console.log('Import successful')}
          openRfq={showForm ? selectedRfq : null}
          onAddToRfq={(extractedItems) => {
            const rfqItems = extractedItems.map(item => ({
              itemName: item.peptideName,
              quantity: item.quantity || 1,
              unit: item.unit || 'g',
              expectedCost: item.pricePerGram || 0,
              supplierUnitCost: 0,
              itemDiscount: 0
            }));
            if (showForm) {
              setSelectedRfq(prev => ({
                ...(prev || {}),
                items: [...(prev?.items || []), ...rfqItems]
              }));
            } else {
              setSelectedRfq({ items: rfqItems });
              setShowForm(true);
            }
            setShowImportModal(false);
          }}
        />
      )}
    </div>
  );
}

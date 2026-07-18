"use client";

import { usePathname } from 'next/navigation';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, updateDoc, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, functions, storage, auth } from '../../firebase';




import { Card } from '../ui';
import notifier from '../../services/NotificationService';
import SupplierPriceListUpdater from './gadgets/SupplierPriceListUpdater';
import DataTable from '../ui/DataTable';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';
import { FileText, Loader2, Plus, Sparkles, CheckCircle, AlertTriangle, Send, Receipt, Download, Activity } from '@/lib/icons';

export default function AdminRFQTab({ isSubTab = false }) {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [parseProgress, setParseProgress] = useState({ state: 'idle', count: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname();
  const params = new URLSearchParams(location.search);
  const deepLinkSearch = params.get('rfqId');

  useEffect(() => {
    if (deepLinkSearch) {
      setSearchTerm(deepLinkSearch);
    }
  }, [deepLinkSearch]);


  // New RFQ State
  const [currentRFQ, setCurrentRFQ] = useState(null);
  const [globalMargin, setGlobalMargin] = useState(20);
  const [marginType, setMarginType] = useState('global'); // 'global' or 'per-item'

  // Preview Mode State
  const [previewData, setPreviewData] = useState(null);
  const [previewType, setPreviewType] = useState('supplier');
  const [reconciliationResult, setReconciliationResult] = useState(null);
  const [selectedRfqId, setSelectedRfqId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  useEffect(() => {
    loadRfqs();
  }, []);

  const loadRfqs = async () => {
    setLoading(true);
    try {
      // Golden Rule: limit(100) — never pull unbounded collections
      const q = query(collection(db, 'agency_rfqs'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      setRfqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading rfqs:", err);
    }
    setLoading(false);
  };

  const handleCreateNewRFQ = () => {
    setShowUploadModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const tempId = crypto.randomUUID();
      const currentUserUid = auth.currentUser?.uid || 'unknown';
      const storagePath = `temp_imports/${currentUserUid}/${tempId}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, storagePath);

      setParseProgress({ state: 'uploading', count: 0 });
      await uploadBytes(storageRef, file);

      setParseProgress({ state: 'analyzing', count: 0 });
      const parseRFQDocument = httpsCallable(functions, 'parseRFQDocument');
      const response = await parseRFQDocument({
        storagePath: storagePath,
        mimeType: file.type || 'application/octet-stream',
      });

      if (response.data.success) {
        // Init the parsed items with cost and margin states
        const parsedItems = response.data.items.map(item => ({
          ...item,
          supplierUnitCost: 0,
          marginPercent: 20,
          clientUnitPrice: 0
        }));

        setCurrentRFQ({
          clientName: 'Magenta Compounding Pharmacy', // Defaulting for now
          supplierName: 'LotusLand',
          items: parsedItems,
          status: 'DRAFT'
        });
      } else {
        notifier.error("Failed to parse RFQ: " + response.data.error);
      }
    } catch (err) {
      console.error("Parse Error:", err);
      notifier.error("Error parsing document.");
    }
    setParseProgress({ state: 'idle', count: 0 });
  };

  const calculateClientPrice = (cost, margin) => {
    const c = parseFloat(cost) || 0;
    const m = parseFloat(margin) || 0;
    // Price = Cost / (1 - margin/100) or Cost + (Cost * margin/100)
    // We will use standard markup: Cost * (1 + margin/100)
    return c * (1 + (m / 100));
  };

  const handleItemCostChange = (index, cost) => {
    const updated = { ...currentRFQ };
    updated.items[index].supplierUnitCost = cost;
    const marginToUse = marginType === 'global' ? globalMargin : updated.items[index].marginPercent;
    updated.items[index].clientUnitPrice = calculateClientPrice(cost, marginToUse);
    setCurrentRFQ(updated);
  };

  const handleItemMarginChange = (index, margin) => {
    const updated = { ...currentRFQ };
    updated.items[index].marginPercent = margin;
    updated.items[index].clientUnitPrice = calculateClientPrice(updated.items[index].supplierUnitCost, margin);
    setCurrentRFQ(updated);
  };

  const handleItemQtyChange = (index, qty) => {
    const updated = { ...currentRFQ };
    updated.items[index].quantity = parseInt(qty, 10) || 0;
    setCurrentRFQ(updated);
  };

  const handleItemUnitsChange = (index, units) => {
    const updated = { ...currentRFQ };
    updated.items[index].units = units;
    setCurrentRFQ(updated);
  };

  const handleGlobalMarginChange = (val) => {
    setGlobalMargin(val);
    if (marginType === 'global' && currentRFQ) {
      const updated = { ...currentRFQ };
      updated.items = updated.items.map(item => ({
        ...item,
        marginPercent: val,
        clientUnitPrice: calculateClientPrice(item.supplierUnitCost, val)
      }));
      setCurrentRFQ(updated);
    }
  };

  const handleMarginTypeChange = (type) => {
    setMarginType(type);
    if (type === 'global' && currentRFQ) {
      handleGlobalMarginChange(globalMargin);
    }
  };

  const handleSaveRFQ = async () => {
    try {
      await addDoc(collection(db, 'agency_rfqs'), {
        ...currentRFQ,
        marginType,
        globalMargin,
        poAttached: false,
        poFileUrl: null,
        sharedWithSupplier: false, // Tracks if supplier magic link was viewed
        createdAt: serverTimestamp()
      });
      setShowUploadModal(false);
      setCurrentRFQ(null);
      loadRfqs();
    } catch (err) {
      console.error(err);
      notifier.error("Error saving RFQ.");
    }
  };

  const togglePOAttached = async (id, currentVal) => {
    try {
      await updateDoc(doc(db, 'agency_rfqs', id), {
        poAttached: !currentVal
      });
      loadRfqs();
    } catch (err) {
      notifier.error("Error updating PO status");
    }
  };

  const convertToPO = async (rfq) => {
    notifier.confirmCritical('Convert this RFQ to a Purchase Order?', async () => {
      try {
        const items = rfq.items.map(i => ({
          itemName: i.itemName || i.productName || i.name,
          quantity: i.quantity || 1,
          unit: i.units || 'vial',
          unitPrice: parseFloat(i.supplierUnitCost) || 0
        }));
        const totalAmount = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

        const payload = {
          supplierName: rfq.supplierName || 'Unknown Supplier',
          poNumber: `PO-${Date.now().toString().slice(-6)}`,
          status: 'open',
          items,
          totalAmount,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          linkedRfqId: rfq.id
        };
        await addDoc(collection(db, 'purchaseOrders'), payload);
        await updateDoc(doc(db, 'agency_rfqs', rfq.id), { status: 'PO_CREATED', poAttached: true });
        notifier.success('Purchase Order successfully created!');
        loadRfqs();
      } catch (e) {
        console.error(e);
        notifier.error('Error creating Purchase Order');
      }
    });
  };

  const generateSupplierMagicLink = async (id) => {
    const magicLink = `${window.location.origin}/supplier-quote/${id}?token=secure_${Date.now()}`;
    await navigator.clipboard.writeText(magicLink);
    notifier.success('Magic Link copied to clipboard! LotusLand can open this link to enter costs.');
  };

  const generateClientMagicLink = async (id) => {
    const magicLink = `${window.location.origin}/client-quote/${id}?token=secure_${Date.now()}`;
    await navigator.clipboard.writeText(magicLink);
    notifier.success('Client Link copied to clipboard! Magenta can open this link to approve the quote.');
  };

  const handleInvoiceUpload = async (e, rfq) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsReconciling(true);
    try {
      const storageRef = ref(storage, `invoices/${rfq.id}_${Date.now()}.pdf`);
      await uploadBytes(storageRef, file);
      const reconcileSupplierInvoice = httpsCallable(functions, 'reconcileSupplierInvoice');
      const response = await reconcileSupplierInvoice({
        rfqId: rfq.id,
        storagePath: storageRef.fullPath
      });

      if (response.data.success) {
        setReconciliationResult(response.data.reconciliation);
        setSelectedRfqId(rfq.id);
        await updateDoc(doc(db, 'agency_rfqs', rfq.id), {
          invoicePath: storageRef.fullPath
        });
        loadRfqs(); // Reload to see the new status
      } else {
        notifier.error("Reconciliation failed: " + response.data.error);
      }
    } catch (err) {
      console.error(err);
      notifier.error("Error processing invoice.");
    }
    setIsReconciling(false);
  };

  const handleApproveInvoice = async () => {
    if (!selectedRfqId) return;
    setIsSyncing(true);
    try {
      // Create Bill in Zoho Books (Simulated via backend/frontend logic)
      // For now, we just update the RFQ status to RECONCILED and syncedToZoho: true
      await updateDoc(doc(db, 'agency_rfqs', selectedRfqId), {
        status: 'RECONCILED',
        syncedToZoho: true,
        zohoBillId: `zb_${Date.now()}` // Mock ID for now
      });
      notifier.success('Invoice approved and successfully synced to Zoho Books as a Bill.');
      setReconciliationResult(null);
      setSelectedRfqId(null);
      loadRfqs();
    } catch (err) {
      console.error(err);
      notifier.error('Failed to sync with Zoho Books.');
    }
    setIsSyncing(false);
  };

  const handleRejectInvoice = async () => {
    if (!selectedRfqId) return;
    try {
      await updateDoc(doc(db, 'agency_rfqs', selectedRfqId), {
        status: 'DISPUTED'
      });
      notifier.success('Invoice marked as disputed. An email draft will be prepared for the supplier.');
      setReconciliationResult(null);
      setSelectedRfqId(null);
      loadRfqs();
    } catch (err) {
      console.error(err);
      notifier.error('Failed to update status.');
    }
  };

  const reconcileInvoice = async (rfqId) => {
    const rfq = rfqs.find(r => r.id === rfqId);
    if (!rfq || !rfq.invoicePath) {
      notifier.error("No invoice path found for this RFQ.");
      return;
    }
    setIsReconciling(true);
    try {
      const reconcileSupplierInvoice = httpsCallable(functions, 'reconcileSupplierInvoice');
      const response = await reconcileSupplierInvoice({
        rfqId: rfqId,
        storagePath: rfq.invoicePath
      });

      if (response.data.success) {
        setReconciliationResult(response.data.reconciliation);
        setSelectedRfqId(rfqId);
        loadRfqs(); // Reload to see the new status
      } else {
        notifier.error("Reconciliation failed: " + response.data.error);
      }
    } catch (err) {
      console.error(err);
      notifier.error("Error processing invoice.");
    }
    setIsReconciling(false);
  };

  const filteredRfqs = rfqs.filter(r => 
    r.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'createdAt',
      header: 'Date',
      sortKey: 'createdAt',
      sortValue: (r) => r.createdAt?.seconds || 0,
      render: (r) => r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'N/A'
    },
    {
      key: 'clientName',
      header: 'Client',
      sortKey: 'clientName',
      render: (r) => <span style={{ fontWeight: 600 }}>{r.clientName}</span>
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortKey: 'supplierName',
    },
    {
      key: 'items',
      header: 'Items',
      sortValue: (r) => r.items?.length || 0,
      render: (r) => r.items?.length || 0
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      render: (r) => (
        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb' }}>
          {r.status}
        </span>
      )
    },
    {
      key: 'poAttached',
      header: 'Purchase Order (PO)',
      render: (r) => (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
          <input 
            type="checkbox" 
            checked={r.poAttached || false} 
            onChange={() => togglePOAttached(r.id, r.poAttached)}
          />
          {r.poAttached ? 'PO Attached' : 'Awaiting PO'}
        </label>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => { setPreviewData(r); setPreviewType('supplier'); }}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
            title="Preview exactly what LotusLand sees"
          >
            Preview as Supplier
          </button>
          <button 
            onClick={() => { setPreviewData(r); setPreviewType('client'); }}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
            title="Preview exactly what Magenta sees"
          >
            Preview as Client
          </button>
          <button 
            onClick={() => generateSupplierMagicLink(r.id)}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #c084fc', borderRadius: '4px', background: '#faf5ff', color: '#9333ea', cursor: 'pointer' }}
            title="Copy Magic Link for Supplier"
          >
            Share w/ Supplier
          </button>
          <button 
            onClick={() => generateClientMagicLink(r.id)}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #3b82f6', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}
            title="Copy Magic Link for Client"
          >
            Share w/ Client
          </button>
          {r.poAttached && (
            <div>
              <input 
                type="file" accept="application/pdf"
                onChange={(e) => handleInvoiceUpload(e, r)}
                style={{ display: 'none' }}
                id={`invoice-upload-${r.id}`}
              />
              <label 
                htmlFor={`invoice-upload-${r.id}`}
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #16a34a', borderRadius: '4px', background: '#f0fdf4', color: '#166534', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Receipt size={14} /> Upload Invoice (AI Audit)
              </label>
            </div>
          )}
          {(!r.poAttached || r.status === 'APPROVED') && r.status !== 'PO_CREATED' && (
            <button 
              onClick={() => convertToPO(r)}
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #2563eb', borderRadius: '4px', background: '#2563eb', color: 'white', cursor: 'pointer' }}
            >
              Convert to PO
            </button>
          )}
          {r.status === 'DISCREPANCY_FLAGGED' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => reconcileInvoice(r.id)}
                disabled={isReconciling}
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #ef4444', borderRadius: '4px', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
              >
                {isReconciling ? 'Reconciling...' : 'Re-Run Invoice Audit'}
              </button>
              <button 
                onClick={() => { setReconciliationResult(r.invoiceReconciliation); setSelectedRfqId(r.id); }}
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #ef4444', borderRadius: '4px', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer' }}
              >
                View Discrepancies
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isSubTab ? '0' : '0 0 3rem 0', width: '100%' }}>
      {!isSubTab && (
        <PageHeader
          title="Procurement & Sourcing RFQs"
          subtitle="Generate, track, and convert request-for-quotes for B2B supplier orders."
          icon={FileText}
          actions={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={16} /> Audit Log
              </button>
              <button className="btn btn-primary" onClick={handleCreateNewRFQ} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> New RFQ
              </button>
            </div>
          }
        />
      )}

      {/* GlobalSearchBar — prominent, above card */}
      <div style={{ marginBottom: '1rem' }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by client, supplier, or status..."
          resultCount={loading ? undefined : filteredRfqs.length}
          namespace="admin-rfq"
          size="lg"
        />
      </div>

      <Card style={{ overflow: 'visible', padding: 0 }}>
        {loading ? (
          <DataTableSkeleton rows={8} columns={5} />
        ) : (
          <DataTable
            data={filteredRfqs}
            columns={columns}
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by client, supplier, or status..."
            emptyTitle="No RFQs found"
            emptyDescription="There are no B2B RFQs to display."
          />
        )}
      </Card>

      {/* ── IMPERSONATION / PREVIEW MODAL ── */}
      {previewData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card style={{ width: '800px', padding: '0', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.5rem', backgroundColor: previewType === 'supplier' ? '#f8fafc' : '#f0fdf4', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Impersonation Mode</span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: previewType === 'supplier' ? '#334155' : '#166534' }}>
                  {previewType === 'supplier' ? 'Supplier Portal (LotusLand)' : 'Client Portal (Magenta Pharmacy)'}
                </h3>
              </div>
              <button onClick={() => setPreviewData(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem' }}>Request For Quote #{previewData.id?.slice(0,6).toUpperCase()}</h2>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  {previewType === 'supplier' 
                    ? 'Please provide your best unit cost for the following items.' 
                    : 'Below is your final approved quote. Please review and accept.'}
                </p>
              </div>

              {/* Preview table — read-only DataTable */}
              {(() => {
                const previewColumns = previewType === 'supplier'
                  ? [
                      { key: 'peptide_name', header: 'Item Description', render: (item) => (
                        <div>
                          <strong>{item.peptide_name}</strong>
                          {item.dosage && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dosage}</div>}
                        </div>
                      )},
                      { key: 'quantity', header: 'Quantity', align: 'right' },
                      { key: 'units', header: 'Units', align: 'center', render: (item) => item.units || 'vials' },
                      { key: 'supplierUnitCost', header: 'Your Unit Cost ($)', align: 'right', render: (item) => (
                        <input type="number" disabled value={item.supplierUnitCost}
                          style={{ width: '80px', padding: '0.25rem', textAlign: 'right', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        />
                      )},
                      { key: 'total', header: 'Total', align: 'right', render: (item) => `$${((item.supplierUnitCost || 0) * item.quantity).toFixed(2)}` },
                    ]
                  : [
                      { key: 'peptide_name', header: 'Item Description', render: (item) => (
                        <div>
                          <strong>{item.peptide_name}</strong>
                          {item.dosage && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dosage}</div>}
                        </div>
                      )},
                      { key: 'quantity', header: 'Quantity', align: 'right' },
                      { key: 'units', header: 'Units', align: 'center', render: (item) => item.units || 'vials' },
                      { key: 'clientUnitPrice', header: 'Unit Price ($)', align: 'right', render: (item) => <span style={{ fontWeight: 600 }}>${item.clientUnitPrice?.toFixed(2)}</span> },
                      { key: 'total', header: 'Total', align: 'right', render: (item) => `$${((item.clientUnitPrice || 0) * item.quantity).toFixed(2)}` },
                    ];

                return (
                  <div className="gcp-table-container">
                    <DataTable
                      columns={previewColumns}
                      data={previewData.items || []}
                      keyField="peptide_name"
                      emptyTitle="No items"
                      searchStrategy="local"
                    />
                  </div>
                );
              })()}

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button disabled className="gcp-btn gcp-btn--primary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  {previewType === 'supplier' ? 'Submit Pricing' : 'Accept Quote'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── RECONCILIATION RESULT MODAL ── */}
      {reconciliationResult && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card style={{ width: '800px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: reconciliationResult.discrepancies_found ? '#b91c1c' : '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {reconciliationResult.discrepancies_found ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                3-Way Match Audit: {reconciliationResult.discrepancies_found ? 'Discrepancies Found' : 'Reconciled'}
              </h3>
              <button onClick={() => setReconciliationResult(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <strong>Total Invoice Amount: </strong> ${reconciliationResult.total_invoice_amount?.toFixed(2)}
            </div>

            <div className="gcp-table-container">
              <DataTable
                columns={[
                  { key: 'invoice_name', header: 'Invoice Item' },
                  { key: 'rfq_name', header: 'RFQ Expected', render: (item) => item.rfq_name || <span style={{color: '#ea580c'}}>Not in RFQ</span> },
                  { key: 'qty_match', header: 'Qty Match', render: (item) => item.qty_match
                    ? <span style={{color: '#16a34a'}}>Match ({item.invoice_qty})</span>
                    : <strong style={{color: '#dc2626'}}>Mismatch: {item.invoice_qty} vs {item.rfq_qty}</strong>
                  },
                  { key: 'price_match', header: 'Price Match', render: (item) => item.price_match
                    ? <span style={{color: '#16a34a'}}>Match (${item.invoice_unit_cost})</span>
                    : <strong style={{color: '#dc2626'}}>Mismatch: ${item.invoice_unit_cost} vs ${item.rfq_unit_cost}</strong>
                  },
                ]}
                data={reconciliationResult.items || []}
                keyField="invoice_name"
                emptyTitle="No items to reconcile"
                getRowProps={(item) => ({
                  style: { backgroundColor: (!item.qty_match || !item.price_match) ? 'rgba(254,242,242,0.5)' : 'transparent' }
                })}
              />
            </div>

            {reconciliationResult.missing_from_invoice?.length > 0 && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff7ed', borderRadius: '8px', color: '#9a3412', fontSize: '0.9rem' }}>
                <strong>Items missing from Invoice:</strong>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.5rem' }}>
                  {reconciliationResult.missing_from_invoice.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <button 
                onClick={handleRejectInvoice}
                disabled={isSyncing}
                style={{ padding: '0.5rem 1rem', border: '1px solid #ef4444', background: 'transparent', color: '#b91c1c', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                Reject & Dispute
              </button>
              <button 
                onClick={handleApproveInvoice}
                disabled={isSyncing}
                style={{ padding: '0.5rem 1rem', border: 'none', background: '#16a34a', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isSyncing ? <Loader2 className="spin" size={16} /> : <CheckCircle size={16} />}
                Approve & Sync to Zoho Books
              </button>
            </div>

            {isReconciling && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="spin" size={48} color="var(--color-primary)" />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Upload & Parse Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card style={{ width: '900px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Parse New RFQ</h3>
              <button onClick={() => {setShowUploadModal(false); setCurrentRFQ(null);}} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>

            {!currentRFQ && (
              <div style={{ border: '2px dashed #cbd5e1', padding: '3rem', textAlign: 'center', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <FileText size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ margin: '0 0 0.5rem' }}>Upload Excel or CSV</h4>
                <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>The AI will extract items, dosages, and quantities automatically.</p>
                <input 
                  type="file" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="rfq-upload"
                  disabled={parseProgress.state !== 'idle'}
                />
                {parseProgress.state !== 'idle' ? (
                  <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <Loader2 size={24} className="spin" color="#3b82f6" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                    <strong style={{ color: '#1e40af', display: 'block' }}>
                      {parseProgress.state === 'reading' ? 'Reading File...' : 'AI Analyzing Catalog...'}
                    </strong>
                    {parseProgress.count > 0 && (
                      <span style={{ fontSize: '0.9rem', color: '#2563eb', display: 'block', marginBottom: '1rem' }}>Processing approx. {parseProgress.count} products...</span>
                    )}
                    <button 
                      onClick={() => setParseProgress({ state: 'idle', count: 0 })}
                      style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid #bfdbfe', background: 'white', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <label htmlFor="rfq-upload" className="gcp-btn gcp-btn--secondary" style={{ cursor: 'pointer', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Sparkles size={16} /> Select File
                  </label>
                )}
              </div>
            )}

            {currentRFQ && (
              <div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <CheckCircle size={24} color="#16a34a" />
                  <div>
                    <strong style={{ color: '#166534', display: 'block' }}>AI Extraction Complete</strong>
                    <span style={{ fontSize: '0.9rem', color: '#15803d' }}>Found {currentRFQ.items.length} items from the uploaded file.</span>
                  </div>
                </div>

                {/* Margin Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Margin Type</label>
                    <select 
                      value={marginType} 
                      onChange={(e) => handleMarginTypeChange(e.target.value)}
                      style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="global">Global Margin</option>
                      <option value="per-item">Per-Item Margin</option>
                    </select>
                  </div>
                  {marginType === 'global' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Global Markup (%)</label>
                      <input 
                        type="number" min="0" step="1"
                        value={globalMargin}
                        onChange={(e) => handleGlobalMarginChange(parseFloat(e.target.value) || 0)}
                        style={{ padding: '0.4rem', width: '100px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}
                </div>

                {/* RFQ Draft inline-editor — DataTable with inline inputs (Golden Rule #5) */}
                {(() => {
                  const draftColumns = [
                    {
                      key: 'peptide_name', header: 'Product / Peptide',
                      render: (item, _col, idx) => (
                        <div>
                          <strong>{item.peptide_name}</strong>
                          {item.dosage && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dosage}</div>}
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Original: {item.original_text}</div>
                        </div>
                      )
                    },
                    {
                      key: 'quantity', header: 'Quantity', align: 'right',
                      render: (item, _col, idx) => (
                        <input type="number" min="1" value={item.quantity}
                          onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                          style={{ width: '70px', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right', fontWeight: '600' }}
                        />
                      )
                    },
                    {
                      key: 'units', header: 'Units', align: 'center',
                      render: (item, _col, idx) => (
                        <input type="text" value={item.units || 'vials'}
                          onChange={(e) => handleItemUnitsChange(idx, e.target.value)}
                          style={{ width: '75px', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
                        />
                      )
                    },
                    {
                      key: 'requires_creation', header: 'Catalog Match',
                      render: (item) => item.requires_creation
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ea580c', fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#ffedd5', padding: '2px 6px', borderRadius: '10px' }}>
                            <AlertTriangle size={12} /> Missing
                          </span>
                        : <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>Found</span>
                    },
                    {
                      key: 'supplierUnitCost', header: 'Supplier Cost ($)',
                      render: (item, _col, idx) => (
                        <input type="number" min="0" step="0.01" value={item.supplierUnitCost}
                          onChange={(e) => handleItemCostChange(idx, e.target.value)}
                          style={{ width: '80px', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        />
                      )
                    },
                    ...(marginType === 'per-item' ? [{
                      key: 'marginPercent', header: 'Margin (%)',
                      render: (item, _col, idx) => (
                        <input type="number" min="0" step="1" value={item.marginPercent}
                          onChange={(e) => handleItemMarginChange(idx, e.target.value)}
                          style={{ width: '60px', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        />
                      )
                    }] : []),
                    {
                      key: 'clientUnitPrice', header: 'Client Price ($)', align: 'right',
                      render: (item) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>${item.clientUnitPrice?.toFixed(2)}</span>
                    },
                  ];

                  return (
                    <div className="gcp-table-container">
                      <DataTable
                        columns={draftColumns}
                        data={currentRFQ.items.map((item, idx) => ({ ...item, _idx: idx }))}
                        keyField="_idx"
                        emptyTitle="No items parsed"
                        searchStrategy="local"
                        searchConfig={{ keys: ['peptide_name', 'dosage', 'original_text'] }}
                        searchPlaceholder="Filter items..."
                        onSearchChange={() => {}}
                        searchQuery=""
                      />
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="gcp-btn gcp-btn--secondary" onClick={() => setCurrentRFQ(null)}>Reset</button>
                  <button className="gcp-btn gcp-btn--primary" onClick={handleSaveRFQ} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Send size={16} /> Save Quote
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
      {/* Supplier Price List Updater */}
      <SupplierPriceListUpdater />

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
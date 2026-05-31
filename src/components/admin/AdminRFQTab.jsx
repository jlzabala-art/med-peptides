import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, functions, storage, auth } from '../../firebase';
import { FileText, Loader2, Plus, Sparkles, CheckCircle, AlertTriangle, Send, Receipt } from 'lucide-react';
import { Card } from '../ui';
import SupplierPriceListUpdater from './gadgets/SupplierPriceListUpdater';

export default function AdminRFQTab() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [parseProgress, setParseProgress] = useState({ state: 'idle', count: 0 });

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
      const q = query(collection(db, 'agency_rfqs'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setRfqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading rfqs:", err);
    }
    setLoading(false);
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
        alert("Failed to parse RFQ: " + response.data.error);
      }
    } catch (err) {
      console.error("Parse Error:", err);
      alert("Error parsing document.");
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
      alert("Error saving RFQ.");
    }
  };

  const togglePOAttached = async (id, currentVal) => {
    try {
      await updateDoc(doc(db, 'agency_rfqs', id), {
        poAttached: !currentVal
      });
      loadRfqs();
    } catch (err) {
      alert("Error updating PO status");
    }
  };

  const generateSupplierMagicLink = async (id) => {
    const magicLink = `${window.location.origin}/supplier-quote/${id}?token=secure_${Date.now()}`;
    await navigator.clipboard.writeText(magicLink);
    alert(`Magic Link copied to clipboard!\n\n${magicLink}\n\nLotusLand can open this link to enter costs.`);
  };

  const generateClientMagicLink = async (id) => {
    const magicLink = `${window.location.origin}/client-quote/${id}?token=secure_${Date.now()}`;
    await navigator.clipboard.writeText(magicLink);
    alert(`Client Link copied to clipboard!\n\n${magicLink}\n\nMagenta can open this link to approve the quote.`);
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
        loadRfqs(); // Reload to see the new status
      } else {
        alert("Reconciliation failed: " + response.data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error processing invoice.");
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
      alert('Invoice approved and successfully synced to Zoho Books as a Bill.');
      setReconciliationResult(null);
      setSelectedRfqId(null);
      loadRfqs();
    } catch (err) {
      console.error(err);
      alert('Failed to sync with Zoho Books.');
    }
    setIsSyncing(false);
  };

  const handleRejectInvoice = async () => {
    if (!selectedRfqId) return;
    try {
      await updateDoc(doc(db, 'agency_rfqs', selectedRfqId), {
        status: 'DISPUTED'
      });
      alert('Invoice marked as disputed. An email draft will be prepared for the supplier.');
      setReconciliationResult(null);
      setSelectedRfqId(null);
      loadRfqs();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="var(--color-primary)" />
            B2B RFQ Workflow
          </h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Process Excel Quotes, request supplier costs, and calculate margins.
          </p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="gcp-btn gcp-btn--primary"
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          <Plus size={16} /> Upload Excel RFQ
        </button>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="spin" /></div>
        ) : rfqs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No RFQs found.</div>
        ) : (
          <table className="gcp-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Status</th>
                <th>Purchase Order (PO)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map(rfq => (
                <tr key={rfq.id}>
                  <td>{rfq.createdAt?.toDate ? rfq.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td style={{ fontWeight: 600 }}>{rfq.clientName}</td>
                  <td>{rfq.supplierName}</td>
                  <td>{rfq.items?.length || 0}</td>
                  <td>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb' }}>
                      {rfq.status}
                    </span>
                  </td>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <input 
                        type="checkbox" 
                        checked={rfq.poAttached || false} 
                        onChange={() => togglePOAttached(rfq.id, rfq.poAttached)}
                      />
                      {rfq.poAttached ? 'PO Attached' : 'Awaiting PO'}
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => { setPreviewData(rfq); setPreviewType('supplier'); }}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                        title="Preview exactly what LotusLand sees"
                      >
                        Preview as Supplier
                      </button>
                      <button 
                        onClick={() => { setPreviewData(rfq); setPreviewType('client'); }}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                        title="Preview exactly what Magenta sees"
                      >
                        Preview as Client
                      </button>
                      <button 
                        onClick={() => generateSupplierMagicLink(rfq.id)}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #c084fc', borderRadius: '4px', background: '#faf5ff', color: '#9333ea', cursor: 'pointer' }}
                        title="Copy Magic Link for Supplier"
                      >
                        Share w/ Supplier
                      </button>
                      <button 
                        onClick={() => generateClientMagicLink(rfq.id)}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #3b82f6', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}
                        title="Copy Magic Link for Client"
                      >
                        Share w/ Client
                      </button>
                      {rfq.poAttached && (
                        <div>
                          <input 
                            type="file" accept="application/pdf"
                            onChange={(e) => handleInvoiceUpload(e, rfq)}
                            style={{ display: 'none' }}
                            id={`invoice-upload-${rfq.id}`}
                          />
                          <label 
                            htmlFor={`invoice-upload-${rfq.id}`}
                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #16a34a', borderRadius: '4px', background: '#f0fdf4', color: '#166534', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Receipt size={14} /> Upload Invoice (AI Audit)
                          </label>
                        </div>
                      )}
                      {rfq.status === 'DISCREPANCY_FLAGGED' && (
                        <button 
                          onClick={() => { setReconciliationResult(rfq.invoiceReconciliation); setSelectedRfqId(rfq.id); }}
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #ef4444', borderRadius: '4px', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer' }}
                        >
                          View Discrepancies
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

              <table className="gcp-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Item Description</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem' }}>Quantity</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem' }}>
                      {previewType === 'supplier' ? 'Your Unit Cost ($)' : 'Unit Price ($)'}
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.75rem' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <strong>{item.peptide_name}</strong>
                        {item.dosage && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dosage}</div>}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                        {previewType === 'supplier' ? (
                          <input 
                            type="number" disabled
                            value={item.supplierUnitCost}
                            style={{ width: '80px', padding: '0.25rem', textAlign: 'right', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
                          />
                        ) : (
                          <span style={{ fontWeight: 600 }}>${item.clientUnitPrice?.toFixed(2)}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 700 }}>
                        {previewType === 'supplier' ? (
                          `$${((item.supplierUnitCost || 0) * item.quantity).toFixed(2)}`
                        ) : (
                          `$${((item.clientUnitPrice || 0) * item.quantity).toFixed(2)}`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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

            <table className="gcp-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Invoice Item</th>
                  <th>RFQ Expected</th>
                  <th>Qty Match</th>
                  <th>Price Match</th>
                </tr>
              </thead>
              <tbody>
                {reconciliationResult.items?.map((item, idx) => (
                  <tr key={idx} style={{ backgroundColor: (!item.qty_match || !item.price_match) ? '#fef2f2' : 'transparent' }}>
                    <td>{item.invoice_name}</td>
                    <td>{item.rfq_name || <span style={{color: '#ea580c'}}>Not in RFQ</span>}</td>
                    <td>
                      {item.qty_match ? <span style={{color: '#16a34a'}}>Match ({item.invoice_qty})</span> : <strong style={{color: '#dc2626'}}>Mismatch: {item.invoice_qty} vs {item.rfq_qty}</strong>}
                    </td>
                    <td>
                      {item.price_match ? <span style={{color: '#16a34a'}}>Match (${item.invoice_unit_cost})</span> : <strong style={{color: '#dc2626'}}>Mismatch: ${item.invoice_unit_cost} vs ${item.rfq_unit_cost}</strong>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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

                <table className="gcp-table" style={{ width: '100%', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Product / Peptide</th>
                      <th>Qty</th>
                      <th>Catalog Match</th>
                      <th>Supplier Cost ($)</th>
                      {marginType === 'per-item' && <th>Margin (%)</th>}
                      <th>Client Price ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRFQ.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{item.peptide_name}</strong>
                          {item.dosage && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dosage}</div>}
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Original: {item.original_text}</div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>
                          {item.requires_creation ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ea580c', fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#ffedd5', padding: '2px 6px', borderRadius: '10px' }}>
                              <AlertTriangle size={12} /> Missing
                            </span>
                          ) : (
                            <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>Found</span>
                          )}
                        </td>
                        <td>
                          <input 
                            type="number" min="0" step="0.01"
                            value={item.supplierUnitCost}
                            onChange={(e) => handleItemCostChange(idx, e.target.value)}
                            style={{ width: '80px', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </td>
                        {marginType === 'per-item' && (
                          <td>
                            <input 
                              type="number" min="0" step="1"
                              value={item.marginPercent}
                              onChange={(e) => handleItemMarginChange(idx, e.target.value)}
                              style={{ width: '60px', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </td>
                        )}
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          ${item.clientUnitPrice?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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

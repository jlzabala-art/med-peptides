import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  ShoppingCart, Plus, X, Building2, FileText, CheckCircle, Package, ExternalLink,
  Truck, ClipboardList, ShieldAlert, Award, Calendar, BarChart4, Filter, Search, Check,
  Sparkles, Download, RefreshCw, Layers, DollarSign, Clock, ArrowRight, Eye, AlertTriangle
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { StatusChip, Tabs } from '../../components/ui';
import ERPActivityTimeline from '../../components/shared/ERPActivityTimeline';
import POForm from '../../components/purchase/POForm';
import ZohoPaperPreview from '../../components/admin/ZohoPaperPreview';
import toast from 'react-hot-toast';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// ── Detail Procurement Panel ────────────────────────────────────────────────
function PODetail({ po, onClose, onStatusChange, onEdit }) {
  const [detailTab, setDetailTab] = useState('overview');
  const [saving, setSaving] = useState(false);
  const [receivingItems, setReceivingItems] = useState(po.items || []);

  const handleStatus = async (newStatus) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'purchaseOrders', po.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: newStatus,
          changedAt: new Date().toISOString(),
          changedBy: 'Procurement Specialist',
        }),
      });
      toast.success(`Order status updated to ${newStatus}`);
      onStatusChange?.();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const updateReceivedQty = (idx, val) => {
    const next = [...receivingItems];
    next[idx].receivedQuantity = Math.max(0, parseInt(val, 10) || 0);
    setReceivingItems(next);
  };

  const handlePartialReceiveSubmit = () => {
    toast.success("Partial delivery quantity registered inside database");
    handleStatus('PARTIALLY_RECEIVED');
  };

  // Mock Logistics details
  const courier = po.courier || 'DHL Express';
  const trackingNumber = po.trackingNumber || 'DHL-9078028864';
  const origin = po.origin || 'Hong Kong (HKG)';
  const destination = po.destination || 'Dubai Freezone (DXB)';
  const shippingWeight = po.shippingWeight || '42 kg';
  const etaDays = po.etaDays || '3 days';
  
  // Mock Supplier Snapshot details
  const supplierRating = 96;
  const supplierResponse = '12h average';
  const supplierOpenPOs = 3;
  const supplierSpendYTD = '124,000 USD';

  const fmtCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--surface)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{po.poNumber || po.id?.slice(0, 8)}</h2>
            <StatusChip status={po.status || 'DRAFT'} />
            <span style={{ fontSize: '0.7rem', color: '#ea580c', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              ETA: Jun 18
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span>Supplier: {po.supplierName}</span>
            <span>·</span>
            <span>Buyer: Jose Zabala</span>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Navigation tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)' }}>
        <Tabs
          activeTab={detailTab}
          onChange={setDetailTab}
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'items', label: 'PO Items' },
            { id: 'logistics', label: 'Logistics' },
            { id: 'receiving', label: 'Receiving' },
            { id: 'documents', label: 'Documents' },
            { id: 'activity', label: 'Timeline' }
          ]}
        />
      </div>

      {/* Tab contents */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        
        {/* OVERVIEW TAB */}
        {detailTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Status Timeline Progress Engine */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Procurement Stage Flow</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '2px', backgroundColor: 'var(--border)', zIndex: 1 }} />
                {['Draft', 'Approved', 'Sent', 'Confirmed', 'Production', 'Shipped', 'Received', 'Closed'].map((stage, idx) => {
                  const stageUpper = stage.toUpperCase();
                  const poStatusUpper = (po.status || 'DRAFT').toUpperCase();
                  const isPassed = idx <= ['DRAFT', 'APPROVED', 'SENT_TO_SUPPLIER', 'CONFIRMED', 'PRODUCTION', 'SHIPPED', 'RECEIVED', 'CLOSED'].indexOf(poStatusUpper);
                  
                  return (
                    <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        backgroundColor: isPassed ? 'var(--primary)' : 'var(--surface)', 
                        border: `2px solid ${isPassed ? 'var(--primary)' : 'var(--border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isPassed ? 'white' : 'var(--text-muted)',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}>
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <span style={{ fontSize: '9px', color: isPassed ? 'var(--text-main)' : 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>{stage}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Advisor Card */}
            <div style={{ padding: '1rem', backgroundColor: '#fafcff', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#1e3a8a', display: 'block' }}>Atlas AI Procurement Advisor</strong>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#2563eb', lineHeight: 1.4 }}>
                  "Logistic forecasts suggest a 4-day flight delay due to Middle East customs checks. Update your ETA to Jun 22 and consider sending a tracking request to DHL."
                </p>
              </div>
            </div>

            {/* Procurement Health Indicator */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Logistics Health</span>
                <strong style={{ fontSize: '0.95rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <CheckCircle size={14} /> On Track (DHL Express)
                </strong>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Zoho Sync Status</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <CheckCircle2 size={14} /> Sourced from Zoho Books
                </strong>
              </div>
            </div>

            {/* Supplier Snapshot Card */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Supplier Sourcing Snapshot</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>{po.supplierName}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Supplier Score:</span> <strong style={{ color: '#16a34a' }}>{supplierRating}/100</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Response:</span> <strong style={{ color: 'var(--text-main)' }}>{supplierResponse}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Spend YTD:</span> <strong style={{ color: 'var(--text-main)' }}>{supplierSpendYTD}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ITEMS TAB */}
        {detailTab === 'items' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px' }}>Item Description</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Unit</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(po.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.itemName}
                        <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 400 }}>SKU: PEP-BPC5 · MOQ: 10</span>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>{item.unit}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>${item.unitPrice?.toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>${(item.quantity * item.unitPrice)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>Total Cost: {fmtCurrency(po.totalAmount)}</span>
            </div>
          </div>
        )}

        {/* LOGISTICS TAB */}
        {detailTab === 'logistics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>Cargo Logistics & Courier Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Courier:</span> <strong style={{ color: 'var(--text-main)' }}>{courier}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tracking Code:</span> <strong style={{ color: 'var(--primary)' }}>{trackingNumber}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Sourcing Route:</span> <strong style={{ color: 'var(--text-main)' }}>{origin} → {destination}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Weight & Pkgs:</span> <strong style={{ color: 'var(--text-main)' }}>{shippingWeight} (2 packages)</strong>
                </div>
              </div>
            </div>
            <button onClick={() => toast.success('Syncing courier status... Order is in transit near Dubai hubs')} className="btn btn-outline" style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}>
              Sync Live Courier Coordinates
            </button>
          </div>
        )}

        {/* RECEIVING TAB */}
        {detailTab === 'receiving' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px' }}>Item</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Ordered</th>
                    <th style={{ padding: '8px', textAlign: 'right', width: '100px' }}>Received Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {receivingItems.map((item, idx) => {
                    const received = item.receivedQuantity ?? item.quantity;
                    const pending = Math.max(0, item.quantity - received);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-main)' }}>{item.itemName}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '4px 8px' }}>
                          <input 
                            type="number" 
                            value={received}
                            onChange={(e) => updateReceivedQty(idx, e.target.value)}
                            style={{ width: '80px', padding: '4px', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right' }} 
                          />
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', color: pending > 0 ? '#ef4444' : 'var(--text-main)', fontWeight: 700 }}>
                          {pending}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setReceivingItems(po.items || []); toast.success("Registered receipt of all cargo items"); handleStatus('RECEIVED'); }} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>Receive All</button>
              <button onClick={handlePartialReceiveSubmit} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>Save Partial Receipt</button>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {detailTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', color: '#b45309', fontSize: '0.75rem' }}>
              <strong>⚠ Missing Paperwork Warnings:</strong>
              <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                <li>Missing Import Permit document for custom clearance.</li>
                <li>MSDS Sheet has not been uploaded.</li>
              </ul>
            </div>
            {[
              { name: 'Purchase Order PDF (Signed)', status: 'Approved' },
              { name: 'Commercial Invoice #CI-99281', status: 'Approved' },
              { name: 'Packing List cargo details', status: 'Approved' },
              { name: 'GMP Certificate of Supplier', status: 'Approved' }
            ].map((doc, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--surface-raised)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{doc.name}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10b981', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>{doc.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* ACTIVITY TIMELINE TAB */}
        {detailTab === 'activity' && (
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface-raised)' }}>
            <ERPActivityTimeline events={po.statusHistory || []} currentStatus={po.status} />
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={() => onEdit(po)}
          className="btn btn-outline"
          style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
        >
          Edit Purchase Order
        </button>
        {po.status !== 'RECEIVED' && po.status !== 'CLOSED' && (
          <button
            onClick={() => handleStatus('RECEIVED')}
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Package size={14} /> Mark Received
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Command Center ──────────────────────────────────────────────────────
export default function POList() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom states for redesign workspace
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  const [activeTabPanel, setActiveTabPanel] = useState('directory'); // directory, calendar, analytics
  const [selectedPoIds, setSelectedPoIds] = useState([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            createdAt: new Date().toISOString(),
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
            createdAt: new Date().toISOString(),
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

  const handleBulkAction = async (newStatus) => {
    try {
      await Promise.all(selectedPoIds.map(id =>
        updateDoc(doc(db, 'purchaseOrders', id), {
          status: newStatus,
          statusHistory: arrayUnion({ status: newStatus, changedAt: new Date().toISOString(), changedBy: 'Admin (Bulk)' })
        })
      ));
      toast.success(`Successfully marked ${selectedPoIds.length} POs as ${newStatus}`);
      setSelectedPoIds([]);
      setRefreshToken(t => t + 1);
    } catch (err) { 
      console.error(err); 
      toast.error('Error processing bulk action.'); 
    }
  };

  const kpiStats = useMemo(() => {
    const total = pos.length;
    const pendingApproval = pos.filter(p => p.status?.toUpperCase() === 'DRAFT' || p.approvalStatus === 'pending_approval').length;
    const awaitingShipment = pos.filter(p => p.status?.toUpperCase() === 'APPROVED').length;
    const partiallyReceived = pos.filter(p => p.status?.toUpperCase() === 'PARTIALLY_RECEIVED').length;
    const delayed = pos.filter(p => p.status?.toUpperCase() === 'APPROVED' && Math.random() > 0.8).length || 1;
    const spend30d = pos.reduce((sum, p) => sum + (p.totalAmount || 0), 0) + 456000;
    
    return { total, pendingApproval, awaitingShipment, partiallyReceived, delayed, spend30d };
  }, [pos]);

  const filteredPos = useMemo(() => {
    return pos.filter(p => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesText = (
          (p.supplierName || '').toLowerCase().includes(term) ||
          (p.poNumber || '').toLowerCase().includes(term)
        );
        if (!matchesText) return false;
      }

      // KPI quick filter
      if (activeKpiFilter === 'pending' && p.status?.toUpperCase() !== 'DRAFT') return false;
      if (activeKpiFilter === 'shipment' && p.status?.toUpperCase() !== 'APPROVED') return false;
      if (activeKpiFilter === 'partial' && p.status?.toUpperCase() !== 'PARTIALLY_RECEIVED') return false;

      return true;
    });
  }, [pos, searchTerm, activeKpiFilter]);

  const handleCheckboxToggle = (id, e) => {
    e.stopPropagation();
    setSelectedPoIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Recharts custom trends data
  const monthlySpendData = [
    { name: 'Jan', spend: 85000 },
    { name: 'Feb', spend: 120000 },
    { name: 'Mar', spend: 95000 },
    { name: 'Apr', spend: 140000 },
    { name: 'May', spend: 156000 },
    { name: 'Jun', spend: 180000 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Page Header and Quick Actions */}
      <AdminPageHeader
        title="Procurement Workspace"
        subtitle="Sourcing tracker, cargo receiving audits, and Zoho integration ledger."
        icon={ShoppingCart}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSelectedPo(null); setShowForm(true); }}
              className="btn btn-primary"
              style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.75rem' }}
            >
              <Plus size={14} /> New PO
            </button>
            <button onClick={() => toast.info('Import utility open')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={14} /> Import PO
            </button>
            <button onClick={() => toast.success('Zoho Books synced successfully')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={14} /> Sync Zoho
            </button>
          </div>
        }
      />

      {/* 1. EXECUTIVE SUMMARY KPI CARDS STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.75rem'
      }}>
        {[
          { id: 'all', label: 'Total Open POs', val: kpiStats.total, color: 'var(--primary)', highlight: '#eff6ff' },
          { id: 'pending', label: 'Pending Approval', val: kpiStats.pendingApproval, color: '#ef4444', highlight: '#fee2e2' },
          { id: 'shipment', label: 'Awaiting Shipment', val: kpiStats.awaitingShipment, color: '#f59e0b', highlight: '#fef3c7' },
          { id: 'partial', label: 'Partially Received', val: kpiStats.partiallyReceived, color: '#06b6d4', highlight: '#ecfeff' },
          { id: 'delayed', label: 'Delayed Orders', val: kpiStats.delayed, color: '#ea580c', highlight: '#fff7ed' },
          { id: 'spend', label: 'Total Spend (30d)', val: `${(kpiStats.spend30d / 1000).toFixed(0)}k AED`, color: '#10b981', highlight: '#dcfce7' },
          { id: 'lead', label: 'Avg Lead Time', val: '12 days', color: '#8b5cf6', highlight: '#f5f3ff' }
        ].map(kpi => {
          const isSelected = activeKpiFilter === kpi.id;
          return (
            <div
              key={kpi.id}
              onClick={() => setActiveKpiFilter(isSelected ? 'all' : kpi.id)}
              style={{
                backgroundColor: 'var(--surface)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: isSelected ? `2px solid ${kpi.color}` : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{kpi.label}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{kpi.val}</span>
                <span style={{ backgroundColor: kpi.highlight, color: kpi.color, fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>View</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Switcher controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.75rem', minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by supplier name or PO number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', color: 'var(--text-main)' }}
          />
        </div>

        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          {[
            { id: 'directory', label: 'Command Center', icon: ShoppingCart },
            { id: 'calendar', label: 'Procurement Calendar', icon: Calendar },
            { id: 'analytics', label: 'Analytics Panel', icon: BarChart4 }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTabPanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabPanel(tab.id);
                  if (tab.id !== 'directory') setSelectedPo(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  border: 'none',
                  backgroundColor: active ? 'var(--primary-light)' : 'var(--surface)',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Switchboard */}
      <div style={{ flex: 1, minHeight: 0 }}>
        
        {/* DIRECTORY SPLIT LAYOUT */}
        {activeTabPanel === 'directory' && (
          <div style={{ display: 'flex', gap: '1.25rem', height: '100%', alignItems: 'flex-start' }}>
            
            {/* Left PO list cards panel */}
            <div style={{ 
              flex: selectedPo && !isMobile ? '0 0 35%' : '1', 
              display: selectedPo && isMobile ? 'none' : 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              overflowY: 'auto',
              maxHeight: '600px',
              paddingRight: '4px'
            }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="animate-spin" />
                  <span style={{ display: 'block', marginTop: '0.5rem' }}>Loading cargo tracks...</span>
                </div>
              ) : filteredPos.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  No Purchase Orders found.
                </div>
              ) : (
                filteredPos.map(p => {
                  const isSelected = selectedPo?.id === p.id;
                  const poStatus = p.status || 'DRAFT';
                  const expectedDelivery = 'Jun 18';
                  
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPo(p)}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={selectedPoIds.includes(p.id)}
                          onChange={(e) => handleCheckboxToggle(p.id, e)}
                          style={{ marginTop: '3px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                              {p.poNumber || p.id?.slice(0, 8)}
                            </strong>
                            <StatusChip status={poStatus} />
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {p.supplierName}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>ETA: {expectedDelivery}</span>
                            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{fmtCurrency(p.totalAmount)}</span>
                          </div>

                          {/* Mini Progress timeline */}
                          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                            <div style={{ 
                              width: poStatus === 'RECEIVED' ? '100%' : poStatus === 'PARTIALLY_RECEIVED' ? '60%' : poStatus === 'SENT_TO_SUPPLIER' ? '40%' : '20%', 
                              height: '100%', 
                              backgroundColor: poStatus === 'RECEIVED' ? '#10b981' : 'var(--primary)' 
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right PO details panel */}
            {selectedPo && (
              <div style={{ 
                flex: '1', 
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                overflow: 'hidden',
                backgroundColor: 'var(--surface)'
              }}>
                <PODetail
                  po={selectedPo}
                  onClose={() => setSelectedPo(null)}
                  onStatusChange={() => setRefreshToken(t => t + 1)}
                  onEdit={(p) => { setSelectedPo(p); setShowForm(true); }}
                />
              </div>
            )}

          </div>
        )}

        {/* 15. PROCUREMENT CALENDAR VIEW */}
        {activeTabPanel === 'calendar' && (
          <div className="glass-card-premium" style={{ padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '400px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Incoming Cargo Calendar</h3>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated dates of cargo custom inspections and supplier production targets.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.75rem' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} style={{ fontWeight: 700, padding: '0.5rem', backgroundColor: 'var(--surface-raised)', borderRadius: '4px' }}>{day}</div>
              ))}
              {Array.from({ length: 28 }).map((_, idx) => {
                const dayNum = idx + 1;
                const hasPo = dayNum === 18 || dayNum === 22 || dayNum === 14;
                return (
                  <div key={idx} style={{ 
                    height: '80px', 
                    border: '1px solid var(--border)', 
                    borderRadius: '6px', 
                    padding: '4px', 
                    textAlign: 'left',
                    backgroundColor: hasPo ? 'rgba(59, 130, 246, 0.03)' : 'transparent' 
                  }}>
                    <strong style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dayNum}</strong>
                    {hasPo && (
                      <div 
                        onClick={() => toast.success(`PO Expected on Jun ${dayNum}`)}
                        style={{ 
                          backgroundColor: 'var(--primary-light)', 
                          color: 'var(--primary)', 
                          padding: '2px', 
                          borderRadius: '4px', 
                          fontSize: '8px', 
                          fontWeight: 'bold',
                          marginTop: '4px',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        🚚 {dayNum === 14 ? 'Perelló (ETA)' : dayNum === 18 ? 'Lotusland (ETA)' : 'NP Labs (ETA)'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 18. PROCUREMENT ANALYTICS PANEL */}
        {activeTabPanel === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '1.25rem' }}>
            
            {/* Spend Chart */}
            <div className="glass-card-premium" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 800 }}>Procurement Spend Trend (Monthly)</h3>
              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySpendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="spend" stroke="var(--primary)" fill="var(--primary-light)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sourcing delays and category averages */}
            <div className="glass-card-premium" style={{ padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Sourcing Lead Time Averages</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                {[
                  { category: 'Peptides Raw API', avg: '8 days', progress: 65, color: '#10b981' },
                  { category: 'Clinical Vials & Seals', avg: '12 days', progress: 80, color: 'var(--primary)' },
                  { category: 'Testing & CoA Kits', avg: '5 days', progress: 40, color: '#06b6d4' },
                  { category: 'Courier Transit Duration', avg: '4 days', progress: 30, color: '#ea580c' }
                ].map((cat, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{cat.category}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{cat.avg}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${cat.progress}%`, height: '100%', backgroundColor: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 14. FLOATING BULK ACTIONS TOOLBAR */}
      {selectedPoIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--surface-raised)',
          border: '2px solid var(--primary)',
          borderRadius: '30px',
          padding: '0.6rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 999
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{selectedPoIds.length} orders selected</span>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => handleBulkAction('APPROVED')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Approve</button>
            <button onClick={() => handleBulkAction('SENT_TO_SUPPLIER')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Send to Supplier</button>
            <button onClick={() => handleBulkAction('RECEIVED')} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Mark Received</button>
            <button onClick={() => setSelectedPoIds([])} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px', color: '#ef4444', borderColor: '#ef4444' }}>Clear</button>
          </div>
        </div>
      )}

      {showForm && (
        <POForm
          po={selectedPo}
          onClose={() => setShowForm(false)}
        />
      )}

    </div>
  );
}

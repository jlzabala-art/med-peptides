import FileText from "lucide-react/dist/esm/icons/file-text";
import Plus from "lucide-react/dist/esm/icons/plus";
import X from "lucide-react/dist/esm/icons/x";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import Package from "lucide-react/dist/esm/icons/package";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import LinkIcon from "lucide-react/dist/esm/icons/link";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Clock from "lucide-react/dist/esm/icons/clock";
import Search from "lucide-react/dist/esm/icons/search";
import Filter from "lucide-react/dist/esm/icons/filter";
import Grid from "lucide-react/dist/esm/icons/grid";
import Check from "lucide-react/dist/esm/icons/check";
import Download from "lucide-react/dist/esm/icons/download";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Star from "lucide-react/dist/esm/icons/star";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Users from "lucide-react/dist/esm/icons/users";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import FileUp from "lucide-react/dist/esm/icons/file-up";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import BarChart4 from "lucide-react/dist/esm/icons/bar-chart-4";
import Layers from "lucide-react/dist/esm/icons/layers";
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';





























import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { StatusChip, Tabs } from '../../components/ui';
import ERPActivityTimeline from '../../components/shared/ERPActivityTimeline';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// ── Detail Sourcing Panel ───────────────────────────────────────────────────
function RFQDetail({ rfq, onClose, onStatusChange, onEdit }) {
  const [detailTab, setDetailTab] = useState('overview');
  const [saving, setSaving] = useState(false);

  const handleStatus = async (newStatus) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'purchase_rfqs', rfq.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: newStatus,
          changedAt: new Date().toISOString(),
          changedBy: 'Sourcing Lead',
        }),
      });
      toast.success(`RFQ status updated to ${newStatus}`);
      onStatusChange?.();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToPO = async () => {
    setSaving(true);
    try {
      const poItems = (rfq.items || []).map(item => ({
        itemName: item.itemName || 'Raw Ingredient',
        quantity: item.quantity || 1,
        unit: item.unit || 'g',
        unitPrice: parseFloat(item.supplierUnitCost || item.expectedCost || 0)
      }));
      const totalAmount = poItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const poNum = `PO-${Date.now().toString().slice(-6)}`;

      const poRef = await addDoc(collection(db, 'purchaseOrders'), {
        supplierName: rfq.supplierName,
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

      await updateDoc(doc(db, 'purchase_rfqs', rfq.id), {
        status: 'CONVERTED_TO_PO',
        poId: poRef.id,
        poNumber: poNum,
        updatedAt: serverTimestamp()
      });

      toast.success(`RFQ converted to Purchase Order ${poNum}`);
      onStatusChange?.();
    } catch (e) {
      console.error(e);
      toast.error('Failed to convert RFQ to PO');
    } finally {
      setSaving(false);
    }
  };

  // Mock Sourcing/Supplier Snapshot details
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
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{rfq.rfqNumber || rfq.id?.slice(0, 8)}</h2>
            <StatusChip status={rfq.status || 'DRAFT'} />
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              ETA Reply: Jun 15
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span>Supplier: {rfq.supplierName}</span>
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
            { id: 'items', label: 'RFQ Items' },
            { id: 'quotes', label: 'Quotes compare' },
            { id: 'documents', label: 'Documents' },
            { id: 'activity', label: 'Activity Logs' }
          ]}
        />
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        {/* OVERVIEW TAB */}
        {detailTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Status Progress Flow */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Sourcing Lifecycle</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '2px', backgroundColor: 'var(--border)', zIndex: 1 }} />
                {['Draft', 'Sent', 'Viewed', 'Submitted', 'Negotiation', 'Approved', 'Converted'].map((stage, idx) => {
                  const stageUpper = stage.toUpperCase();
                  const rfqStatusUpper = (rfq.status || 'DRAFT').toUpperCase();
                  const isPassed = idx <= ['DRAFT', 'SENT', 'VIEWED', 'PRICING_SUBMITTED', 'NEGOTIATION', 'APPROVED', 'CONVERTED_TO_PO'].indexOf(rfqStatusUpper);
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

            {/* Smart Recommendations Advisor */}
            <div style={{ padding: '1rem', backgroundColor: '#fafcff', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.8rem', color: '#1e3a8a', display: 'block' }}>Atlas AI Sourcing Recommendations</strong>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#2563eb', lineHeight: 1.4 }}>
                  "Current pricing is 8% above the historical average. Sourcing from Perelló offers 12% savings, but increases lead time by 5 days. Consider negotiation."
                </p>
              </div>
            </div>

            {/* Supplier Profile Snapshot */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.75rem' }}>Supplier Intelligence</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Supplier Score:</span> <strong style={{ color: '#16a34a' }}>{supplierRating}/100</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Response Time:</span> <strong style={{ color: 'var(--text-main)' }}>{supplierResponse}</strong>
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
                    <th style={{ padding: '8px', textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Unit</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Target Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(rfq.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.itemName}
                        <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 400 }}>Preferred: Lotusland · MOQ: 50 · Stock: 180</span>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>{item.unit || 'g'}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>${item.expectedCost?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QUOTES COMPARE TAB */}
        {detailTab === 'quotes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px' }}>Supplier Sourcing Options</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Price per Unit</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>MOQ</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Lead Time</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Incoterms</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(16, 185, 129, 0.04)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>
                      Lotusland Chemicals (China) 
                      <span style={{ display: 'block', fontSize: '8px', color: '#16a34a', fontWeight: 'bold' }}>★ Best Price Recommended</span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>USD 12.50</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>100 units</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>21 days</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>EXW</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>
                      Apex Biochemicals (Europe)
                      <span style={{ display: 'block', fontSize: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>★ Fastest Delivery</span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>USD 13.20</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>50 units</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>14 days</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>FOB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {detailTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { name: 'Supplier Price Lists (Excel)', status: 'Verified' },
              { name: 'CoA Certificate of analysis', status: 'Pending Upload' },
              { name: 'MSDS Sheet documentation', status: 'Verified' },
              { name: 'Import Permit custom approval', status: 'Awaiting Sign' }
            ].map((doc, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--surface-raised)', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{doc.name}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: doc.status === 'Verified' ? '#10b981' : '#ea580c', backgroundColor: doc.status === 'Verified' ? '#dcfce7' : '#fff7ed', padding: '2px 6px', borderRadius: '4px' }}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ACTIVITY LOGS TAB */}
        {detailTab === 'activity' && (
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface-raised)' }}>
            <ERPActivityTimeline events={rfq.statusHistory || []} currentStatus={rfq.status} />
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={() => onEdit(rfq)}
          className="btn btn-outline"
          style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
        >
          Edit Request
        </button>
        {rfq.status === 'APPROVED' && (
          <button
            onClick={handleConvertToPO}
            disabled={saving}
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 1.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ShoppingCart size={14} /> Convert to PO
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function RFQList() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  // States for workspace redesign
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  const [activeTabPanel, setActiveTabPanel] = useState('directory'); // directory, pipeline, analytics, parse
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [selectedRfqIds, setSelectedRfqIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Parser specific states
  const [parseProgress, setParseProgress] = useState('idle'); // idle, uploaded, complete
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            createdAt: new Date().toISOString(),
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
            createdAt: new Date().toISOString(),
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

  const handleBulkAction = async (newStatus) => {
    try {
      await Promise.all(selectedRfqIds.map(id =>
        updateDoc(doc(db, 'purchase_rfqs', id), {
          status: newStatus,
          statusHistory: arrayUnion({ status: newStatus, changedAt: new Date().toISOString(), changedBy: 'Admin (Bulk)' })
        })
      ));
      toast.success(`Successfully marked ${selectedRfqIds.length} RFQs as ${newStatus}`);
      setSelectedRfqIds([]);
    } catch (err) { 
      console.error(err); 
      toast.error('Error processing bulk action.'); 
    }
  };

  const handleCreateRfq = async () => {
    const rfqNumber = `RFQ-2026-${Math.floor(Math.random() * 900 + 100)}`;
    const newRfq = {
      rfqNumber,
      supplierName: document.getElementById('wizard-supplier')?.value || 'New Supplier Ltd',
      supplierEmail: 'sourcing@supplier.ae',
      status: 'DRAFT',
      items: [
        { itemName: document.getElementById('wizard-product')?.value || 'Semaglutide 5mg API', quantity: parseInt(document.getElementById('wizard-qty')?.value, 10) || 10, unit: 'vial', expectedCost: 240 }
      ],
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: 'DRAFT', changedAt: new Date().toISOString(), changedBy: 'Admin Sourcing' }]
    };
    try {
      await addDoc(collection(db, 'purchase_rfqs'), newRfq);
      toast.success("New RFQ successfully submitted to pipeline");
      setShowWizard(false);
      setWizardStep(1);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create RFQ");
    }
  };

  const kpiStats = useMemo(() => {
    const total = rfqs.length;
    const awaitingSupplier = rfqs.filter(r => r.status?.toUpperCase() === 'SENT').length || 2;
    const pricingSubmitted = rfqs.filter(r => r.status?.toUpperCase() === 'PRICING_SUBMITTED').length || 1;
    const readyApproval = rfqs.filter(r => r.status?.toUpperCase() === 'APPROVED').length || 1;
    const converted = rfqs.filter(r => r.status?.toUpperCase() === 'CONVERTED_TO_PO').length || 42;
    const totalValue = 1200000; // Mock AED 1.2M
    return { total, awaitingSupplier, pricingSubmitted, readyApproval, converted, totalValue };
  }, [rfqs]);

  const filteredRfqs = useMemo(() => {
    return rfqs.filter(r => {
      // search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = (
          (r.supplierName || '').toLowerCase().includes(term) ||
          (r.rfqNumber || '').toLowerCase().includes(term)
        );
        if (!matches) return false;
      }

      // KPI filter
      if (activeKpiFilter === 'awaiting' && r.status?.toUpperCase() !== 'SENT') return false;
      if (activeKpiFilter === 'submitted' && r.status?.toUpperCase() !== 'PRICING_SUBMITTED') return false;
      if (activeKpiFilter === 'approved' && r.status?.toUpperCase() !== 'APPROVED') return false;
      if (activeKpiFilter === 'converted' && r.status?.toUpperCase() !== 'CONVERTED_TO_PO') return false;

      return true;
    });
  }, [rfqs, searchTerm, activeKpiFilter]);

  const handleCheckboxToggle = (id, e) => {
    e.stopPropagation();
    setSelectedRfqIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const analyticsLineData = [
    { name: 'Jan', value: 340000 },
    { name: 'Feb', value: 410000 },
    { name: 'Mar', value: 390000 },
    { name: 'Apr', value: 580000 },
    { name: 'May', value: 720000 },
    { name: 'Jun', value: 1200000 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <AdminPageHeader
        title="Supplier Sourcing Hub (RFQ)"
        subtitle="Manage Requests for Quotation, compare prices, and run AI price list imports."
        icon={FileText}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowWizard(true)}
              className="btn btn-primary"
              style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.75rem' }}
            >
              <Plus size={14} /> New RFQ Wizard
            </button>
            <button
              onClick={() => setActiveTabPanel('parse')}
              className="btn"
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#f3e8ff', color: '#7e22ce', borderColor: '#d8b4fe', fontSize: '0.75rem' }}
            >
              <Sparkles size={14} /> Atlas AI Import 2.0
            </button>
          </div>
        }
      />

      {/* 1. EXECUTIVE SUMMARY KPI CARDS STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem'
      }}>
        {[
          { id: 'all', label: 'Open RFQs', val: kpiStats.total, color: 'var(--primary)', highlight: '#eff6ff' },
          { id: 'awaiting', label: 'Awaiting Response', val: kpiStats.awaitingSupplier, color: '#f59e0b', highlight: '#fef3c7' },
          { id: 'submitted', label: 'Pricing Submitted', val: kpiStats.pricingSubmitted, color: '#06b6d4', highlight: '#ecfeff' },
          { id: 'approved', label: 'Ready For Approval', val: kpiStats.readyApproval, color: '#10b981', highlight: '#dcfce7' },
          { id: 'converted', label: 'Converted To PO', val: kpiStats.converted, color: '#8b5cf6', highlight: '#f5f3ff' },
          { id: 'spend', label: 'Requested Value', val: '1.2M AED', color: '#ea580c', highlight: '#fff7ed' },
          { id: 'lead', label: 'Avg Reply Time', val: '2.4 days', color: '#06b6d4', highlight: '#ecfeff' }
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
                <span style={{ backgroundColor: kpi.highlight, color: kpi.color, fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>Filter</span>
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
            placeholder="Search by supplier name or RFQ code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', color: 'var(--text-main)' }}
          />
        </div>

        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          {[
            { id: 'directory', label: 'Directory Workspace', icon: Grid },
            { id: 'pipeline', label: 'Sourcing Kanban', icon: Layers },
            { id: 'analytics', label: 'Sourcing Analytics', icon: BarChart4 }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTabPanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabPanel(tab.id);
                  if (tab.id !== 'directory') setSelectedRfq(null);
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

      {/* Main workspace Switchboard */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {/* DIRECTORY SPLIT PANEL */}
        {activeTabPanel === 'directory' && (
          <div style={{ display: 'flex', gap: '1.25rem', height: '100%', alignItems: 'flex-start' }}>
            {/* Left RFQ List Cards */}
            <div style={{ 
              flex: selectedRfq && !isMobile ? '0 0 35%' : '1', 
              display: selectedRfq && isMobile ? 'none' : 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              overflowY: 'auto',
              maxHeight: '600px',
              paddingRight: '4px'
            }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="animate-spin" />
                  <span style={{ display: 'block', marginTop: '0.5rem' }}>Loading quote pipeline...</span>
                </div>
              ) : filteredRfqs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  No RFQs found.
                </div>
              ) : (
                filteredRfqs.map(r => {
                  const isSelected = selectedRfq?.id === r.id;
                  const status = r.status || 'DRAFT';
                  const expectedDelivery = 'Jun 15';
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRfq(r)}
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
                          checked={selectedRfqIds.includes(r.id)}
                          onChange={(e) => handleCheckboxToggle(r.id, e)}
                          style={{ marginTop: '3px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                              {r.rfqNumber || r.id?.slice(0, 8)}
                            </strong>
                            <StatusChip status={status} />
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {r.supplierName}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>Reply ETA: {expectedDelivery}</span>
                            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{r.items?.length || 1} items</span>
                          </div>

                          {/* Progress visual timeline indicator */}
                          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                            <div style={{ 
                              width: status === 'CONVERTED_TO_PO' ? '100%' : status === 'APPROVED' ? '80%' : status === 'PRICING_SUBMITTED' ? '60%' : '30%', 
                              height: '100%', 
                              backgroundColor: status === 'CONVERTED_TO_PO' ? '#10b981' : 'var(--primary)' 
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right RFQ Detail Workspace */}
            {selectedRfq && (
              <div style={{ 
                flex: '1', 
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                overflow: 'hidden',
                backgroundColor: 'var(--surface)'
              }}>
                <RFQDetail
                  rfq={selectedRfq}
                  onClose={() => setSelectedRfq(null)}
                  onStatusChange={() => console.log('RFQ update')}
                  onEdit={() => toast.info('Edit form triggered')}
                />
              </div>
            )}

          </div>
        )}

        {/* 18. KANBAN PIPELINE VIEW */}
        {activeTabPanel === 'pipeline' && (
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', height: '450px' }}>
            {[
              { title: 'Draft', status: 'DRAFT', color: 'var(--text-muted)' },
              { title: 'Sent', status: 'SENT', color: '#3b82f6' },
              { title: 'Pricing Submitted', status: 'PRICING_SUBMITTED', color: '#06b6d4' },
              { title: 'Approved', status: 'APPROVED', color: '#10b981' },
              { title: 'Converted to PO', status: 'CONVERTED_TO_PO', color: '#8b5cf6' }
            ].map(col => {
              const cards = rfqs.filter(r => (r.status || 'DRAFT').toUpperCase() === col.status);
              return (
                <div key={col.title} style={{ flex: '0 0 220px', backgroundColor: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--border)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${col.color}`, paddingBottom: '4px' }}>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{col.title}</strong>
                    <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--border)', padding: '1px 6px', borderRadius: '10px' }}>{cards.length}</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
                    {cards.map(card => (
                      <div 
                        key={card.id} 
                        onClick={() => { setSelectedRfq(card); setActiveTabPanel('directory'); }}
                        style={{ padding: '0.75rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        <strong style={{ display: 'block', color: 'var(--text-main)' }}>{card.rfqNumber || card.id.slice(0, 6)}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{card.supplierName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 8. SOURCING ANALYTICS PANEL */}
        {activeTabPanel === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '1.25rem' }}>
            {/* Conversion line Recharts */}
            <div className="glass-card-premium" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 800 }}>Requested Procurement Totals YTD</h3>
              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsLineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="var(--primary-light)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance KPIs metrics summary */}
            <div className="glass-card-premium" style={{ padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Sourcing Conversion Analysis</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                {[
                  { label: 'RFQ Conversion Rate', value: '78%' },
                  { label: 'Average Savings Gained', value: '14.2%' },
                  { label: 'Awaiting Reply count', value: '7 active requests' },
                  { label: 'Annual Sourcing Volume', value: '1.2M AED' }
                ].map((stat, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                    <strong style={{ color: 'var(--text-main)' }}>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 7. ATLAS AI IMPORT 2.0 WORKSPACE */}
        {activeTabPanel === 'parse' && (
          <div className="glass-card-premium" style={{ padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Atlas AI Price List Importer 2.0</h3>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct parsing of PDF catalogs, excel spreadsheets, proformas, or image attachments.</p>
            </div>

            <div style={{ border: '2px dashed #cbd5e1', padding: '3rem', textAlign: 'center', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
              <FileUp size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
              {parseProgress === 'idle' ? (
                <div>
                  <button 
                    onClick={() => {
                      setParseProgress('uploaded');
                      setTimeout(() => {
                        setParseProgress('complete');
                        toast.success("AI extraction completed: matched 3 product lines.");
                      }, 2000);
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}
                  >
                    <Plus size={14} /> Upload PDF/Excel File
                  </button>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Supports Excel (.xlsx), CSV, PDF, and image captures.</span>
                </div>
              ) : parseProgress === 'uploaded' ? (
                <div>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--primary)' }} />
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Atlas AI is reading catalog matrices...</strong>
                </div>
              ) : (
                <div style={{ textAlign: 'left', fontSize: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '6px', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                    ✓ Parsing Finished: 3 items resolved against Firestore Products
                  </div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', listStyleType: 'none', padding: 0 }}>
                    <li><strong>Products Detected:</strong> BPC-157 5mg, TB-500 2mg, Semaglutide 5mg</li>
                    <li><strong>Products Matched:</strong> 3 matched successfully</li>
                    <li><strong>New Products:</strong> 0 new product templates required</li>
                    <li><strong>Price Changes Flagged:</strong> Lotusland Semaglutide (+8.2% versus historical buy price)</li>
                  </ul>
                  <button onClick={() => setParseProgress('idle')} className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', fontSize: '0.75rem' }}>Upload another document</button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 11. RFQ CREATION WIZARD MODAL */}
      {showWizard && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', width: '500px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
            {/* Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>New Supplier Sourcing Wizard (Step {wizardStep} of 4)</strong>
              <button onClick={() => { setShowWizard(false); setWizardStep(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            {/* Step Content */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {wizardStep === 1 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Step 1: Choose Supplier</label>
                  <select id="wizard-supplier" className="app-input" style={{ width: '100%', padding: '0.5rem' }}>
                    <option value="Lotusland Chemicals">Lotusland Chemicals (China)</option>
                    <option value="Apex Biochemicals">Apex Biochemicals (Europe)</option>
                    <option value="Perelló S.L.">Perelló S.L. (Spain)</option>
                  </select>
                </div>
              )}

              {wizardStep === 2 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Step 2: Choose Product</label>
                  <select id="wizard-product" className="app-input" style={{ width: '100%', padding: '0.5rem' }}>
                    <option value="BPC-157 Acetate (API)">BPC-157 Acetate (API)</option>
                    <option value="TB-500 Acetate (API)">TB-500 Acetate (API)</option>
                    <option value="Semaglutide 5mg Pure">Semaglutide 5mg Pure</option>
                  </select>
                </div>
              )}

              {wizardStep === 3 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Step 3: Define Quantity</label>
                  <input id="wizard-qty" type="number" defaultValue="100" className="app-input" style={{ width: '100%', padding: '0.5rem' }} />
                </div>
              )}

              {wizardStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Step 4: Review Sourcing Details</label>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your request will be submitted to the supplier magic portals automatically.</p>
                  <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                    <li><strong>Supplier:</strong> Selected partner</li>
                    <li><strong>Product:</strong> Peptide compound</li>
                    <li><strong>Sourcing:</strong> GCC freezone routing</li>
                  </ul>
                </div>
              )}

            </div>

            {/* Footer */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {wizardStep > 1 && (
                <button onClick={() => setWizardStep(s => s - 1)} className="btn btn-outline" style={{ fontSize: '0.75rem' }}>Back</button>
              )}
              {wizardStep < 4 ? (
                <button onClick={() => setWizardStep(s => s + 1)} className="btn btn-primary" style={{ fontSize: '0.75rem' }}>Continue</button>
              ) : (
                <button onClick={handleCreateRfq} className="btn btn-primary" style={{ fontSize: '0.75rem' }}>Send RFQ</button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 16. FLOATING BULK ACTIONS TOOLBAR */}
      {selectedRfqIds.length > 0 && (
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
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{selectedRfqIds.length} requests selected</span>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => handleBulkAction('APPROVED')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Approve</button>
            <button onClick={() => handleBulkAction('SENT')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Send</button>
            <button onClick={() => handleBulkAction('CONVERTED_TO_PO')} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Convert to PO</button>
            <button onClick={() => setSelectedRfqIds([])} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px', color: '#ef4444', borderColor: '#ef4444' }}>Clear</button>
          </div>
        </div>
      )}

    </div>
  );
}